import Link from "next/link"
import { listPlaceLandings, listProfessionLandings } from "@/lib/jobs/landing"
import type { Landing } from "@/lib/jobs/landing"

const linkClass = "text-ink-600 underline-offset-4 hover:text-ink hover:underline"

function LinkGroup({ title, landings }: { title: string; landings: Landing[] }) {
  if (landings.length === 0) return null
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        {landings.map((landing) => (
          <li key={landing.slug}>
            {/* No prefetch: this is a list of some forty pages, each backed by upstream calls. */}
            <Link href={landing.path} prefetch={false} className={linkClass}>
              {landing.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Quiet links between the landing pages, so each of them can be reached from the others. */
export function LandingLinks({ currentSlug }: { currentSlug: string }) {
  const others = (landings: Landing[]) => landings.filter((landing) => landing.slug !== currentSlug)
  return (
    <nav aria-labelledby="fler-lediga-jobb" className="space-y-5 border-t border-ink-100 pt-8">
      <h2 id="fler-lediga-jobb" className="text-lg font-semibold text-ink">
        Fler lediga jobb
      </h2>
      <LinkGroup title="Lediga jobb per yrke" landings={others(listProfessionLandings())} />
      <LinkGroup title="Lediga jobb per ort" landings={others(listPlaceLandings())} />
    </nav>
  )
}
