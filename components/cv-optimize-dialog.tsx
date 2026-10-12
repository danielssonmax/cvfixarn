"use client"

import { useCallback, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, Check, Info, Loader2, Sparkles, Wand2 } from "lucide-react"
import { JOB_AD_MIN_LENGTH } from "@/lib/cv-optimize/prompt"
import type { OptimizeCvInput, OptimizeResult, Proposal } from "@/lib/cv-optimize/types"

interface CvOptimizeDialogProps {
  isOpen: boolean
  onClose: () => void
  /** Snapshot of the current form, read lazily when the user submits. */
  getCv: () => OptimizeCvInput
  /** Applies the proposals the user ticked. */
  onApply: (proposals: Proposal[]) => void
}

const KIND_LABEL: Record<Proposal["kind"], string> = {
  heading: "Rubrik",
  order: "Ordning",
  contact: "Kontakt",
  title: "Jobbtitel",
  text: "Text",
  skill: "Kompetenser",
}

export function CvOptimizeDialog({ isOpen, onClose, getCv, onApply }: CvOptimizeDialogProps) {
  const [jobAd, setJobAd] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [error, setError] = useState("")
  const [result, setResult] = useState<OptimizeResult | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const reset = useCallback(() => {
    setJobAd("")
    setStatus("idle")
    setError("")
    setResult(null)
    setChecked({})
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  const analyse = useCallback(async () => {
    setStatus("loading")
    setError("")

    try {
      const response = await fetch("/api/optimize-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobAd, cv: getCv() }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setError(payload?.error || "Analysen misslyckades. Försök igen.")
        setStatus("error")
        return
      }

      const data = payload as OptimizeResult
      setResult(data)
      setChecked(
        Object.fromEntries(data.proposals.map((p) => [p.id, p.defaultChecked]))
      )
      setStatus("ready")
    } catch {
      setError("Kunde inte nå servern. Kontrollera din uppkoppling och försök igen.")
      setStatus("error")
    }
  }, [jobAd, getCv])

  const selected = useMemo(
    () => (result?.proposals || []).filter((p) => checked[p.id]),
    [result, checked]
  )

  const apply = useCallback(() => {
    onApply(selected)
    handleClose()
  }, [onApply, selected, handleClose])

  const tooShort = jobAd.trim().length < JOB_AD_MIN_LENGTH

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#00bf63]" />
            Optimera mitt CV
          </DialogTitle>
          <DialogDescription>
            {status === "ready"
              ? "Gå igenom förslagen och välj vilka du vill använda."
              : "Klistra in jobbannonsen du söker. Vi anpassar ditt CV mot just den tjänsten."}
          </DialogDescription>
        </DialogHeader>

        {/* ---------------------------------------------------------- input */}
        {status !== "ready" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="job-ad" className="mb-1.5 block text-sm font-medium text-gray-900">
                Jobbannons
              </label>
              <textarea
                id="job-ad"
                value={jobAd}
                onChange={(event) => setJobAd(event.target.value)}
                rows={10}
                placeholder="Klistra in hela annonsen här – arbetsuppgifter, krav och meriterande."
                className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-[#00bf63] focus:ring-2 focus:ring-[#00bf63]/20"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Ju mer av annonsen du tar med, desto träffsäkrare blir nyckelorden.
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-[13px] leading-relaxed text-blue-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Vi skriver bara om det som redan står i ditt CV. Saknar du något annonsen
                kräver säger vi till – vi hittar aldrig på erfarenhet åt dig.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Avbryt
              </Button>
              <Button
                onClick={analyse}
                disabled={tooShort || status === "loading"}
                className="bg-[#00bf63] text-white hover:bg-[#00a857]"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyserar...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Analysera
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- results */}
        {status === "ready" && result && (
          <div className="space-y-5">
            {result.rulesOnly && result.proposals.length === 0 && (
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                Vi hittade inget att justera automatiskt i strukturen. Gå igenom
                nyckelorden i annonsen och se till att de återkommer i dina
                beskrivningar.
              </div>
            )}

            {/* Keyword coverage */}
            {result.keywords.length > 0 && (
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Nyckelord från annonsen
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-[#00bf63]">
                    {result.coverage}% täckning
                  </span>
                </div>
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#00bf63] transition-all"
                    style={{ width: `${Math.max(2, result.coverage)}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.map((keyword) => (
                    <span
                      key={keyword.term}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        keyword.present
                          ? "bg-green-50 text-green-800"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {keyword.term}
                    </span>
                  ))}
                </div>
                {result.gaps.length > 0 && (
                  <p className="mt-3 text-[13px] leading-relaxed text-gray-600">
                    De gulmarkerade orden saknas i ditt CV. Har du erfarenheten men
                    har glömt skriva ut den — lägg till den själv. Har du den inte,
                    lämna den. Vi lägger aldrig in den åt dig.
                  </p>
                )}
              </div>
            )}

            {/* Proposals */}
            {result.proposals.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Förslag ({result.proposals.length})
                  </h3>
                  <button
                    type="button"
                    className="text-xs font-medium text-[#00bf63] hover:underline"
                    onClick={() =>
                      setChecked((prev) => {
                        const allOn = result.proposals.every((p) => prev[p.id])
                        return Object.fromEntries(
                          result.proposals.map((p) => [p.id, !allOn])
                        )
                      })
                    }
                  >
                    {result.proposals.every((p) => checked[p.id])
                      ? "Avmarkera alla"
                      : "Markera alla"}
                  </button>
                </div>

                {result.proposals.map((proposal) => (
                  <label
                    key={proposal.id}
                    className={`block cursor-pointer rounded-xl border p-3 transition-colors ${
                      checked[proposal.id]
                        ? "border-[#00bf63] bg-green-50/40"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={!!checked[proposal.id]}
                        onChange={(event) =>
                          setChecked((prev) => ({
                            ...prev,
                            [proposal.id]: event.target.checked,
                          }))
                        }
                        className="mt-1 h-4 w-4 shrink-0 accent-[#00bf63]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                            {KIND_LABEL[proposal.kind]}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {proposal.label}
                          </span>
                        </div>

                        <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
                          {proposal.reason}
                        </p>

                        {/* Before / after */}
                        <div className="mt-2 space-y-1.5 text-[13px]">
                          {proposal.before && (
                            <div className="rounded-md bg-red-50/60 p-2 text-gray-700">
                              <span className="mr-1 font-semibold text-red-700">Nu:</span>
                              <span className="whitespace-pre-wrap">{proposal.before}</span>
                            </div>
                          )}
                          <div className="rounded-md bg-green-50/70 p-2 text-gray-800">
                            <span className="mr-1 font-semibold text-green-700">Nytt:</span>
                            <span className="whitespace-pre-wrap">{proposal.after}</span>
                          </div>
                        </div>

                        {proposal.evidence && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700">
                              Var i ditt CV står det här?
                            </summary>
                            <p className="mt-1 whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-xs leading-relaxed text-gray-600">
                              {proposal.evidence}
                            </p>
                          </details>
                        )}

                        {proposal.keywords && proposal.keywords.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {proposal.keywords.map((keyword) => (
                              <span
                                key={keyword}
                                className="rounded bg-[#00bf63]/10 px-1.5 py-0.5 text-[11px] font-medium text-[#047857]"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => {
                  setStatus("idle")
                  setResult(null)
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Testa en annan annons
              </button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Stäng
                </Button>
                <Button
                  onClick={apply}
                  disabled={selected.length === 0}
                  className="bg-[#00bf63] text-white hover:bg-[#00a857]"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Använd {selected.length > 0 ? `(${selected.length})` : ""}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
