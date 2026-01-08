"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

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
  const { checkAuthStatus } = useAuth()

  const handleSignup = async () => {
    if (!email) {
      setError("Vänligen ange en e-postadress")
      return
    }

    setIsLoading(true)
    setError("")

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

      if (signUpError) throw signUpError

      // If we got a session, set it explicitly to ensure cookies are set
      if (data.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
        
        if (sessionError) throw sessionError
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
      
      // Show simple alert
      alert("✅ Konto skapat! Dina ändringar sparas automatiskt.")
      
      // Call success callback if provided
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
        <div className="w-full bg-white shadow-xl ring-1 ring-black/5 p-6">
          {/* Header */}
          <h1 className="text-lg font-semibold text-gray-900">Skapa ditt CV</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ladda ned ditt CV som PDF, spara och redigera när som helst—allt på ett ställe.
          </p>

          {/* Email field */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-800">E-post</label>
            <input
              type="email"
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
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-[15px] outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-700 disabled:opacity-50"
            />
            
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            
            {/* CTA */}
            <button
              className="mt-3 w-full rounded-md bg-[#00bf63] px-4 py-2.5 text-white font-semibold hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? "Skapar konto..." : "Fortsätt"}
            </button>
          </div>

          {/* Value props */}
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
              Ladda ned som PDF
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
              Spara och redigera ditt CV
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
              Välj mellan flera professionella mallar
            </li>
          </ul>

          {/* Info text instead of terms checkbox */}
          <p className="mt-4 text-xs text-gray-500 leading-relaxed">
            Genom att fortsätta godkänner du våra villkor. 
          </p>

          {/* Login link */}
          <p className="mt-4 text-sm text-gray-600 text-center">
            Har du redan ett konto?{" "}
            <a 
              href="#" 
              className="font-medium underline hover:no-underline"
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
