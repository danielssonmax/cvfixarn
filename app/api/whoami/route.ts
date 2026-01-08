import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'nodejs'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()
  
  return NextResponse.json({
    hasCookies: (await cookies()).getAll().some(c => c.name.startsWith('sb-')),
    userId: session?.user?.id ?? null,
    cookieNames: (await cookies()).getAll().map(c => c.name),
  })
}

