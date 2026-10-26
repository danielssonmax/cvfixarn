import { NextResponse } from "next/server"
import { getSubscriptionStatus, getUserIdFromRequest } from "@/lib/subscription"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Asked by the editor before it shows the checkout popup. The client-side
 * premium check only reads the flag; this one also asks Stripe, so a customer
 * whose flag never got set is recognised (and repaired) instead of being sold a
 * second subscription.
 */
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ subscribed: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { subscribed } = await getSubscriptionStatus(userId)
    return NextResponse.json({ subscribed })
  } catch (error) {
    console.error("[subscription-status] lookup failed:", error)
    return NextResponse.json({ subscribed: false, error: "Lookup failed" }, { status: 500 })
  }
}
