import { NextResponse } from "next/server"
import { getSecurityStats, getSecurityEvents } from "@/lib/security-logger"
import { validateSessionMiddleware } from "@/lib/session"

export async function GET(request: Request) {
  try {
    // Validate session (admin only)
    const sessionValidation = await validateSessionMiddleware(request)
    
    if (!sessionValidation.valid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Get security statistics
    const stats = getSecurityStats()
    
    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error getting security stats:", error)
    return NextResponse.json(
      { error: "Failed to get security statistics" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Validate session
    const sessionValidation = await validateSessionMiddleware(request)
    
    if (!sessionValidation.valid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { limit = 100, type, severity, userId } = body
    
    // Get security events with filters
    const events = getSecurityEvents(limit, type, severity, userId)
    
    return NextResponse.json({
      success: true,
      events,
    })
  } catch (error) {
    console.error("Error getting security events:", error)
    return NextResponse.json(
      { error: "Failed to get security events" },
      { status: 500 }
    )
  }
}
