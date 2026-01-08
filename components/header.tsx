"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SignupPopup } from "./signup-popup"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [popupMode, setPopupMode] = useState<"signup" | "login">("signup")
  const { user, signOut, checkAuthStatus } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/") // Redirect to home page after signing out
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  useEffect(() => {
    const updateAuthStatus = async () => {
      await checkAuthStatus()
    }
    updateAuthStatus()
  }, [checkAuthStatus])

  const isCVMallPage = pathname === "/profil/skapa-cv"
  const isMinaCVPage = pathname === "/profil/mina-cv"

  if (isCVMallPage) {
    return null // Header is now integrated into the CV editor page
  }
  
  // Show header on mina-cv page but it's handled by the page itself

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cvfixaren-ebeQXxOTCrb79kvOYjGEuecJeiitvr.png"
            alt="CVfixaren Logo"
            width={150}
            height={50}
            className="h-8 w-auto"
          />
        </Link>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/profil">
                <Button variant="ghost">Mina CV</Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline">
                Logga ut
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => {
                setIsSignupOpen(true)
                setPopupMode("login")
              }} variant="outline">
                Logga in
              </Button>
            </>
          )}
          <Link href="/profil/skapa-cv?new=true">
            <Button className="bg-[#00bf63] hover:bg-[#00a857] text-white">Skapa CV</Button>
          </Link>
        </nav>
      </div>
      <SignupPopup
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSignupSuccess={() => {
          setIsSignupOpen(false)
          router.push("/profil/skapa-cv")
        }}
        onOpenLogin={() => setPopupMode("login")}
        mode={popupMode}
        setMode={setPopupMode}
      />
    </header>
  )
}
