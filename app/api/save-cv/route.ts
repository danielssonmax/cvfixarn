import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { isTitleConflict, nextTitle } from '@/lib/cv-title'

export const runtime = 'nodejs'

const MAX_TITLE_ATTEMPTS = 6

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
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Data is required' }, { status: 400 })
    }

    // Use service role key for database operations to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const now = new Date().toISOString()
    const requestedTitle = title || 'Untitled CV'

    /**
     * Older databases still carry a unique index on (user_id, title), but the
     * editor names every new CV "cv.pdf" - so the second one a user creates
     * collides and their work silently stops saving. Retry under a numbered
     * title instead of failing, and tell the client which title actually stuck.
     * The accompanying migration drops the index; this keeps deployments that
     * have not run it yet working.
     */
    const saveWithTitle = async (
      run: (attemptTitle: string) => PromiseLike<{ data: any; error: any }>,
    ): Promise<{ row: any; usedTitle: string }> => {
      let attemptTitle = requestedTitle

      for (let attempt = 2; attempt <= MAX_TITLE_ATTEMPTS + 1; attempt++) {
        const { data: row, error } = await run(attemptTitle)
        if (!error) return { row, usedTitle: attemptTitle }
        if (!isTitleConflict(error)) throw error

        console.warn(`CV title "${attemptTitle}" already taken for user, retrying`)
        attemptTitle = nextTitle(requestedTitle, attempt)
      }

      throw new Error('Could not find an available CV title')
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
        const { row, usedTitle } = await saveWithTitle((attemptTitle) =>
          supabase
            .from('cvs')
            .insert({ id, user_id: userId, data, title: attemptTitle, updated_at: now, created_at: now })
            .select()
            .single()
        )

        return NextResponse.json({ success: true, cv: row, title: usedTitle })
      }

      const { row, usedTitle } = await saveWithTitle((attemptTitle) =>
        supabase
          .from('cvs')
          .update({ user_id: userId, data, title: attemptTitle, updated_at: now })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()
      )

      return NextResponse.json({ success: true, cv: row, title: usedTitle })
    }

    const { row, usedTitle } = await saveWithTitle((attemptTitle) =>
      supabase
        .from('cvs')
        .insert({ user_id: userId, data, title: attemptTitle, updated_at: now, created_at: now })
        .select()
        .single()
    )

    return NextResponse.json({ success: true, cv: row, title: usedTitle })
  } catch (error: any) {
    console.error('Error saving CV:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
