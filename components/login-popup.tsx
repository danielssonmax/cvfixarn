"use client"

import { useState } from "react"
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
        <div className="w-full bg-white shadow-xl ring-1 ring-black/5 p-6">
          {/* Header */}
          <h1 className="text-lg font-semibold text-gray-900">Logga in</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ange din e-postadress så skickar vi en inloggningslänk till dig.
          </p>

          {success ? (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-1">
                ✓ Magic link skickad!
              </p>
              <p className="text-xs text-green-700">
                Kolla din e-post och klicka på länken för att logga in.
              </p>
            </div>
          ) : (
            <>
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
                      handleLogin()
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
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Skickar..." : "Skicka inloggningslänk"}
                </button>
              </div>
            </>
          )}

          {/* Info text */}
          <p className="mt-4 text-xs text-gray-500 leading-relaxed">
            Vi skickar en säker inloggningslänk till din e-post. Klicka på länken för att logga in.
          </p>

          {/* Signup link */}
          <p className="mt-4 text-sm text-gray-600 text-center">
            Har du inget konto?{" "}
            <a 
              href="#" 
              className="font-medium underline hover:no-underline"
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
