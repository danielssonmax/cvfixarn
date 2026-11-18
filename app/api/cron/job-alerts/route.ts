import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  getResend,
  getSiteUrl,
  getFromAddress,
  getReplyToAddress,
} from "@/lib/email/client"
import { buildJobAlertEmail, JOB_ALERT_MAX_JOBS } from "@/lib/email/templates/job-alert"
import { createUnsubscribeToken, UNSUBSCRIBE_SCOPE_JOB_ALERT } from "@/lib/email/tokens"
import { searchJobs } from "@/lib/jobs/client"
import { buildJobsSearchHref } from "@/lib/jobs/format"
import { getMunicipalityById, getRegionById, regionOf } from "@/lib/jobs/locations"
import type { JobAdSummary, JobSearchParams } from "@/lib/jobs/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Weekly job email. Scheduled from vercel.json as several runs on Monday
 * morning: each run sends at most JOB_ALERTS_BATCH_LIMIT emails, and the later
 * runs continue with whoever was not reached or whose send failed.
 *
 * For everyone who switched it on in the editor (public.job_alerts, active):
 * rerun their stored search for ads published since the last email, and send
 * the newest ones. No new ads means no email that week.
 *
 * Safety properties, the same ones as the abandoned-CV reminder:
 *   - Only rows a user created with an explicit click are read. There is no
 *     back catalogue to blast on first deploy.
 *   - An email_reminders row with a per-week reminder_type is inserted BEFORE
 *     the send. UNIQUE(uid, reminder_type) makes a second firing in the same
 *     week harmless; a failed send deletes the row so a rerun can try again.
 *   - The jobs API is asked before anything is reserved, so an outage can
 *     never leave a reservation behind.
 *   - last_sent_at moves only after a send that succeeded.
 *   - last_checked_at moves for everyone the run got an answer for, and the
 *     next run starts with whoever was checked longest ago. A run that stops
 *     early therefore continues where it left off instead of starving the rest.
 *   - premium.marketing_opt_out is respected on top of job_alerts.active.
 */

const TABLE = "job_alerts"
const MIGRATION = "supabase/migrations/20261118000000_create_job_alerts.sql"

const HOUR_MS = 3_600_000
const DEFAULT_LOOKBACK_MS = 7 * 24 * HOUR_MS
// After a missed or failed week the next email reaches further back, but never
// further than this: older ads have usually closed.
const MAX_LOOKBACK_MS = 14 * 24 * HOUR_MS
// Each failed search can cost seconds. A few in a row means the API is down.
const MAX_JOBS_API_FAILURES = 3
// Keeps the .in("uid", ...) filters below a safe URL length.
const MAX_CANDIDATES = 150

function num(name: string, fallback: number): number {
  const parsed = Number(process.env[name])
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/** "job_alert_2026w47": ISO week in UTC, one reservation per user and week. */
function reminderTypeFor(date: Date): string {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  // The ISO week belongs to the year its Thursday falls in.
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7))
  const yearStart = Date.UTC(day.getUTCFullYear(), 0, 1)
  const week = Math.ceil(((day.getTime() - yearStart) / 86_400_000 + 1) / 7)
  return `job_alert_${day.getUTCFullYear()}w${String(week).padStart(2, "0")}`
}

/**
 * How far back to search, in minutes. Rounded up to a whole hour: rounding up
 * can repeat an ad from the overlapping hour but never drops one. The search
 * itself is never read from a cache, see findNewAds.
 */
function lookbackMinutes(lastSentAt: string | null, now: number): number {
  const since = lastSentAt ? Date.parse(lastSentAt) : NaN
  const elapsed = Number.isFinite(since) ? now - since : DEFAULT_LOOKBACK_MS
  const clamped = Math.min(Math.max(elapsed, HOUR_MS), MAX_LOOKBACK_MS)
  return Math.ceil(clamped / HOUR_MS) * 60
}

/** "9 november", in Swedish time since that is what the ads are dated in. */
function sinceLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Stockholm",
  })
}

interface AlertRow {
  id: string
  uid: string
  search_text: string
  occupation_label: string
  location_kind: "municipality" | "region" | null
  location_id: string | null
  location_name: string | null
  last_sent_at: string | null
}

interface AlertScope {
  /** Reads after "i". */
  place: string
  filter: Pick<JobSearchParams, "municipality" | "region">
  /** The same search on /lediga-jobb. */
  href: string
}

