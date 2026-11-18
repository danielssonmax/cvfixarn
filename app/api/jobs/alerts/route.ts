import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import { parseJobsSearchQuery } from "@/lib/jobs/format"
import { resolveLocation } from "@/lib/jobs/locations"
import { matchJobsForCv } from "@/lib/jobs/match"
import type { JobMatchResult } from "@/lib/jobs/types"
import {
  apiRateLimit,
  checkRateLimit,
  createRateLimitResponse,
  getClientIP,
  paymentRateLimit,
} from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * The weekly job email, per signed-in user (Authorization: Bearer <Supabase access token>).
 *
 *   GET     -> { status: "on", occupationLabel, locationName } | { status: "off" } | { status: "opted_out" }
 *   POST    { title, location } -> { status: "on", ... }   switch on, an explicit click in the editor
 *   DELETE  -> { status: "off" }                           switch off
 *
 * POST never stores what the client typed. It runs the same match as the CV
 * widget and stores the occupation and place that came out of it, so the cron
 * reruns a search the API is known to understand. Without a recognised
 * occupation there is nothing honest to send: 422 { error: "no_occupation" }.
 *
 * Other answers: 401 not signed in, 409 { error: "opted_out" } when the user
 * has unsubscribed from all our email or switched the job email off through
 * the link in one (job_alerts.unsubscribed_at; only the undo link behind that
 * same link clears it, DELETE here leaves it alone), 429 rate limited, 503
 * { error: "unavailable" } when the jobs API or the job_alerts table is not
 * there, or when the account has no address the cron could send to. The editor
 * treats everything except "on" and "off" as "show nothing".
 */

const TABLE = "job_alerts"
const MIGRATION = "supabase/migrations/20261118000000_create_job_alerts.sql"
const MAX_BODY_LENGTH = 2000
const MAX_TEXT_LENGTH = 120
const MATCH_BUDGET_MS = 8000

type AlertRow = {
  active: boolean
  occupation_label: string
  location_name: string | null
  unsubscribed_at?: string | null
}

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } })

const unavailable = () => json({ error: "unavailable" }, 503)

function stateOf(row: AlertRow | null) {
  return row?.active
    ? { status: "on" as const, occupationLabel: row.occupation_label, locationName: row.location_name }
    : { status: "off" as const }
}

function getAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/** The owner applies migrations by hand, so the code can be live before the table is. */
function logDbError(what: string, error: { code?: string; message?: string }) {
  if (error.code === "PGRST205" || error.code === "42P01") {
    console.warn(`[job-alerts] ${what}: table public.${TABLE} does not exist yet. Apply ${MIGRATION}.`)
  } else {
    console.error(`[job-alerts] ${what} failed:`, error.message)
  }
}

