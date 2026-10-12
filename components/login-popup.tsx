"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
  onOpenSignup: () => void
}

export function LoginPopup({ isOpen, onClose, onOpenSignup }: LoginPopupProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleLogin = async () => {
    if (!email) {
      setError("Vänligen ange en e-postadress")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Send magic link to existing user
      const { data, error: loginError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // Don't create new user on login
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (loginError) throw loginError

      setSuccess(true)
      
      // Close popup after showing success message
      setTimeout(() => {
        onClose()
      }, 3000)
      
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.message.includes("User not found")) {
        setError("Ingen användare hittades med denna e-postadress. Vill du skapa ett konto?")
      } else {
        setError(error.message || "Ett fel uppstod vid inloggning")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-0 !duration-0 !animate-none data-[state=open]:!animate-none data-[state=closed]:!animate-none !rounded-2xl overflow-hidden">
        <DialogTitle className="sr-only">Logga in</DialogTitle>
        <div className="w-full bg-white p-6 sm:p-7">
          {/* Header */}
          <h1 className="pr-8 text-xl font-bold tracking-tight text-ink">Logga in</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
            Ange din e-postadress så skickar vi en inloggningslänk till dig.
          </p>

          {success ? (
            <div role="status" className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
              <p className="text-sm text-brand-800 font-medium mb-1">
                ✓ Magic link skickad!
              </p>
              <p className="text-xs text-brand-700">
                Kolla din e-post och klicka på länken för att logga in.
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
                      handleLogin()
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
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Skickar..." : "Skicka inloggningslänk"}
                </button>
              </div>
            </>
          )}

          {/* Info text */}
          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Vi skickar en säker inloggningslänk till din e-post. Klicka på länken för att logga in.
          </p>

          {/* Signup link */}
          <p className="mt-5 border-t border-ink-100 pt-4 text-center text-sm text-ink-500">
            Har du inget konto?{" "}
            <a 
              href="#" 
              className="font-semibold text-ink underline underline-offset-2 hover:text-brand-700"
              onClick={(e) => {
                e.preventDefault()
                onClose()
                onOpenSignup()
              }}
            >
              Skapa konto
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
