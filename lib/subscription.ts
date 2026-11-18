import "server-only"
import { createClient } from "@supabase/supabase-js"
import { getStripeInstance } from "@/lib/stripe"
import type Stripe from "stripe"

/**
 * Server-side answer to "has this user already paid?".
 *
 * The premium flag alone is not enough: it is written by webhooks that can stop
 * firing (in October 2026 they did, and paying customers kept getting the
 * checkout popup and subscribed two or three times). So when the flag says no,
 * ask Stripe directly for a completed checkout belonging to this user, and if a
 * live subscription exists, repair the flag on the spot.
 */

// past_due still counts: the customer has a subscription, it just needs a card fix.
export const LIVE_STATUSES = new Set(["trialing", "active", "past_due"])

// Every other status Stripe has today. A status in neither set is one Stripe
// added after this was written: it is treated as unknown and never revokes.
export const ENDED_STATUSES = new Set(["canceled", "unpaid", "paused", "incomplete", "incomplete_expired"])

export type PremiumDecision = "grant" | "revoke" | "keep"

/**
 * What a subscription event should do to the premium flag.
 *
 * `otherStatuses` are the statuses of every other subscription that may belong
 * to the same user (duplicates exist: several customers got two or three
 * trials on 1 to 2 November 2026). Pass null when that list could not be
 * established. Revoking needs positive proof that nothing is live; a paying
 * customer who is locked out is worse than a revocation that comes late.
 */
export function decidePremium(
  status: string,
  otherStatuses: readonly string[] | null
): PremiumDecision {
  if (LIVE_STATUSES.has(status)) return "grant"
  if (!ENDED_STATUSES.has(status)) return "keep"
  if (!otherStatuses) return "keep"
  return otherStatuses.every((other) => ENDED_STATUSES.has(other)) ? "revoke" : "keep"
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export interface SubscriptionStatus {
  subscribed: boolean
  /** Account email from the premium row, for prefilling checkout. */
  email: string | null
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const admin = getAdmin()

  const { data: row } = await admin
    .from("premium")
    .select("premium, email")
    .eq("uid", userId)
    .maybeSingle()

  const email = (row?.email as string | undefined) || null
  if (String(row?.premium).toLowerCase() === "true") {
    return { subscribed: true, email }
  }
  if (!email) {
    return { subscribed: false, email }
  }

  // Every checkout session carries metadata.userId (set in
  // /api/create-checkout-session), so match on that rather than on email alone.
  const stripe = getStripeInstance()
  const sessions = await stripe.checkout.sessions.list({
    customer_details: { email },
    status: "complete",
    limit: 20,
    expand: ["data.subscription"],
  })

  const hasLiveSubscription = sessions.data.some((session) => {
    if (session.metadata?.userId !== userId) return false
    const subscription = session.subscription
    return (
      typeof subscription === "object" &&
      subscription !== null &&
      LIVE_STATUSES.has(subscription.status)
    )
  })

  if (hasLiveSubscription) {
    await markPremium(userId)
  }

  return { subscribed: hasLiveSubscription, email }
}

// The column is TEXT in production, hence the strings.
async function setPremiumFlag(userId: string, value: "true" | "false") {
  const { error } = await getAdmin()
    .from("premium")
    .update({ premium: value, updated_at: new Date().toISOString() })
    .eq("uid", userId)
  return error
}

async function markPremium(userId: string) {
  const error = await setPremiumFlag(userId, "true")
  if (error) {
    console.error("[subscription] could not set premium flag:", error.message)
  }
}

/**
 * Called when Stripe sends the customer back with ?session_id=. Only a session
 * that is complete and belongs to this user counts — the return URL can be
 * opened by anyone, so it must not mark accounts paid or fire ad conversions
 * on its own.
 */
export async function confirmCheckoutSession(
  userId: string,
  sessionId: string
): Promise<{ confirmed: boolean; transactionId?: string }> {
  const stripe = getStripeInstance()
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  })
  if (session.status !== "complete" || session.metadata?.userId !== userId) {
    return { confirmed: false }
  }
  // The return URL stays in the browser history. Without this, reopening it
  // after the subscription has ended would hand premium straight back.
  const subscription = session.subscription
  if (
    typeof subscription === "object" &&
    subscription !== null &&
    ENDED_STATUSES.has(subscription.status)
  ) {
    return { confirmed: false }
  }
  await markPremium(userId)
  return { confirmed: true, transactionId: session.id }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// premium.uid is a UUID column, and the id also goes into a Stripe search
// query, so anything else in metadata is treated as absent.
function asUserId(value: unknown): string | null {
  return typeof value === "string" && UUID.test(value) ? value : null
}

function idOf(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null
  return typeof ref === "string" ? ref : ref.id
}

