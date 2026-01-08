"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Linkedin, AlertCircle, CheckCircle2 } from "lucide-react"

interface LinkedInImportPopupProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: (data: any) => void
}

export function LinkedInImportPopup({ isOpen, onClose, onImportSuccess }: LinkedInImportPopupProps) {
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleImport = async () => {
    setError("")
    setSuccess(false)

    // Validera URL
    if (!linkedinUrl.trim()) {
      setError("Vänligen ange en LinkedIn URL")
      return
    }

    if (!linkedinUrl.includes("linkedin.com/in/")) {
      setError("Ogiltig LinkedIn URL. Exempel: https://www.linkedin.com/in/ditt-namn")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/import-linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ linkedinUrl }),
      })

      // Hantera 404 specifikt
      if (response.status === 404) {
        setError("API-endpointen kunde inte hittas. Uppdatera sidan (Cmd+Shift+R) och försök igen.")
        setIsLoading(false)
        return
      }

      // Försök parsa JSON-svaret
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        setError("Ogiltigt svar från servern. Kontrollera att servern körs på rätt port.")
        setIsLoading(false)
        return
      }

      // Hantera fel från servern
      if (!response.ok) {
        const errorMessage = result.error || "Kunde inte importera LinkedIn-data"
        
        // Hantera specifika statuskoder
        if (response.status === 503) {
          setError("LinkedIn-import är inte konfigurerad eller tjänsten är otillgänglig.")
        } else if (response.status === 429) {
          setError("För många förfrågningar. Vänta en stund och försök igen.")
        } else if (response.status === 401 || response.status === 403) {
          setError("Autentiseringsfel. Kontakta administratören.")
        } else if (response.status === 404) {
          setError("LinkedIn-profilen kunde inte hittas. Kontrollera att URL:en är korrekt och att profilen är offentlig.")
        } else if (response.status >= 500) {
          setError("Serverfel. Försök igen om en stund.")
        } else {
          setError(errorMessage)
        }
        
        setIsLoading(false)
        return
      }

      // Validera att vi fick data
      if (!result.success || !result.data) {
        setError("Ingen data kunde importeras från LinkedIn-profilen.")
        setIsLoading(false)
        return
      }

      setSuccess(true)
      
      // Vänta lite så användaren ser success-meddelandet
      setTimeout(() => {
        onImportSuccess(result.data)
        onClose()
        setLinkedinUrl("")
        setSuccess(false)
      }, 1500)
    } catch (err) {
      console.error("Import error:", err)
      
      // Hantera nätverksfel
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Nätverksfel. Kontrollera att servern körs och att du är ansluten.")
      } else {
        setError(err instanceof Error ? err.message : "Ett oväntat fel uppstod vid import")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setLinkedinUrl("")
      setError("")
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#0077B5] to-[#005885] bg-clip-text text-transparent flex items-center gap-2">
            <Linkedin className="h-6 w-6 text-[#0077B5]" />
            Importera från LinkedIn
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Klistra in länken till din LinkedIn-profil för att automatiskt fylla i ditt CV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="linkedin-url" className="text-sm font-medium text-gray-700">
              LinkedIn Profil-URL
            </label>
            <Input
              id="linkedin-url"
              type="url"
              placeholder="https://www.linkedin.com/in/ditt-namn"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={isLoading}
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleImport()
                }
              }}
            />
            <p className="text-xs text-gray-500">
              Tips: Gå till din LinkedIn-profil och kopiera URL:en från adressfältet
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Fel vid import</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Import lyckades!</p>
                <p className="text-sm text-green-700 mt-1">Din LinkedIn-data fylls nu i formuläret</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Vad importeras?</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Personlig information (namn, titel, plats)</li>
              <li>• Arbetserfarenhet</li>
              <li>• Utbildning</li>
              <li>• Kompetenser</li>
              <li>• Certifieringar</li>
              <li>• Kurser</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Avbryt
          </Button>
          <Button
            onClick={handleImport}
            disabled={isLoading || !linkedinUrl.trim()}
            className="flex-1 sm:flex-none bg-gradient-to-r from-[#0077B5] to-[#005885] hover:from-[#005885] hover:to-[#004065] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importerar...
              </>
            ) : (
              <>
                <Linkedin className="h-4 w-4 mr-2" />
                Importera
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

