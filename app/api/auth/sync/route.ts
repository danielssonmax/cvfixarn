import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json().catch(() => ({} as any))
  if (!access_token || !refresh_token) {
    return NextResponse.json({ ok: false, error: 'Missing tokens' }, { status: 400 })
  }
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { error } = await supabase.auth.setSession({ access_token, refresh_token })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 401 })
  return NextResponse.json({ ok: true })
}

