import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// GET - Get all CVs for the current user
export async function GET(request: NextRequest) {
  try {
    // Authenticate user via Authorization header or cookie-based session
    const auth = request.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )

    let userId: string | null = null

    if (token) {
      const { data: userData, error: jwtErr } = await authClient.auth.getUser(token)
      if (!jwtErr && userData.user) {
        userId = userData.user.id
      }
    }

    // Fallback: try cookie-based auth
    if (!userId) {
      const cookieHeader = request.headers.get('cookie') || ''
      const sbAccessToken = cookieHeader
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('sb-') && c.includes('-auth-token'))

      if (sbAccessToken) {
        try {
          const cookieValue = decodeURIComponent(sbAccessToken.split('=').slice(1).join('='))
          const parsed = JSON.parse(cookieValue)
          const accessToken = parsed?.[0] || parsed?.access_token
          if (accessToken) {
            const { data: userData } = await authClient.auth.getUser(accessToken)
            if (userData?.user) {
              userId = userData.user.id
            }
          }
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 })
    }

    // Use service role key for database operations to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Get all CVs for this user, ordered by most recently updated
    const { data: cvs, error } = await supabase
      .from('cvs')
      .select('id, title, data, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching user CVs:', error)
      throw error
    }

    console.log(`✅ Found ${cvs?.length || 0} CVs for user ${userId}`)
    return NextResponse.json({ success: true, cvs: cvs || [] })
  } catch (error: any) {
    console.error('Error fetching user CVs:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

