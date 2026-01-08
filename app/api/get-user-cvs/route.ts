import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

// GET - Get all CVs for the current user
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get current user (must be logged in)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 })
    }
    
    // Get all active CVs for this user, ordered by most recently updated
    const { data: cvs, error } = await supabase
      .from('cvs')
      .select('id, cv_name, selected_template, updated_at, created_at')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching user CVs:', error)
      throw error
    }
    
    console.log(`✅ Found ${cvs?.length || 0} CVs for user ${user.id}`)
    return NextResponse.json({ success: true, cvs: cvs || [] })
  } catch (error: any) {
    console.error('Error fetching user CVs:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

