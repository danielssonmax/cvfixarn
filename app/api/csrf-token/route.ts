import { NextResponse } from "next/server"
import { generateCSRFToken, createCSRFTokenResponse } from "@/lib/csrf"
import { validateSessionMiddleware } from "@/lib/session"

export async function GET(request: Request) {
  try {
    // Validate session (optional - can be used for authenticated users)
    const sessionValidation = await validateSessionMiddleware(request)
    
    // Generate CSRF token
    const token = generateCSRFToken(sessionValidation.userId)
    
    // Return token with secure cookie
    return createCSRFTokenResponse(token)
  } catch (error) {
    console.error("Error generating CSRF token:", error)
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    )
  }
}
