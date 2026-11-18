import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type Stripe from "stripe"
import { getStripeInstance } from "@/lib/stripe"
import { stampSubscriptionFromCheckout, syncPremiumWithSubscription } from "@/lib/subscription"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Manual premium reconciliation. NOT scheduled: the owner runs it by hand
 * after a deploy, with the CRON_SECRET bearer token, and reads the answer.
 *
 * The webhook only acts on events Stripe delivers. Subscriptions that ended
 * before the two subscription events were switched on, or while the endpoint
 * was off, never produce another event. This walks them from the Stripe side
 * and runs the very same guarded decision as the webhook
 * (syncPremiumWithSubscription) on each one.
 *
 *   - Dry run unless ?apply=1. A dry run reads from Stripe and Supabase and
 *     writes to neither.
 *   - It starts from subscriptions, never from premium rows, so "nothing found
 *     in Stripe" can never take premium away. A flag is only set to false when
 *     the ended subscription is tied to a user and none of that user's other
 *     subscriptions is live.
 *   - Each call works for TIME_BUDGET_MS and then answers with `next`. Call
 *     again with those values (or `nextUrl`) until `done` is true.
 *
 * ?mode=stamp is the backfill to run first: it gives live subscriptions from
 * before 26 October 2026 the metadata.userId of their checkout session, so
 * that the reconcile step can see them. Also a dry run unless ?apply=1.
 *
 * Parameters: mode (reconcile | stamp), apply=1, status, starting_after,
 * limit (most subscriptions to look at in this call).
 *
 * Per subscription the answer has id, status, userId (null when it could not
 * be tied to a user), decision and flagChange: in a dry run whether the
 * premium flag would be rewritten, with apply=1 whether it was.
 */

type ListStatus = Stripe.SubscriptionListParams.Status

// "incomplete" is left out: a first payment still in progress is not ended.
const RECONCILE_STATUSES: ListStatus[] = ["canceled", "unpaid", "paused", "incomplete_expired"]
const STAMP_STATUSES: ListStatus[] = ["trialing", "active", "past_due"]

const PAGE_SIZE = 50
// Stop well short of maxDuration so the answer, with its cursor, always gets out.
const TIME_BUDGET_MS = 40_000
// Stripe or Supabase is probably down: stop instead of walking the whole list.
const MAX_ERRORS_IN_A_ROW = 5

const SUBSCRIPTION_ID = /^sub_[A-Za-z0-9]+$/

function bad(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 })
}

