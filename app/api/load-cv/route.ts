import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// GET - Load CV by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cvId = searchParams.get('id')
    const userId = searchParams.get('user_id')
    
    if (!cvId) {
      return NextResponse.json({ success: false, error: 'CV ID is required' }, { status: 400 })
    }
    
    // Use service role key for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    
    // Build query
    let query = supabase
      .from('cvs')
      .select('id, user_id, data, title, created_at, updated_at')
      .eq('id', cvId)
    
    // If user_id is provided, filter by it
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data, error } = await query.maybeSingle()
    
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

