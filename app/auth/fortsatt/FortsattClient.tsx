"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

/**
 * Landing page for the auto-login link in lifecycle emails.
 *
 * Verification happens in the browser, not in a route handler, because this app
 * keeps its session in two places: localStorage (lib/supabase, which AuthContext
 * reads) and cookies (auth-helpers, which the route handlers read). Only the
 * browser can write the first one, so we verify here and then mirror the tokens
 * into cookies through the existing /api/auth/sync endpoint — the same pattern
 * resume-editor.tsx already uses after a login.
 */

type Status = "verifying" | "expired" | "error" | "sent"

const FALLBACK_PATH = "/profil/skapa-cv"

/** Only same-origin paths, so ?next= can never become an open redirect. */
function safeNext(raw: string | null): string {
  if (!raw) return FALLBACK_PATH
  if (!raw.startsWith("/") || raw.startsWith("//")) return FALLBACK_PATH
  return raw
}

export default function FortsattClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<Status>("verifying")
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [errorText, setErrorText] = useState("")

  // React 18 StrictMode double-invokes effects in dev; a magic token is single
  // use, so the second run would always fail. Guard it.
  const hasRun = useRef(false)

  const next = safeNext(searchParams.get("next"))

  /** Mirrors a freshly created session into cookies for the route handlers. */
  const syncCookies = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return false

    try {
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      })
    } catch (error) {
      // Cookie sync is best-effort: the client-side session already works, so
      // do not strand the user on this page over it.
      console.error("Kunde inte synka sessionen till cookies:", error)
    }
    return true
  }, [])

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const run = async () => {
      const tokenHash = searchParams.get("token_hash")
      const code = searchParams.get("code")

      try {
        if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "magiclink",
          })
          if (error) {
            setStatus("expired")
            return
          }
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            setStatus("expired")
            return
          }
        }

        // No token in the URL is fine if they are already signed in — and it is
        // also the path taken when detectSessionInUrl consumed a #fragment.
        const signedIn = await syncCookies()
        if (!signedIn) {
          setStatus("expired")
          return
        }

        router.replace(next)
      } catch (error: unknown) {
        console.error("Inloggning via e-postlänk misslyckades:", error)
        setErrorText(error instanceof Error ? error.message : "Okänt fel")
        setStatus("error")
      }
    }

    run()
  }, [searchParams, router, next, syncCookies])

  const requestNewLink = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return

    setIsSending(true)
    setErrorText("")

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/fortsatt?next=${encodeURIComponent(
            next
          )}`,
        },
      })
      if (error) throw error
      setStatus("sent")
    } catch (error: unknown) {
      setErrorText(
        error instanceof Error ? error.message : "Kunde inte skicka länken. Försök igen."
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {status === "verifying" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-[#00bf63]" />
            <h1 className="mt-5 text-xl font-semibold text-gray-900">
              Loggar in dig...
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Vi hämtar ditt CV. Det tar bara ett ögonblick.
            </p>
          </>
        )}

        {status === "sent" && (
          <>
            <h1 className="text-xl font-semibold text-gray-900">Kolla din inkorg</h1>
            <p className="mt-2 text-sm text-gray-600">
              Vi har skickat en ny inloggningslänk till{" "}
              <span className="font-medium text-gray-900">{email}</span>. Den tar dig
              direkt till ditt CV.
            </p>
          </>
        )}

        {(status === "expired" || status === "error") && (
          <>
            <h1 className="text-xl font-semibold text-gray-900">
              {status === "expired" ? "Länken har gått ut" : "Något gick fel"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {status === "expired"
                ? "Inloggningslänkar gäller en begränsad tid och kan bara användas en gång. Fyll i din e-postadress så skickar vi en ny."
                : "Vi kunde inte logga in dig automatiskt. Fyll i din e-postadress så skickar vi en ny länk."}
            </p>

            <form onSubmit={requestNewLink} className="mt-5 space-y-3 text-left">
              <label htmlFor="email" className="sr-only">
                E-postadress
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="din@epost.se"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#00bf63] focus:ring-2 focus:ring-[#00bf63]/20"
              />
              <button
                type="submit"
                disabled={isSending}
                className="w-full rounded-lg bg-[#00bf63] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00a857] disabled:opacity-60"
              >
                {isSending ? "Skickar..." : "Skicka ny länk"}
              </button>
              {errorText && <p className="text-sm text-red-600">{errorText}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
