import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

// DELETE - Delete a CV by ID
export async function DELETE(request: NextRequest) {
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
    
    // Soft delete CV by setting active = false (only if it belongs to the user)
    const { error } = await supabase
      .from('cvs')
      .update({ active: false })
      .eq('id', cvId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('❌ Error archiving CV:', error)
      throw error
    }
    
    console.log(`✅ CV archived (soft deleted): ${cvId}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting CV:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

