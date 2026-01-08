import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

// GET - Load CV by ID
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { searchParams } = new URL(request.url)
    const cvId = searchParams.get('id')
    
    // Get current user (must be logged in)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 })
    }
    
    if (!cvId) {
      return NextResponse.json({ success: false, error: 'CV ID is required' }, { status: 400 })
    }
    
    // Get CV
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .eq('id', cvId)
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (error) {
      console.error('❌ Error loading CV:', error)
      throw error
    }
    
    if (!data) {
      console.log('📭 CV not found in database:', cvId)
      return NextResponse.json({ success: false, error: 'CV not found' }, { status: 404 })
    }
    
    console.log('✅ CV loaded from database:', cvId)
    return NextResponse.json({ success: true, cv: data })
  } catch (error: any) {
    console.error('Error loading CV:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

