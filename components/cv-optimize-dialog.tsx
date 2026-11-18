"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, Check, Info, Loader2, Sparkles, Wand2 } from "lucide-react"
import { JOB_AD_MAX_LENGTH, JOB_AD_MIN_LENGTH } from "@/lib/cv-optimize/prompt"
import type { OptimizeCvInput, OptimizeResult, Proposal } from "@/lib/cv-optimize/types"
import { JOBS_SOURCE_LABEL } from "@/lib/jobs/format"
import { supabase } from "@/lib/supabase"

/** An ad from /api/jobs/ad/<id>, used to start the dialog with the text already in place. */
export interface CvOptimizeJobAd {
  id: string
  headline: string
  employer: string | null
  text: string
}

interface CvOptimizeDialogProps {
  isOpen: boolean
  onClose: () => void
  /** Snapshot of the current form, read lazily when the user submits. */
  getCv: () => OptimizeCvInput
  /** Applies the proposals the user ticked. */
  onApply: (proposals: Proposal[]) => void
  /** The ad the user came from. Leave out to start with an empty box. */
  jobAd?: CvOptimizeJobAd | null
  /** Opens the paywall; offered when the server says the feature needs Premium. */
  onUpgrade?: () => void
  /** Opens sign-up; offered when nobody is signed in. */
  onSignIn?: () => void
}

// What the user can do about an answer that is not a fault: 401 and 402.
type NextStep = "signin" | "upgrade" | null

const KIND_LABEL: Record<Proposal["kind"], string> = {
  heading: "Rubrik",
  order: "Ordning",
  contact: "Kontakt",
  title: "Jobbtitel",
  text: "Text",
  skill: "Kompetenser",
}

