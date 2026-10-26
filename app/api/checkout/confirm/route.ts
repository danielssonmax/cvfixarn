import { NextResponse } from "next/server"
import { confirmCheckoutSession, getUserIdFromRequest } from "@/lib/subscription"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SESSION_ID = /^cs_(live|test)_[A-Za-z0-9]+$/

/**
 * The page Stripe returns to after checkout calls this before it reports the
 * Google Ads purchase conversion, so only real, completed checkouts are counted.
 */
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ confirmed: false, error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : ""
  if (!SESSION_ID.test(sessionId)) {
    return NextResponse.json({ confirmed: false, error: "Invalid session id" }, { status: 400 })
  }

  try {
    return NextResponse.json(await confirmCheckoutSession(userId, sessionId))
  } catch (error) {
    console.error("[checkout/confirm] could not verify session:", error)
    return NextResponse.json({ confirmed: false, error: "Lookup failed" }, { status: 500 })
  }
}
