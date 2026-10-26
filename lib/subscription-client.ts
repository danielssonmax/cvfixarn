import { supabase } from "@/lib/supabase"

/**
 * Asks the server whether the signed-in user already has a subscription. Call
 * this before showing the checkout popup: the premium flag read on page load can
 * still be loading, or be stale, and the server also checks Stripe itself.
 */
export async function fetchIsSubscribed(): Promise<boolean> {
  try {
    const result = await postWithSession("/api/subscription-status")
    return result?.subscribed === true
  } catch (error) {
    console.error("Could not check subscription status:", error)
    return false
  }
}

/**
 * Verifies a Stripe checkout session server-side after the customer returns.
 * Resolves to the session id (used as the conversion's transaction id), or null
 * if the checkout is not complete or not this user's.
 */
export async function confirmCheckout(sessionId: string): Promise<string | null> {
  try {
    const result = await postWithSession("/api/checkout/confirm", { sessionId })
    return result?.confirmed === true ? result.transactionId ?? sessionId : null
  } catch (error) {
    console.error("Could not confirm checkout:", error)
    return null
  }
}

async function postWithSession(url: string, body?: unknown) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) return null

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return response.json()
}
