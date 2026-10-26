import "server-only"
import { createClient } from "@supabase/supabase-js"
import { getStripeInstance } from "@/lib/stripe"

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
const LIVE_STATUSES = new Set(["trialing", "active", "past_due"])

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

async function markPremium(userId: string) {
  const { error } = await getAdmin()
    .from("premium")
    .update({ premium: "true", updated_at: new Date().toISOString() })
    .eq("uid", userId)
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
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.status !== "complete" || session.metadata?.userId !== userId) {
    return { confirmed: false }
  }
  await markPremium(userId)
  return { confirmed: true, transactionId: session.id }
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
