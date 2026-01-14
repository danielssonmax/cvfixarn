import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    // Get data from request body
    const requestData = await request.json()
    const { user_id, id, title, data } = requestData
    
    // Try to get user from Authorization header if not in body
    let userId = user_id
    const auth = request.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    
    if (token && !userId) {
      // Verify token and get user ID
      const authClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      )
      const { data: userData, error: jwtErr } = await authClient.auth.getUser(token)
      if (!jwtErr && userData.user) {
        userId = userData.user.id
        console.log('✅ Auth successful, user ID:', userId)
      }
    }
    
    if (!userId) {
      console.log('⚠️ No user ID found in request')
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }
    
    if (!data) {
      console.log('⚠️ No data found in request')
      return NextResponse.json({ success: false, error: 'Data is required' }, { status: 400 })
    }
    
    // Use service role key for database operations to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const now = new Date().toISOString()
    const cvToSave = {
      user_id: userId,
      data: data,
      title: title || 'Untitled CV',
      updated_at: now,
    }

    if (id) {
      // Check if CV exists first
      const { data: existingCV, error: checkError } = await supabase
        .from('cvs')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle()
      
      if (checkError) {
        throw checkError
      }
      
      if (!existingCV) {
        // CV doesn't exist - INSERT
        console.log('📝 CV not found, creating new one with id:', id)
        const { data: newCV, error: insertError } = await supabase
          .from('cvs')
          .insert({
            id,
            ...cvToSave,
            created_at: now,
          })
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        return NextResponse.json({ 
          success: true, 
          cv: newCV 
        })
      }
      
      // CV exists - UPDATE
      console.log('✏️ Updating existing CV:', id)
      const { data: updatedCV, error: updateError } = await supabase
        .from('cvs')
        .update(cvToSave)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({ 
        success: true, 
        cv: updatedCV 
      })
    } else {
      // INSERT new CV
      const { data: newCV, error: insertError } = await supabase
        .from('cvs')
        .insert({
          ...cvToSave,
          created_at: now,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return NextResponse.json({ 
        success: true, 
        cv: newCV 
      })
    }
  } catch (error: any) {
    console.error('Error saving CV:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