async function signedInUserId(request: Request): Promise<string | null> {
  try {
    // Loaded on demand, like in the match route: lib/subscription pulls in Stripe.
    const { getUserIdFromRequest } = await import("@/lib/subscription")
    return await getUserIdFromRequest(request)
  } catch (error) {
    console.warn("[job-alerts] could not verify session:", error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * true = has unsubscribed from all lifecycle email. null = could not tell, or
 * the account has no premium row with an address: the cron sends to
 * premium.email only, so the email must not be offered when that is missing.
 */
async function hasOptedOut(admin: SupabaseClient, uid: string): Promise<boolean | null> {
  const { data, error } = await admin
    .from("premium")
    .select("email, marketing_opt_out")
    .eq("uid", uid)
    .maybeSingle()
  if (error) {
    console.error("[job-alerts] opt-out lookup failed:", error.message)
    return null
  }
  if (!data || typeof data.email !== "string" || !data.email.includes("@")) return null
  return data.marketing_opt_out === true
}

type Guard = { response: Response } | { admin: SupabaseClient; uid: string }

async function guard(request: Request, write: boolean): Promise<Guard> {
  // Reads share the general API allowance; switching on and off gets the
  // 10-per-minute one, since switching on costs several calls to the jobs API.
  const limit = await checkRateLimit(
    write ? paymentRateLimit : apiRateLimit,
    `job-alerts:${getClientIP(request)}`,
    request
  )
  if (!limit.success) return { response: createRateLimitResponse(limit.remaining, limit.reset) }

  const uid = await signedInUserId(request)
  if (!uid) return { response: json({ error: "unauthorized" }, 401) }

  const admin = getAdmin()
  if (!admin) {
    console.error("[job-alerts] Supabase service role credentials are not configured")
    return { response: unavailable() }
  }
  return { admin, uid }
}

function withBudget(match: Promise<JobMatchResult>): Promise<JobMatchResult> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<JobMatchResult>((resolve) => {
    timer = setTimeout(() => resolve({ status: "unavailable" }), MATCH_BUDGET_MS)
  })
  return Promise.race([match, timeout]).finally(() => clearTimeout(timer))
}

export async function GET(request: Request) {
  const guarded = await guard(request, false)
  if ("response" in guarded) return guarded.response
  const { admin, uid } = guarded

  try {
    const [alert, optedOut] = await Promise.all([
      admin
        .from(TABLE)
        .select("active, occupation_label, location_name, unsubscribed_at")
        .eq("uid", uid)
        .maybeSingle(),
      hasOptedOut(admin, uid),
    ])
    if (alert.error) {
      logDbError("read", alert.error)
      return unavailable()
    }
    if (optedOut === null) return unavailable()
    const row = alert.data as AlertRow | null
    // They said no to email from us, or to this email through the link in one.
    // The editor does not offer the job email then.
    if (optedOut || row?.unsubscribed_at) return json({ status: "opted_out" })
    return json(stateOf(row))
  } catch (error) {
    console.error("[job-alerts] read failed:", error instanceof Error ? error.message : error)
    return unavailable()
  }
}

export async function POST(request: Request) {
  const guarded = await guard(request, true)
  if ("response" in guarded) return guarded.response
  const { admin, uid } = guarded

  let body: unknown
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_LENGTH) return json({ error: "Request too large" }, 400)
    body = JSON.parse(raw)
  } catch {
    return json({ error: "Invalid JSON" }, 400)
  }
  const { title, location = "" } = (body && typeof body === "object" ? body : {}) as Record<string, unknown>
  if (typeof title !== "string" || typeof location !== "string") {
    return json({ error: "title and location must be strings" }, 400)
  }

  try {
    const optedOut = await hasOptedOut(admin, uid)
    if (optedOut === null) return unavailable()
    if (optedOut) return json({ error: "opted_out" }, 409)

    // Switched off through the link in an email: whoever reads that mailbox
    // said stop, and a click in the editor must not undo it.
    const existing = await admin.from(TABLE).select("unsubscribed_at").eq("uid", uid).maybeSingle()
    if (existing.error) {
      logDbError("switch on", existing.error)
      return unavailable()
    }
    if (existing.data?.unsubscribed_at) return json({ error: "opted_out" }, 409)

    const place = location.slice(0, MAX_TEXT_LENGTH)
    const match = await withBudget(
      matchJobsForCv({ title: title.slice(0, MAX_TEXT_LENGTH), location: place }, { withJobs: false })
    )
    if (match.status === "no_occupation") return json({ error: "no_occupation" }, 422)
    if (match.status !== "ok") return unavailable()

    // The country tier is always last, and its link carries the exact q the
    // counts in the widget were made with.
    const countryHref = match.tiers[match.tiers.length - 1]?.href || ""
    const searchText = parseJobsSearchQuery(new URLSearchParams(countryHref.split("?")[1] || "")).q
    if (!searchText) return unavailable()
    const resolved = resolveLocation(place)

    const row = {
      uid,
      search_text: searchText,
      occupation_label: match.occupationLabel,
      location_kind: resolved ? resolved.kind : null,
      location_id: resolved ? resolved.id : null,
      location_name: resolved ? resolved.name : null,
      active: true,
      updated_at: new Date().toISOString(),
    }
    // last_sent_at is not part of the row on purpose: switching off and on
    // again must not make next Monday repeat ads that were already sent.
    // unsubscribed_at is left out too, so this can never clear an opt-out.
    const { data, error } = await admin
      .from(TABLE)
      .upsert(row, { onConflict: "uid" })
      .select("active, occupation_label, location_name")
      .single()
    if (error) {
      logDbError("switch on", error)
      return unavailable()
    }
    return json(stateOf(data as AlertRow))
  } catch (error) {
    console.error("[job-alerts] switch on failed:", error instanceof Error ? error.message : error)
    return unavailable()
  }
}

export async function DELETE(request: Request) {
  const guarded = await guard(request, true)
  if ("response" in guarded) return guarded.response
  const { admin, uid } = guarded

  try {
    const { error } = await admin
      .from(TABLE)
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq("uid", uid)
    if (error) {
      logDbError("switch off", error)
      return unavailable()
    }
    return json({ status: "off" })
  } catch (error) {
    console.error("[job-alerts] switch off failed:", error instanceof Error ? error.message : error)
    return unavailable()
  }
}
