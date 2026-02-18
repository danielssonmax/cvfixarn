import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// DELETE - Delete a CV by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cvId = searchParams.get('id')
    
    if (!cvId) {
      return NextResponse.json({ success: false, error: 'CV ID is required' }, { status: 400 })
    }

    // Authenticate user via Authorization header
    const auth = request.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    let userId: string | null = null

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )

    if (token) {
      const { data: userData, error: jwtErr } = await authClient.auth.getUser(token)
      if (!jwtErr && userData.user) {
        userId = userData.user.id
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 })
    }

    // Use service role key for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Delete CV (only if it belongs to the user)
    const { error } = await supabase
      .from('cvs')
      .delete()
      .eq('id', cvId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('❌ Error deleting CV:', error)
      throw error
    }
    
    console.log(`✅ CV deleted: ${cvId}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting CV:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

