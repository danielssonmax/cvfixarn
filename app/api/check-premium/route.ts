import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { checkPremiumSchema, validateRequest, sanitizeInput } from "@/lib/validations"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const validation = validateRequest(checkPremiumSchema, { email })
  if (!validation.success) {
    return NextResponse.json({ 
      error: "Valideringsfel", 
      details: (validation as any).errors 
    }, { status: 400 })
  }

  const { email: validatedEmail } = validation.data

  try {
    const { data, error } = await supabase.from("premium").select("premium").eq("email", validatedEmail).maybeSingle()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to check premium status" }, { status: 500 })
    }

    // If no data is found, assume the user is not premium
    const isPremium = data?.premium ?? false

    return NextResponse.json({ premium: isPremium })
  } catch (error) {
    console.error("Error checking premium status:", error)
    return NextResponse.json({ error: "Failed to check premium status" }, { status: 500 })
  }
}
