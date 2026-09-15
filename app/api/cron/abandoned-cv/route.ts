import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  getResend,
  getSiteUrl,
  getFromAddress,
  getReplyToAddress,
} from "@/lib/email/client"
import { buildAbandonedCvEmail } from "@/lib/email/templates/abandoned-cv"
import { createUnsubscribeToken } from "@/lib/email/tokens"
import { scoreCv, CV_SCORING_COLUMNS } from "@/lib/cv-completeness"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Abandoned-CV reminder.
 *
 * Finds people who signed up, built something in the editor, and never started
 * their subscription — then emails them a one-click link back into that exact
 * CV. Scheduled hourly from vercel.json.
 *
 * Safety properties that matter more than the copy:
 *   - MAX_AGE_HOURS stops the first deploy from emailing the entire back
 *     catalogue of non-paying users. Without it, turning this on once would
 *     blast every signup in the history of the site and burn the domain.
 *   - The email_reminders row is inserted BEFORE the send. Its UNIQUE(uid,
 *     reminder_type) index is what makes a double-firing cron harmless; a
 *     failed send then deletes the row so the next run retries.
 *   - Opt-outs and already-paying users are filtered in SQL and again in JS.
 */

const REMINDER_TYPE = "abandoned_cv_4h"

function num(name: string, fallback: number): number {
  const parsed = Number(process.env[name])
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

interface SendResult {
  uid: string
  email: string
  status: "sent" | "skipped" | "failed"
  reason?: string
  percent?: number
  cvId?: string
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

  const minAgeHours = num("ABANDONED_CV_MIN_AGE_HOURS", 4)
  const maxAgeHours = num("ABANDONED_CV_MAX_AGE_HOURS", 72)
  const batchLimit = num("ABANDONED_CV_BATCH_LIMIT", 25)
  // Resend's default account limit is ~2 requests/second.
  const throttleMs = num("ABANDONED_CV_THROTTLE_MS", 550)

  // Stop well short of maxDuration. A timeout in the middle of the loop would
  // leave a reserved email_reminders row with no email ever sent, and the
  // reservation then blocks the retry — so leaving early is strictly better.
  const startedAt = Date.now()
  const timeBudgetMs = num("ABANDONED_CV_TIME_BUDGET_MS", 45_000)

  // ?dry=1 renders and logs everything without sending. Use it on first deploy
  // to see exactly who would be contacted.
  const dryRun =
    request.nextUrl.searchParams.get("dry") === "1" ||
    process.env.ABANDONED_CV_DRY_RUN === "true"

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const now = Date.now()
  const createdBefore = new Date(now - minAgeHours * 3600_000).toISOString()
  const createdAfter = new Date(now - maxAgeHours * 3600_000).toISOString()
  const siteUrl = getSiteUrl()

  // --- 1. Candidate accounts ------------------------------------------------
  const { data: candidates, error: candidatesError } = await admin
    .from("premium")
    .select("uid, email, premium, marketing_opt_out, created_at")
    // Matches the partial index from the migration. If this errors with
    // "column does not exist", the migration has not been applied yet — which
    // is exactly when you want a loud failure rather than a send.
    .eq("marketing_opt_out", false)
    .lte("created_at", createdBefore)
    .gte("created_at", createdAfter)
    .order("created_at", { ascending: true })
    .limit(batchLimit * 5) // room for the JS-side filtering below

  if (candidatesError) {
    console.error("[abandoned-cv] candidate query failed:", candidatesError)
    return NextResponse.json(
      { ok: false, error: candidatesError.message },
      { status: 500 }
    )
  }

  const eligible = (candidates ?? []).filter((row) => {
    if (!row.uid || !row.email) return false
    // The column is TEXT in production ('true'/'false') but BOOLEAN in the
    // original migration, so normalise instead of trusting either.
    if (String(row.premium).toLowerCase() === "true") return false
    if (row.marketing_opt_out === true) return false
    return true
  })

  if (eligible.length === 0) {
    return NextResponse.json({ ok: true, considered: 0, sent: 0, results: [] })
  }

  const uids = eligible.map((row) => row.uid as string)

  // --- 2. Who already got this email ---------------------------------------
  const { data: alreadySent, error: sentError } = await admin
    .from("email_reminders")
    .select("uid")
    .eq("reminder_type", REMINDER_TYPE)
    .in("uid", uids)

  if (sentError) {
    console.error("[abandoned-cv] reminder-log query failed:", sentError)
    return NextResponse.json({ ok: false, error: sentError.message }, { status: 500 })
  }

  const sentUids = new Set((alreadySent ?? []).map((row) => row.uid as string))
  const pending = eligible.filter((row) => !sentUids.has(row.uid as string))

  if (pending.length === 0) {
    return NextResponse.json({
      ok: true,
      considered: eligible.length,
      sent: 0,
      results: [],
    })
  }

  // --- 3. Their most recent CV ---------------------------------------------
  const { data: cvRows, error: cvError } = await admin
    .from("cvs")
    .select(CV_SCORING_COLUMNS)
    .in(
      "user_id",
      pending.map((row) => row.uid as string)
    )
    .eq("active", true)
    .order("updated_at", { ascending: false })

  if (cvError) {
    console.error("[abandoned-cv] cv query failed:", cvError)
    return NextResponse.json({ ok: false, error: cvError.message }, { status: 500 })
  }

  // Ordered desc, so the first row per user is the one they touched last.
  const latestCvByUser = new Map<string, Record<string, unknown>>()
  for (const cv of cvRows ?? []) {
    const userId = (cv as Record<string, unknown>).user_id as string
    if (!latestCvByUser.has(userId)) {
      latestCvByUser.set(userId, cv as Record<string, unknown>)
    }
  }

  // --- 4. Send -------------------------------------------------------------
  const results: SendResult[] = []
  let sentCount = 0
  let stoppedEarly = false

  for (const account of pending) {
    if (sentCount >= batchLimit) break
    if (Date.now() - startedAt > timeBudgetMs) {
      // Whoever is left keeps their unreserved state and is picked up next hour.
      stoppedEarly = true
      break
    }

    const uid = account.uid as string
    const email = account.email as string

    const cv = latestCvByUser.get(uid)
    if (!cv) {
      results.push({ uid, email, status: "skipped", reason: "no_cv" })
      continue
    }

    const score = scoreCv(cv)
    if (!score.hasMeaningfulContent) {
      results.push({ uid, email, status: "skipped", reason: "cv_empty" })
      continue
    }

    const cvId = cv.id as string
    // ?new=true is what CVMallClient watches to open the payment step, and
    // ?edit=<id> is what makes it load this specific CV.
    const destinationPath = `/profil/skapa-cv?edit=${encodeURIComponent(cvId)}&new=true`
    const fallbackUrl = `${siteUrl}${destinationPath}`

    if (dryRun) {
      results.push({
        uid,
        email,
        status: "skipped",
        reason: "dry_run",
        percent: score.percent,
        cvId,
      })
      continue
    }

    // Reserve the send first. A unique-violation here means another run (or
    // another region) already owns this user — skip rather than double-send.
    const { data: reservation, error: reserveError } = await admin
      .from("email_reminders")
      .insert({ uid, email, reminder_type: REMINDER_TYPE, cv_id: cvId })
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

    const releaseReservation = async () => {
      await admin.from("email_reminders").delete().eq("id", reservation.id)
    }

    try {
      // Auto-login link. If this fails the email is still worth sending — the
      // plain URL just asks them to log in first.
      let resumeUrl = fallbackUrl
      // No redirectTo on purpose: we never use Supabase's own action_link, only
      // the hashed_token from it, so passing a redirect would only risk the
      // call failing against the project's allowed-redirect list.
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
      })

      if (linkError) {
        console.warn(`[abandoned-cv] magic link failed for ${uid}:`, linkError.message)
      } else {
        const tokenHash = linkData?.properties?.hashed_token
        if (tokenHash) {
          resumeUrl =
            `${siteUrl}/auth/fortsatt` +
            `?token_hash=${encodeURIComponent(tokenHash)}` +
            `&next=${encodeURIComponent(destinationPath)}`
        }
      }

      const unsubscribeUrl = `${siteUrl}/api/email/unsubscribe?token=${encodeURIComponent(
        createUnsubscribeToken(uid)
      )}`

      const { subject, html, text } = buildAbandonedCvEmail({
        firstName: score.firstName,
        percent: score.percent,
        completedSections: score.completedSections,
        missingSections: score.missingSections,
        resumeUrl,
        fallbackUrl,
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
            { name: "category", value: "lifecycle" },
            { name: "campaign", value: REMINDER_TYPE },
          ],
        },
        { idempotencyKey: `${REMINDER_TYPE}:${uid}` }
      )

      if (sendError) throw new Error(sendError.message)

      await admin
        .from("email_reminders")
        .update({ provider_message_id: sendData?.id ?? null })
        .eq("id", reservation.id)

      sentCount += 1
      results.push({ uid, email, status: "sent", percent: score.percent, cvId })
    } catch (error: unknown) {
      // Roll the reservation back so the next hourly run tries again.
      await releaseReservation().catch(() => {})
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[abandoned-cv] send failed for ${uid}:`, message)
      results.push({ uid, email, status: "failed", reason: message })
    }

    if (throttleMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, throttleMs))
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    stoppedEarly,
    window: { from: createdAfter, to: createdBefore },
    considered: eligible.length,
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