export function CvOptimizeDialog({
  isOpen,
  onClose,
  getCv,
  onApply,
  jobAd: sourceAd,
  onUpgrade,
  onSignIn,
}: CvOptimizeDialogProps) {
  const [jobAd, setJobAd] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [error, setError] = useState("")
  const [nextStep, setNextStep] = useState<NextStep>(null)
  const [result, setResult] = useState<OptimizeResult | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  // The headline goes first: it is usually the job title, the one keyword the
  // ad's body text often leaves out.
  const sourceText = useMemo(
    () => (sourceAd ? `${sourceAd.headline}\n\n${sourceAd.text}`.trim().slice(0, JOB_AD_MAX_LENGTH) : ""),
    [sourceAd]
  )
  // Once the user has asked for another ad, reopening must not bring this one back.
  const dismissedAdId = useRef<string | null>(null)

  useEffect(() => {
    if (!isOpen || !sourceAd || !sourceText || dismissedAdId.current === sourceAd.id) return
    setJobAd((current) => current || sourceText)
  }, [isOpen, sourceAd, sourceText])

  const showsSourceAd = !!sourceAd && sourceText !== "" && jobAd === sourceText

  // The analysis the dialog is waiting for. Closing the dialog or starting a new
  // analysis moves the id on, so an answer that arrives late is dropped.
  const requestRef = useRef<{ id: number; controller: AbortController | null }>({
    id: 0,
    controller: null,
  })

  const reset = useCallback(() => {
    requestRef.current.controller?.abort()
    requestRef.current = { id: requestRef.current.id + 1, controller: null }
    setJobAd("")
    setStatus("idle")
    setError("")
    setNextStep(null)
    setResult(null)
    setChecked({})
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  const analyse = useCallback(async () => {
    requestRef.current.controller?.abort()
    const controller = new AbortController()
    const id = requestRef.current.id + 1
    requestRef.current = { id, controller }
    const superseded = () => id !== requestRef.current.id

    setStatus("loading")
    setError("")
    setNextStep(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (superseded()) return
      if (!session?.access_token) {
        setError("Logga in eller skapa ett konto för att anpassa ditt CV efter en annons.")
        setNextStep("signin")
        setStatus("error")
        return
      }

      const response = await fetch("/api/optimize-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ jobAd, cv: getCv() }),
        signal: controller.signal,
      })
      if (superseded()) return

      const payload = await response.json().catch(() => null)
      if (superseded()) return
      if (!response.ok) {
        setError(payload?.error || payload?.message || "Analysen misslyckades. Försök igen.")
        setNextStep(response.status === 401 ? "signin" : response.status === 402 ? "upgrade" : null)
        setStatus("error")
        return
      }
      if (
        !payload ||
        !Array.isArray(payload.proposals) ||
        !Array.isArray(payload.keywords) ||
        !Array.isArray(payload.gaps)
      ) {
        setError("Analysen misslyckades. Försök igen.")
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
      if (superseded()) return
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

  const adLength = jobAd.trim().length
  const tooShort = adLength < JOB_AD_MIN_LENGTH
  const tooLong = adLength > JOB_AD_MAX_LENGTH

  // 401 and 402 are not faults: say what the next step is and offer it.
  const stepAction =
    nextStep === "upgrade" && onUpgrade
      ? { label: "Visa Premium", run: onUpgrade }
      : nextStep === "signin" && onSignIn
        ? { label: "Skapa konto eller logga in", run: onSignIn }
        : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#00bf63]" />
            Anpassa mitt CV efter en annons
          </DialogTitle>
          <DialogDescription>
            {status === "ready"
              ? "Gå igenom förslagen och välj vilka du vill använda."
              : showsSourceAd
                ? "Du får förslag på hur ditt CV kan anpassas till just den här tjänsten. Ingår i Premium."
                : "Klistra in jobbannonsen du söker, så får du förslag på hur ditt CV kan anpassas till just den tjänsten. Ingår i Premium."}
          </DialogDescription>
        </DialogHeader>

        {/* ---------------------------------------------------------- input */}
        {status !== "ready" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="job-ad" className="mb-1.5 block text-sm font-medium text-gray-900">
                Jobbannons
              </label>
              {sourceAd && showsSourceAd && (
                <div className="mb-2 rounded-lg bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-900">{sourceAd.headline}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {sourceAd.employer ? `${sourceAd.employer} · ` : ""}
                    {JOBS_SOURCE_LABEL}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      dismissedAdId.current = sourceAd.id
                      setJobAd("")
                    }}
                    className="mt-1.5 text-xs font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900"
                  >
                    Använd en annan annons
                  </button>
                </div>
              )}
              <textarea
                id="job-ad"
                value={jobAd}
                onChange={(event) => setJobAd(event.target.value)}
                rows={10}
                placeholder="Klistra in hela annonsen här: arbetsuppgifter, krav och meriterande."
                className="w-full resize-y rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-[#00bf63] focus:ring-2 focus:ring-[#00bf63]/20"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                {tooLong
                  ? "Annonsen är för lång. Ta bort sidfot och annat som inte hör till själva annonsen."
                  : adLength > 0 && tooShort
                    ? "Texten är för kort för att analyseras. Ta med arbetsuppgifterna och kraven."
                    : "Ju mer av annonsen du tar med, desto träffsäkrare blir nyckelorden."}
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-[13px] leading-relaxed text-blue-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Vi skriver bara om det som redan står i ditt CV. Saknar du något annonsen
                kräver säger vi till. Vi hittar aldrig på erfarenhet åt dig.
              </p>
            </div>

            {error && nextStep && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800" role="status">
                <p>{error}</p>
                {stepAction && (
                  <Button
                    size="sm"
                    className="mt-2.5"
                    onClick={() => {
                      handleClose()
                      stepAction.run()
                    }}
                  >
                    {stepAction.label}
                  </Button>
                )}
              </div>
            )}

            {error && !nextStep && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
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
                disabled={tooShort || tooLong || status === "loading"}
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
                    har glömt att skriva ut den kan du lägga till den själv. Har du
                    den inte, lämna den. Vi lägger aldrig in den åt dig.
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
