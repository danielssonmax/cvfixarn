"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { X, Settings, Cookie } from "lucide-react"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = "cookie_consent_preferences"
const COOKIE_CONSENT_VERSION = "1.0"

export function CookieConsent() {
  const pathname = usePathname()
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  const isPrintPage = pathname === "/print"

  useEffect(() => {
    if (isPrintPage) return

    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
    
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        if (parsed.version === COOKIE_CONSENT_VERSION) {
          setPreferences(parsed.preferences)
          applyConsent(parsed.preferences)
          setShowIcon(true)
          return
        }
      } catch (e) {
        console.error("Error parsing saved consent:", e)
      }
    }
    
    // No valid consent found, show banner
    setShowBanner(true)
    
    // Set default consent to denied
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      })
    }
  }, [isPrintPage])

  const applyConsent = (prefs: CookiePreferences) => {
    if (typeof window === "undefined") return
    
    const gtag = (window as any).gtag
    const dataLayer = (window as any).dataLayer || []
    
    if (gtag) {
      // Analytics consent
      if (prefs.analytics) {
        gtag("consent", "update", {
          analytics_storage: "granted",
        })
        dataLayer.push({
          event: "consent_accepted_analytics",
        })
      } else {
        gtag("consent", "update", {
          analytics_storage: "denied",
        })
      }
      
      // Marketing consent
      if (prefs.marketing) {
        gtag("consent", "update", {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
        })
        dataLayer.push({
          event: "consent_accepted_marketing",
        })
      } else {
        gtag("consent", "update", {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        })
      }
    }
  }

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        version: COOKIE_CONSENT_VERSION,
        preferences: prefs,
        timestamp: new Date().toISOString(),
      })
    )
    applyConsent(prefs)
  }

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allAccepted)
    saveConsent(allAccepted)
    setShowBanner(false)
    setShowPreferences(false)
    setShowIcon(true)
  }

  const rejectNonEssential = () => {
    const essentialOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    setPreferences(essentialOnly)
    saveConsent(essentialOnly)
    setShowBanner(false)
    setShowPreferences(false)
    setShowIcon(true)
  }

  const savePreferences = () => {
    saveConsent(preferences)
    setShowBanner(false)
    setShowPreferences(false)
    setShowIcon(true)
  }

  const openPreferences = () => {
    setShowBanner(false)
    setShowPreferences(true)
  }

  // Hide on print page to prevent it from appearing in exported PDFs
  if (isPrintPage) return null

  // Cookie icon to reopen preferences
  if (showIcon && !showBanner && !showPreferences) {
    return (
      <button
        onClick={() => setShowPreferences(true)}
        className="fixed bottom-4 left-4 z-50 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
        aria-label="Öppna cookie-inställningar"
      >
        <Cookie className="h-6 w-6 text-gray-700" />
      </button>
    )
  }

  // Preferences modal
  if (showPreferences) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowPreferences(false)} />
        
        {/* Modal */}
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cookie-inställningar</h2>
            <button
              onClick={() => {
                setShowPreferences(false)
                setShowIcon(true)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Vi respekterar din rätt till integritet. Du kan välja att inte tillåta vissa typer av cookies.
          </p>
          
          <div className="space-y-4">
            {/* Necessary cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Nödvändiga</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Dessa cookies är nödvändiga för att webbplatsen ska fungera.
                  </p>
                </div>
                <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Alltid aktiv
                </div>
              </div>
            </div>
            
            {/* Analytics cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <h3 className="font-medium text-gray-900">Analys</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Hjälper oss att förstå hur besökare använder webbplatsen.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00bf63]"></div>
                </label>
              </div>
            </div>
            
            {/* Marketing cookies */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <h3 className="font-medium text-gray-900">Marknadsföring</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Används för att visa relevanta annonser och mäta kampanjresultat.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00bf63]"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={rejectNonEssential}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Neka alla
            </button>
            <button
              onClick={savePreferences}
              className="flex-1 px-4 py-2.5 bg-[#00bf63] text-white rounded-lg hover:bg-[#00a857] transition-colors font-medium"
            >
              Spara val
            </button>
          </div>
        </div>
      </>
    )
  }

  // Main banner
  if (!showBanner) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" />
      
      {/* Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-lg z-50 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
        <div className="flex items-start gap-3 mb-4">
          <Cookie className="h-6 w-6 text-[#00bf63] flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Vi använder cookies</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Vi använder enhetsidentifierare för att anpassa innehållet och annonserna till användarna, 
              tillhandahålla funktioner för sociala medier och analysera vår trafik. Vi vidarebefordrar 
              även sådana identifierare och annan information från din enhet till de sociala medier och 
              annons- och analysföretag som vi samarbetar med.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={acceptAll}
            className="flex-1 px-4 py-2.5 bg-[#00bf63] text-white rounded-lg hover:bg-[#00a857] transition-colors font-medium"
          >
            Acceptera alla
          </button>
          <button
            onClick={rejectNonEssential}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Neka kakor
          </button>
          <button
            onClick={openPreferences}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Preferenser
          </button>
        </div>
      </div>
    </>
  )
}