/** The stored place first; for a municipality its län as a fallback. Never wider than that. */
function scopesFor(alert: AlertRow): AlertScope[] {
  const q = alert.search_text
  if (alert.location_kind === "municipality" && alert.location_id) {
    const municipality = getMunicipalityById(alert.location_id)
    const region = municipality ? regionOf(municipality) : undefined
    const scopes: AlertScope[] = [
      {
        place: municipality?.name || alert.location_name || "",
        filter: { municipality: alert.location_id },
        href: buildJobsSearchHref({ q, ort: municipality?.slug }),
      },
    ]
    if (region) {
      scopes.push({
        place: region.name,
        filter: { region: region.id },
        href: buildJobsSearchHref({ q, lan: region.slug }),
      })
    }
    return scopes
  }
  if (alert.location_kind === "region" && alert.location_id) {
    const region = getRegionById(alert.location_id)
    return [
      {
        place: region?.name || alert.location_name || "",
        filter: { region: alert.location_id },
        href: buildJobsSearchHref({ q, lan: region?.slug }),
      },
    ]
  }
  return [{ place: "hela Sverige", filter: {}, href: buildJobsSearchHref({ q }) }]
}

interface NewAds {
  scope: AlertScope
  /** The municipality that had nothing new, when the search fell back to its län. */
  widenedFrom: string | null
  total: number
  jobs: JobAdSummary[]
}

/** null = nothing new anywhere, "unavailable" = the jobs API did not answer. */
async function findNewAds(alert: AlertRow, minutes: number): Promise<NewAds | null | "unavailable"> {
  const scopes = scopesFor(alert)
  for (let i = 0; i < scopes.length; i++) {
    const scope = scopes[i]
    if (!scope.place) continue
    // fresh: the URL is the same every Monday, and Next would answer from the
    // entry it stored a week ago (stale entries are served, then refreshed).
    const result = await searchJobs(
      {
        q: alert.search_text,
        ...scope.filter,
        publishedAfter: minutes,
        sort: "pubdate-desc",
        limit: JOB_ALERT_MAX_JOBS,
      },
      { fresh: true }
    )
    if (!result) return "unavailable"
    if (result.hits.length > 0) {
      return {
        scope,
        widenedFrom: i > 0 ? scopes[0].place : null,
        total: result.total,
        jobs: result.hits,
      }
    }
  }
  return null
}

interface SendResult {
  uid: string
  email?: string
  status: "sent" | "skipped" | "failed"
  reason?: string
  search?: string
  place?: string
  newAds?: number
}

