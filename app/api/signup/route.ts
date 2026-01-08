import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { registerSchema, validateRequest, sanitizeInput } from "@/lib/validations"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const sanitizedBody = sanitizeInput(body)
    
    const validation = validateRequest(registerSchema, sanitizedBody)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Valideringsfel", 
        details: (validation as any).errors 
      }, { status: 400 })
    }

    const { userId, email, name } = validation.data

    const { error } = await supabase.from("premium").insert([{ uid: userId, email, name, premium: false }])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error creating user" }, { status: 500 })
  }
}
