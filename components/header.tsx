"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
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

  const navLinks = [
    { href: "/cv-mallar", label: "CV-mallar" },
    { href: "/cv-exempel", label: "CV-exempel" },
    { href: "/skriva-cv", label: "Skriva CV" },
    { href: "/blogg", label: "Blogg" },
  ]

  return (
    <header className="glass sticky top-0 z-40 border-b border-ink-100/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex shrink-0 items-center" aria-label="CVfixaren – till startsidan">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cvfixaren-ebeQXxOTCrb79kvOYjGEuecJeiitvr.png"
              alt="CVfixaren Logo"
              width={150}
              height={50}
              className="h-7 w-auto sm:h-8"
              priority
            />
          </Link>
          <nav aria-label="Huvudmeny" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-ink" : "text-ink-500 hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Button asChild variant="ghost" className="px-3 sm:px-4">
                <Link href="/profil">Mina CV</Link>
              </Button>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                aria-label="Logga ut"
                className="w-10 px-0 sm:w-auto sm:px-4"
              >
                <LogOut className="h-4 w-4 sm:hidden" />
                <span className="hidden sm:inline">Logga ut</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setIsSignupOpen(true)
                setPopupMode("login")
              }}
              variant="ghost"
              className="px-3 sm:px-4"
            >
              Logga in
            </Button>
          )}
          <Button asChild className="px-4 sm:px-5">
            <Link href="/profil/skapa-cv?new=true">Skapa CV</Link>
          </Button>
        </div>
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
