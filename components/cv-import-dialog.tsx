"use client"

import { useCallback, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, FileText, Loader2, Upload } from "lucide-react"

interface ImportSummary {
  personalInfo: boolean
  workExperience: number
  education: number
  skills: number
  languages: number
  sections: string[]
}

interface CvImportDialogProps {
  isOpen: boolean
  onClose: () => void
  /** Called when the user confirms the parsed result. */
  onImport: (data: any) => void
}

const SECTION_LABELS: Record<string, string> = {
  profile: "Profil",
  experience: "Yrkeslivserfarenhet",
  education: "Utbildning",
  skills: "Färdigheter",
  languages: "Språk",
  courses: "Kurser",
  internship: "Praktik",
  certificates: "Certifikat",
  licenses: "Licenser",
  awards: "Utmärkelser",
  achievements: "Prestationer",
  volunteering: "Volontärarbete",
  references: "Referenser",
  traits: "Egenskaper",
  hobbies: "Fritidsaktiviteter",
}

const ACCEPTED = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

export function CvImportDialog({ isOpen, onClose, onImport }: CvImportDialogProps) {
  const [status, setStatus] = useState<"idle" | "reading" | "ready" | "error">("idle")
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const [result, setResult] = useState<{ data: any; found: ImportSummary } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setError("")
    setFileName("")
    setResult(null)
    setIsDragging(false)
    if (inputRef.current) inputRef.current.value = ""
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  const upload = useCallback(async (file: File) => {
    setFileName(file.name)
    setStatus("reading")
    setError("")

    try {
      const body = new FormData()
      body.append("file", file)

      const response = await fetch("/api/import-cv", { method: "POST", body })
      const payload = await response.json()

      if (!response.ok || !payload?.success) {
        setError(payload?.error || "Kunde inte läsa filen. Försök igen.")
        setStatus("error")
        return
      }

      setResult({ data: payload.data, found: payload.found })
      setStatus("ready")
    } catch {
      setError("Något gick fel vid uppladdningen. Kontrollera din anslutning och försök igen.")
      setStatus("error")
    }
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files?.[0]
      if (file) upload(file)
    },
    [upload],
  )

  const summaryRows = (() => {
    if (!result) return []
    const { found, data } = result
    const rows: string[] = []
    const name = `${data?.personalInfo?.firstName || ""} ${data?.personalInfo?.lastName || ""}`.trim()
    if (name) rows.push(`Namn: ${name}`)
    if (data?.personalInfo?.email) rows.push(`E-post: ${data.personalInfo.email}`)
    if (data?.personalInfo?.phone) rows.push(`Telefon: ${data.personalInfo.phone}`)
    if (found.workExperience) rows.push(`${found.workExperience} jobb under Yrkeslivserfarenhet`)
    if (found.education) rows.push(`${found.education} poster under Utbildning`)
    if (found.skills) rows.push(`${found.skills} färdigheter`)
    if (found.languages) rows.push(`${found.languages} språk`)

    const extras = found.sections
      .filter((id) => !["experience", "education", "skills", "languages"].includes(id))
      .map((id) => SECTION_LABELS[id] || id)
    if (extras.length) rows.push(`Även: ${extras.join(", ")}`)
    return rows
  })()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : handleClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Ladda upp ditt nuvarande CV</DialogTitle>
          <DialogDescription>
            Vi läser innehållet och fyller i fälten åt dig. Du kan ändra allt efteråt.
          </DialogDescription>
        </DialogHeader>

        {(status === "idle" || status === "error") && (
          <div className="space-y-3">
            <div
              className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer ${
                isDragging ? "border-[#00bf63] bg-green-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900">Dra hit din fil eller klicka för att välja</p>
              <p className="mt-1 text-[13px] text-gray-500">PDF eller Word (.docx), max 5 MB</p>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) upload(file)
                }}
              />
            </div>

            {status === "error" && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-[13px] leading-relaxed text-gray-500">
              Filen läses på vår server och sparas inte. Är ditt CV inskannat som en bild finns ingen text
              att läsa – då behöver du fylla i uppgifterna själv.
            </p>
          </div>
        )}

        {status === "reading" && (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00bf63]" />
            <p className="text-sm text-gray-700">Läser {fileName}…</p>
          </div>
        )}

        {status === "ready" && result && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg bg-green-50 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[#00bf63]" />
              <div className="text-sm text-gray-800">
                <p className="font-medium">Vi hittade det här i {fileName}</p>
                <ul className="mt-2 space-y-1 text-[13px] text-gray-600">
                  {summaryRows.map((row) => (
                    <li key={row} className="flex items-start gap-2">
                      <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gray-400" />
                      <span>{row}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed text-gray-500">
              Innehållet ersätter det som redan står i editorn. Kontrollera gärna datum och beskrivningar
              efteråt – automatisk inläsning blir sällan helt perfekt.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={reset}>
                Välj en annan fil
              </Button>
              <Button
                className="flex-1 bg-[#00bf63] hover:bg-[#00a857] text-white"
                onClick={() => {
                  onImport(result.data)
                  handleClose()
                }}
              >
                Fyll i mitt CV
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CvImportDialog