// Stripe's customer email filter and the premium.email match are both
// case-sensitive, and an email typed into Checkout keeps its capitals.
function emailVariants(...emails: Array<string | null | undefined>): string[] {
  const variants = new Set<string>()
  emails.forEach((email) => {
    if (!email) return
    variants.add(email)
    variants.add(email.toLowerCase())
  })
  return Array.from(variants)
}

export type UserResolvedVia = "subscription_metadata" | "checkout_session" | "customer_email"

async function resolveSubscriptionUser(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  getCustomerEmail: () => Promise<string | null>
): Promise<{ userId: string; via: UserResolvedVia } | null> {
  const fromSubscription = asUserId(subscription.metadata?.userId)
  if (fromSubscription) return { userId: fromSubscription, via: "subscription_metadata" }

  // Subscriptions started before 26 October 2026 carry no metadata of their
  // own, but the checkout session that created them always did.
  const sessions = await stripe.checkout.sessions.list({
    subscription: subscription.id,
    limit: 1,
  })
  const fromSession = asUserId(sessions.data[0]?.metadata?.userId)
  if (fromSession) return { userId: fromSession, via: "checkout_session" }

  const email = await getCustomerEmail()
  if (!email) return null
  const { data, error } = await getAdmin()
    .from("premium")
    .select("uid")
    .in("email", emailVariants(email))
    .limit(2)
  if (error) throw new Error(`premium lookup by email failed: ${error.message}`)
  // Two accounts on one email: no way to tell whose subscription this is.
  if (!data || data.length !== 1) return null
  const fromEmail = asUserId(data[0].uid)
  return fromEmail ? { userId: fromEmail, via: "customer_email" } : null
}

/**
 * Copies the user id that only the checkout session knew about onto the
 * subscription itself. After that the metadata search in
 * listOtherSubscriptionStatuses finds the subscription whatever email was
 * typed into Checkout, so a live one can no longer be overlooked when a
 * duplicate ends. Stripe merges metadata keys, so nothing else is touched.
 *
 * Never throws: a subscription that could not be stamped is resolved through
 * its checkout session again next time, exactly as before.
 */
async function stampSubscriptionUser(
  stripe: Stripe,
  subscriptionId: string,
  userId: string
): Promise<boolean> {
  try {
    await stripe.subscriptions.update(subscriptionId, { metadata: { userId } })
    return true
  } catch (error) {
    console.warn(
      "[subscription] could not stamp userId on",
      subscriptionId,
      error instanceof Error ? error.message : error
    )
    return false
  }
}

export type StampOutcome =
  | "already_stamped"
  | "no_checkout_user"
  | "would_stamp"
  | "stamped"
  | "stamp_failed"

/**
 * One step of the backfill in /api/cron/reconcile-premium?mode=stamp: gives a
 * subscription without metadata.userId the id from its checkout session.
 * With dryRun nothing is written to Stripe.
 */
export async function stampSubscriptionFromCheckout(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  options: { dryRun: boolean }
): Promise<{ userId: string | null; outcome: StampOutcome }> {
  const existing = asUserId(subscription.metadata?.userId)
  if (existing) return { userId: existing, outcome: "already_stamped" }

  // Same lookup as the checkout-session step in resolveSubscriptionUser.
  const sessions = await stripe.checkout.sessions.list({
    subscription: subscription.id,
    limit: 1,
  })
  const userId = asUserId(sessions.data[0]?.metadata?.userId)
  if (!userId) return { userId: null, outcome: "no_checkout_user" }
  if (options.dryRun) return { userId, outcome: "would_stamp" }

  const stamped = await stampSubscriptionUser(stripe, subscription.id, userId)
  return { userId, outcome: stamped ? "stamped" : "stamp_failed" }
}

const PAGE = 100

/**
 * Statuses of every subscription, other than `subscription` itself, that may
 * belong to this user. Deliberately over-inclusive: it collects every Stripe
 * customer tied to the user by id, by metadata.userId or by email, and counts
 * all of their subscriptions. Returns null if any listing was cut off at one
 * page, since a partial list proves nothing.
 */
