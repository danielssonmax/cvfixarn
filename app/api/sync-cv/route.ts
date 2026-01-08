import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 })
    }

    const cvData = await request.json()
    const { draft_id, version, ...dataToSave } = cvData

    if (!draft_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'draft_id is required for sync' 
      }, { status: 400 })
    }
    // Check if CV with this draft_id already exists (idempotent operation)
    const { data: existingCV, error: checkError } = await supabase
      .from('cvs')
      .select('*')
      .eq('draft_id', draft_id)
      .eq('user_id', user.id)
      .single()

    if (existingCV && !checkError) {
      // CV already synced - return existing CV
      console.log('✅ CV already synced with draft_id:', draft_id)
      return NextResponse.json({ 
        success: true, 
        cv: existingCV,
        alreadyExists: true 
      })
    }

    // Create new CV with draft_id
    const { data: newCV, error: insertError } = await supabase
      .from('cvs')
      .insert({
        ...dataToSave,
        user_id: user.id,
        draft_id,
        version: version || Date.now(),
      })
      .select()
      .single()

    if (insertError) {
      // Check if it's a unique constraint violation (race condition)
      if (insertError.code === '23505') {
        // Another tab/request already created this CV - fetch it
        const { data: racedCV } = await supabase
          .from('cvs')
          .select('*')
          .eq('draft_id', draft_id)
          .eq('user_id', user.id)
          .single()

        if (racedCV) {
          return NextResponse.json({ 
            success: true, 
            cv: racedCV,
            alreadyExists: true 
          })
        }
      }
      
      throw insertError
    }

    return NextResponse.json({ 
      success: true, 
      cv: newCV,
      alreadyExists: false 
    })
  } catch (error: any) {
    console.error('Error syncing CV:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
