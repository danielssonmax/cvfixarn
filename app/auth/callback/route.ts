import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    // If session was created successfully and we have a user, ensure premium row exists
    if (sessionData?.user && !sessionError) {
      const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      
      // Check if premium row exists
      const { data: existingPremium, error: checkError } = await supabaseAdmin
        .from('premium')
        .select('uid')
        .eq('uid', sessionData.user.id)
        .maybeSingle()
      
      // If no row exists, create one (use upsert to handle race conditions)
      if (!existingPremium && !checkError) {
        const nameFromEmail = sessionData.user.email?.split('@')[0] || sessionData.user.email || 'User'
        
        await supabaseAdmin
          .from('premium')
          .upsert([{
            uid: sessionData.user.id,
            email: sessionData.user.email || '',
            name: nameFromEmail,
            premium: 'false',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }], {
            onConflict: 'uid',
            ignoreDuplicates: false
          })
      }
    }
  }

  // Redirect to the CV editor page after successful authentication; ?new=true opens payment dialog immediately
  return NextResponse.redirect(new URL('/profil/skapa-cv?new=true', request.url))
}