async function listOtherSubscriptionStatuses(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  userId: string,
  emails: string[]
): Promise<string[] | null> {
  const customerIds = new Set<string>()
  let complete = true
  const addCustomer = (ref: Parameters<typeof idOf>[0]) => {
    const id = idOf(ref)
    if (id) customerIds.add(id)
  }
  addCustomer(subscription.customer)

  const [byMetadata, byEmail, bySession] = await Promise.all([
    stripe.subscriptions.search({ query: `metadata['userId']:'${userId}'`, limit: PAGE }),
    Promise.all(emails.map((email) => stripe.customers.list({ email, limit: PAGE }))),
    Promise.all(
      emails.map((email) =>
        stripe.checkout.sessions.list({
          customer_details: { email },
          status: "complete",
          limit: PAGE,
        })
      )
    ),
  ])

  // Search results can lag by up to a minute, so they are only used to find
  // customers. The statuses come from the list call below, which does not lag.
  if (byMetadata.has_more) complete = false
  byMetadata.data.forEach((found) => addCustomer(found.customer))

  byEmail.forEach((customers) => {
    if (customers.has_more) complete = false
    customers.data.forEach((customer) => addCustomer(customer.id))
  })

  bySession.forEach((sessions) => {
    if (sessions.has_more) complete = false
    sessions.data.forEach((session) => {
      if (session.metadata?.userId === userId) addCustomer(session.customer)
    })
  })

  const lists = await Promise.all(
    Array.from(customerIds).map((customer) =>
      stripe.subscriptions.list({ customer, status: "all", limit: PAGE }).catch((error) => {
        // A customer deleted in Stripe has had all subscriptions cancelled.
        if (error?.code === "resource_missing") return null
        throw error
      })
    )
  )

  const statuses: string[] = []
  lists.forEach((list) => {
    if (!list) return
    if (list.has_more) complete = false
    list.data.forEach((other) => {
      if (other.id !== subscription.id) statuses.push(other.status)
    })
  })

  return complete ? statuses : null
}

export interface PremiumSyncResult {
  decision: PremiumDecision
  /** True only when the flag was actually rewritten. */
  changed: boolean
  /** Dry run only: true when the flag would have been rewritten. */
  wouldChange?: boolean
  /** Status of the subscription in Stripe right now, not as it was in the event. */
  status: string
  userId: string | null
  via: UserResolvedVia | null
  /** Why nothing was done, when the decision alone does not say. */
  reason?: "user_not_resolved" | "no_premium_row" | "unknown_status" | "other_subscription_live" | "incomplete_lookup"
}

/**
 * Brings the premium flag in line with a subscription that Stripe says has
 * changed. Used by the webhook for customer.subscription.updated/deleted.
 *
 * Throws when Stripe or the database cannot be reached, so the webhook can
 * answer 500 and let Stripe retry. Running it twice gives the same result.
 *
 * With dryRun the same lookups and the same decision are made, but nothing is
 * written: not the premium flag and not the metadata stamp in Stripe.
 */
export async function syncPremiumWithSubscription(
  subscriptionId: string,
  options: { dryRun?: boolean } = {}
): Promise<PremiumSyncResult> {
  const stripe = getStripeInstance()

  // Events arrive out of order and are retried for days. Reading the
  // subscription again means a stale "active" can never undo a cancellation.
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const status: string = subscription.status

  let customerEmail: Promise<string | null> | undefined
  const getCustomerEmail = () => {
    if (!customerEmail) {
      customerEmail = (async () => {
        const customerId = idOf(subscription.customer)
        if (!customerId) return null
        const customer = await stripe.customers.retrieve(customerId)
        return customer.deleted ? null : (customer as Stripe.Customer).email
      })()
    }
    return customerEmail
  }

  const resolved = await resolveSubscriptionUser(stripe, subscription, getCustomerEmail)
  if (!resolved) {
    return { decision: "keep", changed: false, status, userId: null, via: null, reason: "user_not_resolved" }
  }
  const { userId, via } = resolved

  // A subscription from before 26 October 2026: write the id onto it now, so
  // that later lookups for this user find it by search and not only by email.
  if (via === "checkout_session" && !options.dryRun) {
    await stampSubscriptionUser(stripe, subscription.id, userId)
  }

  const { data: row, error: rowError } = await getAdmin()
    .from("premium")
    .select("premium, email")
    .eq("uid", userId)
    .maybeSingle()
  if (rowError) throw new Error(`premium lookup failed: ${rowError.message}`)
  if (!row) {
    return { decision: "keep", changed: false, status, userId, via, reason: "no_premium_row" }
  }
  const flagged = String(row.premium).toLowerCase() === "true"

  // Only an ended subscription can lead to a revoke, so only then is the
  // (slower) search for the user's other subscriptions worth making.
  const otherStatuses = ENDED_STATUSES.has(status)
    ? await listOtherSubscriptionStatuses(
        stripe,
        subscription,
        userId,
        emailVariants(row.email as string | null, await getCustomerEmail())
      )
    : []

  const decision = decidePremium(status, otherStatuses)

  if (decision === "keep") {
    const reason = !ENDED_STATUSES.has(status)
      ? "unknown_status"
      : otherStatuses
        ? "other_subscription_live"
        : "incomplete_lookup"
    return { decision, changed: false, status, userId, via, reason }
  }

  const wanted = decision === "grant"
  if (flagged === wanted) {
    return { decision, changed: false, status, userId, via }
  }
  if (options.dryRun) {
    return { decision, changed: false, wouldChange: true, status, userId, via }
  }

  const writeError = await setPremiumFlag(userId, wanted ? "true" : "false")
  if (writeError) throw new Error(`premium update failed: ${writeError.message}`)
  return { decision, changed: true, status, userId, via }
}

/** Resolves the signed-in user from a Supabase access token (Authorization: Bearer). */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) return null

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) return null
  return data.user.id
}
