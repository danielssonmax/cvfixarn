"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { getGclid, getGbraid, getReferrer } from "@/lib/gclid-utils"

interface SignupPopupProps {
  isOpen: boolean
  onClose: () => void
  onOpenLogin?: () => void
  onSignupSuccess?: () => void
}

export function SignupPopup({ isOpen, onClose, onOpenLogin, onSignupSuccess }: SignupPopupProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const { checkAuthStatus } = useAuth()

  const sendMagicLink = async (emailAddress: string) => {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: emailAddress,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (otpError) throw otpError
    setMagicLinkSent(true)
  }

  const handleSignup = async () => {
    if (!email) {
      setError("Vänligen ange en e-postadress")
      return
    }

    setIsLoading(true)
    setError("")
    setMagicLinkSent(false)

    try {
      // Create user account directly without email verification
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random password
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email: email,
          }
        },
      })

      if (signUpError) {
        // If user already exists, automatically send a magic link instead
        const msg = signUpError.message?.toLowerCase() || ""
        if (msg.includes("already") || msg.includes("exists") || msg.includes("registered") || msg.includes("already registered") || signUpError.status === 422 || signUpError.status === 400) {
          await sendMagicLink(email)
          return
        }
        throw signUpError
      }

      // Supabase may return a user without a session if the email is already taken
      // (some Supabase configs return identities: [] for existing users)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        await sendMagicLink(email)
        return
      }

      // If we got a session, set it explicitly to ensure cookies are set
      if (data.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
        
        if (sessionError) throw sessionError
      }

      // Create row in premium table
      if (data.user) {
        try {
          const gclid = getGclid()
          const gbraid = getGbraid()
          const referer = getReferrer()
          
          const { data: premiumData, error: premiumError } = await supabase
            .from('premium')
            .insert([
              {
                uid: data.user.id,
                email: email,
                premium: 'false',
                gclid: gclid || null,
                gbraid: gbraid || null,
                referer: referer || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select()

          if (premiumError) {
            console.error('Error creating premium row:', premiumError)
          }
        } catch (createUserError) {
          console.error('Error inserting into premium table:', createUserError)
        }
      }

      // Wait a moment for cookies to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Refresh user context
      await checkAuthStatus()
      
      // Track signup conversion for Google Ads
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': 'AW-16880470708/5B1xCODokd8bELSVnvE-',
          'value': 1.0,
          'currency': 'SEK'
        })
      }
      
      // Close popup
      onClose()

      // Call success callback if provided (e.g. open Stripe checkout immediately)
      if (onSignupSuccess) {
        onSignupSuccess()
      }
      
    } catch (error: any) {
      console.error("Signup error:", error)
      setError(error.message || "Ett fel uppstod vid registrering")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-0 !duration-0 !animate-none data-[state=open]:!animate-none data-[state=closed]:!animate-none !rounded-2xl overflow-hidden">
        <DialogTitle className="sr-only">Skapa ditt CV</DialogTitle>
        <div className="w-full bg-white p-6 sm:p-7">
          {/* Header */}
          <h1 className="pr-8 text-xl font-bold tracking-tight text-ink">Skapa ditt CV</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
            Ladda ned ditt CV som PDF, spara och redigera när som helst—allt på ett ställe.
          </p>

          {magicLinkSent ? (
            <div className="mt-4">
              <div role="status" className="rounded-xl border border-brand-200 bg-brand-50 p-4">
                <p className="text-sm text-brand-800 font-medium mb-1">
                  Inloggningslänk skickad!
                </p>
                <p className="text-xs text-brand-700">
                  Vi hittade ett befintligt konto med <strong>{email}</strong>. Kolla din e-post och klicka på länken för att logga in.
                </p>
              </div>
              <p className="mt-4 text-center text-xs leading-relaxed text-ink-400">
                Hittar du inte mejlet? Kolla skräpposten eller försök igen.
              </p>
            </div>
          ) : (
            <>
              {/* Email field */}
              <div className="mt-4">
                <label htmlFor="auth-email" className="block text-sm font-medium text-ink-700">E-post</label>
                <input
                  id="auth-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="namn@exempel.se"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSignup()
                    }
                  }}
                  disabled={isLoading}
                  className="mt-1.5 h-12 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-base text-ink outline-none placeholder:text-ink-300 hover:border-ink-300 focus:border-brand focus:ring-4 focus:ring-brand/15 focus-visible:outline-none disabled:opacity-50"
                />
                
                {error && (
                  <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>
                )}
                
                {/* CTA */}
                <button
                  className="mt-3 h-12 w-full rounded-xl bg-brand px-4 text-base font-semibold text-white shadow-[0_1px_2px_rgb(0_80_40/0.2),0_6px_16px_-6px_rgb(0_191_99/0.5)] hover:bg-brand-600 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSignup}
                  disabled={isLoading}
                >
                  {isLoading ? "Skapar konto..." : "Fortsätt"}
                </button>
              </div>

              {/* Value props */}
              <ul className="mt-5 space-y-2 text-sm text-ink-600">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" strokeWidth={2.5} />
                  Ladda ned som PDF
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" strokeWidth={2.5} />
                  Spara och redigera ditt CV
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" strokeWidth={2.5} />
                  Välj mellan flera professionella mallar
                </li>
              </ul>

              {/* Info text instead of terms checkbox */}
              <p className="mt-4 text-xs leading-relaxed text-ink-400">
                Genom att fortsätta godkänner du våra villkor. 
              </p>

              {/* Login link */}
              <p className="mt-5 border-t border-ink-100 pt-4 text-center text-sm text-ink-500">
                Har du redan ett konto?{" "}
                <a 
                  href="#" 
                  className="font-semibold text-ink underline underline-offset-2 hover:text-brand-700"
                  onClick={(e) => {
                    e.preventDefault()
                    onClose()
                    if (onOpenLogin) {
                      onOpenLogin()
                    }
                  }}
                >
                  Logga in
                </a>
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