export async function GET(request: NextRequest) {
  // --- Auth (same as /api/cron/abandoned-cv) ---------------------------------
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

  // --- Parameters -------------------------------------------------------------
  // Anything unexpected is refused rather than guessed at: a typo must not turn
  // into a different run than the one that was meant.
  const params = request.nextUrl.searchParams

  const modeParam = params.get("mode") || "reconcile"
  if (modeParam !== "reconcile" && modeParam !== "stamp") {
    return bad("mode must be reconcile or stamp")
  }
  const mode: "reconcile" | "stamp" = modeParam

  const applyParam = params.get("apply")
  if (applyParam !== null && applyParam !== "1") {
    return bad("apply must be 1, or left out for a dry run")
  }
  const apply = applyParam === "1"

  const statuses = mode === "stamp" ? STAMP_STATUSES : RECONCILE_STATUSES
  const statusParam = params.get("status")
  let statusIndex = 0
  if (statusParam !== null) {
    statusIndex = statuses.indexOf(statusParam as ListStatus)
    if (statusIndex === -1) return bad(`status must be one of: ${statuses.join(", ")}`)
  }

  const startingAfter = params.get("starting_after")
  if (startingAfter !== null) {
    if (statusParam === null) return bad("starting_after needs status")
    if (!SUBSCRIPTION_ID.test(startingAfter)) return bad("starting_after must be a subscription id")
  }

  const limitParam = params.get("limit")
  let limit = Infinity
  if (limitParam !== null) {
    limit = Number(limitParam)
    if (!Number.isInteger(limit) || limit < 1) return bad("limit must be a whole number above 0")
  }

  // --- Walk the subscriptions -------------------------------------------------
  const stripe = getStripeInstance()
  const startedAt = Date.now()

  const results: Array<Record<string, unknown>> = []
  const totals: Record<string, number> =
    mode === "stamp"
      ? { checked: 0, already_stamped: 0, no_checkout_user: 0, would_stamp: 0, stamped: 0, stamp_failed: 0, errors: 0 }
      : { checked: 0, grant: 0, revoke: 0, keep: 0, userNotResolved: 0, flagChanges: 0, errors: 0 }

  const firstStatusIndex = statusIndex
  let cursor: string | undefined = startingAfter || undefined
  let errorsInARow = 0
  let stoppedBecause: "time" | "limit" | "errors" | "list_failed" | null = null
  let listError: string | null = null

  const mustStop = (): typeof stoppedBecause => {
    if (errorsInARow >= MAX_ERRORS_IN_A_ROW) return "errors"
    if (totals.checked >= limit) return "limit"
    if (Date.now() - startedAt > TIME_BUDGET_MS) return "time"
    return null
  }

  while (statusIndex < statuses.length) {
    stoppedBecause = mustStop()
    if (stoppedBecause) break

    let page: Stripe.ApiList<Stripe.Subscription>
    try {
      page = await stripe.subscriptions.list({
        status: statuses[statusIndex],
        limit: PAGE_SIZE,
        ...(cursor ? { starting_after: cursor } : {}),
      })
    } catch (error) {
      // Answer with what was done so far instead of losing it in a 500 page.
      stoppedBecause = "list_failed"
      listError = error instanceof Error ? error.message : String(error)
      break
    }

    for (const subscription of page.data) {
      stoppedBecause = mustStop()
      if (stoppedBecause) break

      totals.checked += 1
      try {
        if (mode === "stamp") {
          const stamp = await stampSubscriptionFromCheckout(stripe, subscription, { dryRun: !apply })
          totals[stamp.outcome] += 1
          // Already stamped is the normal case and needs nobody's attention.
          if (stamp.outcome !== "already_stamped") {
            results.push({
              id: subscription.id,
              status: subscription.status,
              userId: stamp.userId,
              outcome: stamp.outcome,
            })
          }
        } else {
          const sync = await syncPremiumWithSubscription(subscription.id, { dryRun: !apply })
          const flagChange = apply ? sync.changed : sync.wouldChange === true
          totals[sync.decision] += 1
          if (!sync.userId) totals.userNotResolved += 1
          if (flagChange) totals.flagChanges += 1
          results.push({
            id: subscription.id,
            status: sync.status,
            userId: sync.userId,
            decision: sync.decision,
            flagChange,
            via: sync.via,
            reason: sync.reason ?? null,
          })
        }
        errorsInARow = 0
      } catch (error) {
        // Nothing was changed for this one. It is listed so it can be run again.
        errorsInARow += 1
        totals.errors += 1
        results.push({
          id: subscription.id,
          status: subscription.status,
          userId: null,
          decision: "error",
          flagChange: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
      cursor = subscription.id
    }

    if (stoppedBecause) break
    if (page.has_more && page.data.length > 0) continue

    statusIndex += 1
    cursor = undefined
  }

  // --- Answer -----------------------------------------------------------------
  const done = statusIndex >= statuses.length
  // After a run of errors the cursor has moved past subscriptions that were
  // never decided, so `next` repeats this call instead. Repeating is harmless.
  const next = done
    ? null
    : stoppedBecause === "errors"
      ? { status: statuses[firstStatusIndex], starting_after: startingAfter ?? null }
      : { status: statuses[statusIndex], starting_after: cursor ?? null }

  let nextUrl: string | null = null
  if (next) {
    const query = new URLSearchParams()
    if (mode === "stamp") query.set("mode", "stamp")
    query.set("status", next.status)
    if (next.starting_after) query.set("starting_after", next.starting_after)
    if (limitParam !== null) query.set("limit", limitParam)
    if (apply) query.set("apply", "1")
    nextUrl = `/api/cron/reconcile-premium?${query.toString()}`
  }

  if (apply) {
    console.log(`[reconcile-premium] ${mode} applied:`, JSON.stringify(totals))
  }

  return NextResponse.json(
    {
      ok: stoppedBecause !== "list_failed",
      mode,
      dryRun: !apply,
      done,
      stoppedBecause,
      ...(listError ? { error: listError } : {}),
      next,
      nextUrl,
      totals,
      results,
    },
    { status: stoppedBecause === "list_failed" ? 502 : 200 }
  )
}
