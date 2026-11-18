"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// With the flag on, the editor reads "jobb" and opens "anpassa efter annons"
// with this ad's text; with it off the parameter is ignored there.
const CV_OPTIMIZE_ENABLED = process.env.NEXT_PUBLIC_CV_OPTIMIZE_ENABLED === "true"

/**
 * The CV action on an ad page. A signed-in user with a CV goes to their latest
 * CV, everyone else starts a new one. Both links carry the ad id as "jobb".
 *
 * Until the lookup has answered (and whenever it fails) the link is the
 * "Skapa ditt CV" one, so the button always works.
 */
export function JobCvCta({ jobId, className }: { jobId: string; className?: string }) {
  const { user } = useAuth()
  const userId: string | null = user?.id ?? null
  const [latestCvId, setLatestCvId] = useState<string | null>(null)

  useEffect(() => {
    setLatestCvId(null)
    if (!userId) return
    let cancelled = false
    const findLatestCv = async () => {
      try {
        const { data } = await supabase
          .from("cvs")
          .select("id")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1)
        if (!cancelled && data?.[0]?.id) setLatestCvId(String(data[0].id))
      } catch {
        // Keep the "Skapa ditt CV" link.
      }
    }
    findLatestCv()
    return () => {
      cancelled = true
    }
  }, [userId])

  const jobb = encodeURIComponent(jobId)
  const href = latestCvId
    ? `/profil/skapa-cv?id=${encodeURIComponent(latestCvId)}&jobb=${jobb}`
    : `/profil/skapa-cv?new=true&jobb=${jobb}`

  return (
    // The longer label has to wrap on a narrow phone; the base button never wraps.
    <Button
      asChild
      variant="outline"
      size="lg"
      className={cn("h-auto min-h-12 whitespace-normal py-2.5 text-center", className)}
    >
      <Link href={href} prefetch={false}>
        {!latestCvId
          ? "Skapa ditt CV"
          : CV_OPTIMIZE_ENABLED
            ? "Anpassa mitt CV för det här jobbet"
            : "Uppdatera ditt CV för det här jobbet"}
      </Link>
    </Button>
  )
}
