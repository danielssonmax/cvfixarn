"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { JOBS_BASE_PATH } from "@/lib/jobs/format"
import type { JobMatchResult } from "@/lib/jobs/types"

/**
 * "N lediga jobb som <yrke> i <ort>" for a CV, asked from /api/jobs/match.
 *
 *   const match = useJobMatch({ title, location, experienceTitles })
 *   <JobMatchCard result={match} />
 *
 * Returns an answer, or null while there is none yet for what is typed now:
 *
 *   "ok"             an occupation and its counts
 *   "no_occupation"  no occupation in the title, or a title shorter than three
 *                    characters once the typing has stopped
 *   "unavailable"    the request failed or the jobs API is down
 *   null             the session or the answer has not arrived, or a title is
 *                    being typed and is still shorter than three characters
 *
 * Only "ok" has anything to show. Nothing in here throws, so a caller only has
 * to skip rendering on everything else. The editor line also uses the
 * difference between null (keep what is on screen) and an answer without
 * anything to show (take it away).
 *
 * While a new lookup is under way the previous answer stays, so a card that is
 * already on screen changes once instead of blinking out and back in.
 */

export type JobMatchQuery = {
  title?: string | null
  location?: string | null
  /** Job titles from the CV, most recent first. Only the first three are sent. */
  experienceTitles?: Array<string | null | undefined> | null
}

const ENDPOINT = "/api/jobs/match"
const DEBOUNCE_MS = 800
const MIN_TITLE_LENGTH = 3
const MAX_EXPERIENCE_TITLES = 3
const MAX_TEXT_LENGTH = 120
// The route gives up after 8 s; a little longer than that and the request is dead.
const REQUEST_TIMEOUT_MS = 10000
// The server fetches counts live, so this cache is what keeps the editor from
// asking again for a title and place it already has an answer for.
const CACHE_TTL_MS = 30 * 60 * 1000
const CACHE_MAX_ENTRIES = 50

const cache = new Map<string, { result: JobMatchResult; expires: number }>()

function readCache(key: string): JobMatchResult | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expires < Date.now()) {
    cache.delete(key)
    return null
  }
  return entry.result
}

function writeCache(key: string, result: JobMatchResult) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, { result, expires: Date.now() + CACHE_TTL_MS })
}

// Lowercased because the server ignores case: "Kock" and "kock" share one lookup.
const tidy = (value: unknown): string =>
  typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").toLowerCase().slice(0, MAX_TEXT_LENGTH)
    : ""

const isOwnJobsPath = (value: unknown): boolean =>
  typeof value === "string" && value.startsWith(JOBS_BASE_PATH)

/**
 * Only what the card can safely render gets through. "unavailable" and anything
 * unexpected become null, which also keeps them out of the cache; the hook
 * reports that null as "unavailable".
 */
function readResult(data: any): JobMatchResult | null {
  if (!data || typeof data !== "object") return null
  if (data.status === "no_occupation") return { status: "no_occupation" }
  if (data.status !== "ok" || typeof data.occupationLabel !== "string") return null

  const tiers = (Array.isArray(data.tiers) ? data.tiers : []).filter(
    (tier: any) =>
      tier && typeof tier.name === "string" && Number.isFinite(tier.count) && isOwnJobsPath(tier.href)
  )
  const jobs = (Array.isArray(data.jobs) ? data.jobs : []).filter(
    (job: any) => job && typeof job.headline === "string" && isOwnJobsPath(job.path)
  )
  return {
    status: "ok",
    occupationLabel: data.occupationLabel,
    ...(typeof data.locationLabel === "string" ? { locationLabel: data.locationLabel } : {}),
    tiers,
    jobs,
  }
}

async function requestMatch(
  body: string,
  signedIn: boolean,
  signal: AbortSignal
): Promise<JobMatchResult | null> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (signedIn) {
      const { data } = await supabase.auth.getSession()
      if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`
    }
    const response = await fetch(ENDPOINT, { method: "POST", headers, body, signal })
    if (!response.ok) return null
    return readResult(await response.json())
  } catch {
    return null
  }
}

/** undefined until the session has been read, then the user's id or null. */
function useSessionUserId(): string | null | undefined {
  const [userId, setUserId] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    const apply = (session: { user?: { id?: string } } | null | undefined) => {
      if (active) setUserId(session?.user?.id ?? null)
    }
    let unsubscribe = () => {}
    try {
      supabase.auth.getSession().then(
        ({ data }) => apply(data.session),
        () => apply(null)
      )
      const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session))
      unsubscribe = () => data.subscription.unsubscribe()
    } catch {
      apply(null)
    }
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return userId
}

export function useJobMatch(query: JobMatchQuery | null | undefined): JobMatchResult | null {
  const userId = useSessionUserId()
  const [result, setResult] = useState<JobMatchResult | null>(null)
  const previousTitle = useRef("")

  const title = tidy(query?.title)
  const experienceTitles: string[] = []
  ;(Array.isArray(query?.experienceTitles) ? query.experienceTitles : []).forEach((value) => {
    const text = tidy(value)
    if (text && experienceTitles.length < MAX_EXPERIENCE_TITLES && experienceTitles.indexOf(text) === -1) {
      experienceTitles.push(text)
    }
  })
  // A string, so the effect below only runs again when what we would send changes.
  const body =
    title.length >= MIN_TITLE_LENGTH
      ? JSON.stringify({ title, location: tidy(query?.location), experienceTitles })
      : null
  const authKnown = userId !== undefined

  useEffect(() => {
    if (!body) {
      setResult(null)
      // A title too short to look up names no occupation. That is only said
      // once the typing has stopped: until then null lets the editor line keep
      // what it shows while the title is being retyped.
      const settle = setTimeout(() => setResult({ status: "no_occupation" }), DEBOUNCE_MS)
      return () => clearTimeout(settle)
    }
    if (userId === undefined) return

    // Signed-in answers include the ads, anonymous ones do not: keep them apart.
    const key = `${userId || "anon"}:${body}`
    const cached = readCache(key)
    if (cached) {
      setResult(cached)
      return
    }

    let superseded = false
    const controller = new AbortController()
    let giveUp: ReturnType<typeof setTimeout> | undefined
    // A title that arrives whole was loaded or pasted, not typed: no need to wait.
    const delay = previousTitle.current === "" ? 0 : DEBOUNCE_MS
    const timer = setTimeout(async () => {
      giveUp = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      const answer = await requestMatch(body, userId !== null, controller.signal)
      clearTimeout(giveUp)
      if (superseded) return
      if (answer) writeCache(key, answer)
      setResult(answer || { status: "unavailable" })
    }, delay)

    return () => {
      superseded = true
      clearTimeout(timer)
      clearTimeout(giveUp)
      controller.abort()
    }
    // title: every keystroke in a title that is still too short restarts the wait above.
  }, [body, userId, title])

  // After the lookup effect, so that one still sees the title from the render before.
  useEffect(() => {
    if (authKnown) previousTitle.current = title
  }, [title, authKnown])

  if (body) return result
  // Without a lookup the state can still hold the answer for an earlier title.
  return result?.status === "no_occupation" ? result : null
}