async function handle(request: NextRequest) {
  // --- Auth -----------------------------------------------------------------
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured" },
      { status: 500 }
    )
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  // --- Configuration --------------------------------------------------------
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase service role credentials are not configured" },
      { status: 500 }
    )
  }

  const resend = getResend()
  if (!resend) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY is not configured" },
      { status: 500 }
    )
  }

  const batchLimit = num("JOB_ALERTS_BATCH_LIMIT", 30)
  // Resend's default account limit is ~2 requests/second.
  const throttleMs = num("JOB_ALERTS_THROTTLE_MS", 550)
  // Stop well short of maxDuration, for the same reason as in the abandoned-CV
  // route: a timeout between reservation and send would block that user's
  // email for the rest of the week.
  const startedAt = Date.now()
  const timeBudgetMs = num("JOB_ALERTS_TIME_BUDGET_MS", 45_000)

  // ?dry=1 searches and reports without reserving, sending or updating anything.
  const dryRun =
    request.nextUrl.searchParams.get("dry") === "1" ||
    process.env.JOB_ALERTS_DRY_RUN === "true"

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const reminderType = reminderTypeFor(new Date(startedAt))
  const siteUrl = getSiteUrl()

  // --- 1. Active alerts -----------------------------------------------------
  const { data: alertRows, error: alertsError } = await admin
    .from(TABLE)
    .select(
      "id, uid, search_text, occupation_label, location_kind, location_id, location_name, last_sent_at"
    )
    .eq("active", true)
    // Switched off through the link in an email. Such a row is inactive as
    // well; this only covers a switch-on that raced with the link.
    .is("unsubscribed_at", null)
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(Math.min(batchLimit * 5, MAX_CANDIDATES))

  if (alertsError) {
    // The owner applies migrations by hand, so the cron can be live before the
    // table is. That is not an error worth a failed run: nobody can have opted in.
    if (alertsError.code === "PGRST205" || alertsError.code === "42P01") {
      console.warn(
        `[job-alerts] table public.${TABLE} does not exist yet. Nothing sent. Apply ${MIGRATION}.`
      )
      return NextResponse.json({ ok: true, sent: 0, skipped: "job_alerts_table_missing" })
    }
    console.error("[job-alerts] alert query failed:", alertsError)
    return NextResponse.json({ ok: false, error: alertsError.message }, { status: 500 })
  }

  const alerts = ((alertRows ?? []) as AlertRow[]).filter(
    (row) => row.uid && row.search_text && row.occupation_label
  )
  if (alerts.length === 0) {
    return NextResponse.json({ ok: true, reminderType, considered: 0, sent: 0, results: [] })
  }

  const uids = alerts.map((row) => row.uid)

  // --- 2. Address and general opt-out ---------------------------------------
  const { data: accounts, error: accountsError } = await admin
    .from("premium")
    .select("uid, email, marketing_opt_out")
    .in("uid", uids)

  if (accountsError) {
    console.error("[job-alerts] account query failed:", accountsError)
    return NextResponse.json({ ok: false, error: accountsError.message }, { status: 500 })
  }

  const accountByUid = new Map(
    (accounts ?? []).map((row) => [
      row.uid as string,
      { email: row.email as string | null, optedOut: row.marketing_opt_out === true },
    ])
  )

  // --- 3. Who already got this week's email ---------------------------------
  const { data: alreadySent, error: sentError } = await admin
    .from("email_reminders")
    .select("uid")
    .eq("reminder_type", reminderType)
    .in("uid", uids)

  if (sentError) {
    console.error("[job-alerts] reminder-log query failed:", sentError)
    return NextResponse.json({ ok: false, error: sentError.message }, { status: 500 })
  }

  const sentUids = new Set((alreadySent ?? []).map((row) => row.uid as string))

  // --- 4. Their most recent CV, for the one CV link -------------------------
  // Nice to have only: without it the link goes to the CV list instead.
  const latestCvByUser = new Map<string, string>()
  const { data: cvRows, error: cvError } = await admin
    .from("cvs")
    .select("id, user_id, updated_at")
    .in("user_id", uids)
    .order("updated_at", { ascending: false })

  if (cvError) {
    console.warn("[job-alerts] cv query failed, linking to the CV list:", cvError.message)
  }
  for (const cv of cvRows ?? []) {
    const userId = cv.user_id as string
    if (!latestCvByUser.has(userId)) latestCvByUser.set(userId, cv.id as string)
  }

  // --- 5. Search and send ---------------------------------------------------
  const results: SendResult[] = []
  // Alerts that got their answer without an email. Stamped in one write after the loop.
  const checkedIds: string[] = []
  let sentCount = 0
  let jobsApiFailures = 0
  let stoppedEarly: string | false = false
  let reached = 0

  for (const alert of alerts) {
    if (sentCount >= batchLimit) {
      stoppedEarly = "batch_limit"
      break
    }
    if (Date.now() - startedAt > timeBudgetMs) {
      stoppedEarly = "time_budget"
      break
    }
    reached += 1

    const uid = alert.uid
    if (sentUids.has(uid)) {
      results.push({ uid, status: "skipped", reason: "already_sent" })
      continue
    }

    const account = accountByUid.get(uid)
    const email = account?.email && account.email.includes("@") ? account.email : null
    if (!account || !email) {
      results.push({ uid, status: "skipped", reason: "no_account_email" })
      checkedIds.push(alert.id)
      continue
    }
    if (account.optedOut) {
      results.push({ uid, email, status: "skipped", reason: "marketing_opt_out" })
      checkedIds.push(alert.id)
      continue
    }

    const minutes = lookbackMinutes(alert.last_sent_at, startedAt)
    const searchedAt = Date.now()
    const found = await findNewAds(alert, minutes)

    if (found === "unavailable") {
      results.push({ uid, email, status: "skipped", reason: "jobs_api_unavailable" })
      jobsApiFailures += 1
      if (jobsApiFailures >= MAX_JOBS_API_FAILURES) {
        // Nothing was reserved for these users, so next run simply tries again.
        console.warn("[job-alerts] jobs API is not answering, stopping this run")
        stoppedEarly = "jobs_api_unavailable"
        break
      }
      continue
    }
    jobsApiFailures = 0

    if (!found) {
      // No email, no reservation and no last_sent_at: next week looks further back.
      results.push({ uid, email, status: "skipped", reason: "no_new_ads", search: alert.search_text })
      checkedIds.push(alert.id)
      continue
    }

    const summary = { search: alert.search_text, place: found.scope.place, newAds: found.total }

    if (dryRun) {
      results.push({ uid, email, status: "skipped", reason: "dry_run", ...summary })
      continue
    }

    const cvId = latestCvByUser.get(uid) ?? null

    // Reserve the send first. A unique-violation here means another run already
    // owns this user for this week: skip rather than double-send.
    const { data: reservation, error: reserveError } = await admin
      .from("email_reminders")
      .insert({ uid, email, reminder_type: reminderType, cv_id: cvId })
      .select("id")
      .single()

    if (reserveError) {
      results.push({
        uid,
        email,
        status: "skipped",
        reason:
          reserveError.code === "23505" ? "already_sent" : `reserve_failed: ${reserveError.message}`,
      })
      continue
    }

    let providerMessageId: string | null = null
    try {
      const unsubscribeUrl = `${siteUrl}/api/email/unsubscribe?token=${encodeURIComponent(
        createUnsubscribeToken(uid, UNSUBSCRIBE_SCOPE_JOB_ALERT)
      )}`

      const { subject, html, text } = buildJobAlertEmail({
        total: found.total,
        occupation: alert.occupation_label,
        place: found.scope.place,
        widenedFrom: found.widenedFrom,
        since: sinceLabel(startedAt - minutes * 60_000),
        jobs: found.jobs.map((job) => ({
          headline: job.headline,
          employer: job.employer,
          place: job.municipality,
          url: `${siteUrl}${job.path}`,
        })),
        allJobsUrl: `${siteUrl}${found.scope.href}`,
        cvUrl: cvId
          ? `${siteUrl}/profil/skapa-cv?id=${encodeURIComponent(cvId)}`
          : `${siteUrl}/profil`,
        unsubscribeUrl,
      })

      const { data: sendData, error: sendError } = await resend.emails.send(
        {
          from: getFromAddress(),
          to: email,
          replyTo: getReplyToAddress(),
          subject,
          html,
          text,
          headers: {
            // Gmail/Yahoo bulk-sender requirements: one-click unsubscribe.
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
          tags: [
            { name: "category", value: "job_alert" },
            { name: "campaign", value: reminderType },
          ],
        },
        { idempotencyKey: `${reminderType}:${uid}` }
      )

      if (sendError) throw new Error(sendError.message)
      providerMessageId = sendData?.id ?? null
    } catch (error: unknown) {
      // Roll the reservation back so a rerun this week can try again.
      // last_sent_at is untouched, so nothing is lost if it waits until next week.
      try {
        await admin.from("email_reminders").delete().eq("id", reservation.id)
      } catch {}
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[job-alerts] send failed for ${uid}:`, message)
      results.push({ uid, email, status: "failed", reason: message, ...summary })
      if (throttleMs > 0) await new Promise((resolve) => setTimeout(resolve, throttleMs))
      continue
    }

    // The email is out. From here on nothing may release the reservation; a
    // bookkeeping failure only means next week's email reaches further back.
    sentCount += 1
    results.push({ uid, email, status: "sent", ...summary })
    try {
      await admin
        .from("email_reminders")
        .update({ provider_message_id: providerMessageId })
        .eq("id", reservation.id)
      // The moment of the search, not of the send: an ad published in between
      // belongs to next week's email.
      const stamp = new Date(searchedAt).toISOString()
      const { error: stampError } = await admin
        .from(TABLE)
        .update({ last_sent_at: stamp, last_checked_at: stamp })
        .eq("id", alert.id)
      if (stampError) throw new Error(stampError.message)
    } catch (error: unknown) {
      console.error(
        `[job-alerts] sent to ${uid} but could not record it:`,
        error instanceof Error ? error.message : String(error)
      )
    }

    if (throttleMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, throttleMs))
    }
  }

  if (checkedIds.length > 0 && !dryRun) {
    const { error: checkedError } = await admin
      .from(TABLE)
      .update({ last_checked_at: new Date(startedAt).toISOString() })
      .in("id", checkedIds)
    // Harmless: these alerts are just looked at first again next run.
    if (checkedError) console.warn("[job-alerts] could not record checked alerts:", checkedError.message)
  }

  // Alerts still waiting for this week's check; they are first in line next run.
  const notReached = alerts.slice(reached).filter((alert) => !sentUids.has(alert.uid)).length
  if (notReached > 0 && !dryRun) {
    // Expected on an early Monday run once there are many alerts: the later
    // runs continue. After the last run of the day it means the schedule in
    // vercel.json needs more Monday runs.
    console.error(
      `[job-alerts] ${reminderType}: run stopped (${stoppedEarly}) with ${notReached} alerts not reached. ` +
        "If this was the last run this Monday, they get no email this week: add Monday runs in vercel.json."
    )
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    reminderType,
    stoppedEarly,
    considered: alerts.length,
    notReached,
    sent: sentCount,
    results,
  })
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
