import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Try cookie-based auth first
    let { data: { user } } = await supabase.auth.getUser()
    
    // Fallback: Authorization: Bearer <access_token>
    if (!user) {
      const auth = request.headers.get('authorization') || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
      if (token) {
        console.log('🔑 Trying header-based auth...')
        const serverClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { persistSession: false } }
        )
        const { data: userData, error: jwtErr } = await serverClient.auth.getUser(token)
        if (!jwtErr && userData.user) {
          user = userData.user
          console.log('✅ Header-based auth successful:', user.id)
        }
      }
    } else {
      console.log('✅ Cookie-based auth successful:', user.id)
    }
    
    if (!user) {
      console.log('⚠️ No user session found')
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 })
    }

    const cvData = await request.json()
    const { id, version, draft_id, ...dataToSave } = cvData
    
    if (id) {
      // Check if CV exists first
      const { data: existingCV, error: checkError } = await supabase
        .from('cvs')
        .select('version')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle() // Returns null if not found, doesn't throw error
      
      if (checkError) {
        throw checkError
      }
      
      if (!existingCV) {
        // CV doesn't exist - INSERT instead of UPDATE
        console.log('📝 CV not found, creating new one with id:', id)
        const newVersion = Date.now()
        const { data: newCV, error: insertError } = await supabase
          .from('cvs')
          .insert({
            id, // Use the provided ID
            ...dataToSave,
            user_id: user.id,
            version: newVersion,
            active: true, // New CVs are active by default
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
      
      // CV exists - UPDATE with optimistic locking
      console.log('✏️ Updating existing CV:', id)
      
      // Check version conflict
      if (version && existingCV.version > version) {
        return NextResponse.json({
          success: false,
          error: 'Version conflict - CV was updated by another tab/device',
          conflict: true,
          currentVersion: existingCV.version,
        }, { status: 409 })
      }

      // Update with new version
      const newVersion = Date.now()
      const { data: updatedCV, error: updateError } = await supabase
        .from('cvs')
        .update({
          ...dataToSave,
          version: newVersion,
        })
        .eq('id', id)
        .eq('user_id', user.id)
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
      const newVersion = Date.now()
      const { data: newCV, error: insertError } = await supabase
        .from('cvs')
        .insert({
          ...dataToSave,
          user_id: user.id,
          draft_id: draft_id || null,
          version: newVersion,
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
