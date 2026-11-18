"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronDown, Mail } from "lucide-react"
import { JOBS_SOURCE_LABEL, formatJobCount } from "@/lib/jobs/format"
import type { JobMatchResult } from "@/lib/jobs/types"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

/**
 * The quiet "jobs next to your CV" element. Feed it the answer from useJobMatch:
 *
 *   <JobMatchCard result={match} />                    in the editor
 *   <JobMatchCard result={match} variant="compact" />  one line with a link
 *   <JobMatchCard result={match} variant="compact" link={false} />
 *                                                      one sentence, no way out (paywall)
 *
 * The compact variants render nothing, and take up no room, unless the result
 * is "ok" with at least one ad. Every number is the one the API gave.
 *
 * The editor variant is one line of small text whose height is always there,
 * with or without an answer, so the form under it never moves on its own. The
 * text fades in when an answer arrives. Everything else (wider areas, the link
 * to the ads, the newest ads and the job email for signed-in users, the source)
 * is in a part that only opens when the user clicks "Visa".
 */

type OkMatch = Extract<JobMatchResult, { status: "ok" }>

type JobMatchCardProps = {
  result: JobMatchResult | null | undefined
  /** "editor": the reserved line with the details behind "Visa". "compact": a single line. */
  variant?: "editor" | "compact"
  /** Compact only. Without the link the line names its source itself. */
  link?: boolean
  className?: string
}

const NEW_TAB_HINT = "(öppnas i ny flik)"

/** The result when it has something to show: "ok" with at least one ad in its narrowest tier. */
function matchToShow(result: JobMatchResult | null | undefined): OkMatch | null {
  if (!result || result.status !== "ok") return null
  const narrowest = result.tiers[0]
  // Only the country tier can be 0, and "0 lediga jobb" helps nobody.
  if (!narrowest || !(narrowest.count > 0)) return null
  return result
}

const headlineOf = (match: OkMatch): string =>
  `${formatJobCount(match.tiers[0].count)} som ${match.occupationLabel} i ${match.tiers[0].name}`

export function JobMatchCard({ result, variant = "editor", link = true, className }: JobMatchCardProps) {
  // The editor line is there whatever the answer is: its room is reserved.
  if (variant !== "compact") return <EditorLine result={result} className={className} />

  const match = matchToShow(result)
  if (!match) return null
  const narrowest = match.tiers[0]
  const headline = headlineOf(match)

  if (!link) {
    return (
      <p aria-live="polite" className={cn("text-[13px] leading-5 text-ink-500", className)}>
        Platsbanken har {headline} just nu.
      </p>
    )
  }
  return (
    <p className={cn("flex min-w-0 items-baseline gap-2 text-[13px] leading-5 text-ink-500", className)}>
      <span aria-live="polite" className="truncate" title={`${headline}. ${JOBS_SOURCE_LABEL}`}>
        {headline}
      </span>
      <Link
        href={narrowest.href}
        prefetch={false}
        className="shrink-0 font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
      >
        Visa jobben
      </Link>
    </p>
  )
}

function EditorLine({ result, className }: { result: JobMatchResult | null | undefined; className?: string }) {
  // The last answer that had something to show. It stays on screen while the
  // title is being retyped and the next answer is on its way.
  const [held, setHeld] = useState<OkMatch | null>(null)
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const detailsId = useId()

  useEffect(() => {
    const match = matchToShow(result)
    if (match) {
      setHeld(match)
      setVisible(true)
    } else if (result) {
      // An answer with nothing to show (no occupation, or the jobs API is down).
      setVisible(false)
      setOpen(false)
    }
    // null: no answer yet for what is typed now. The line stays as it is.
  }, [result])

  const headline = held ? headlineOf(held) : ""

  return (
    <div className={className}>
      {/*
        One line, always this high. Only opacity and visibility change when an
        answer comes or goes. The wrapper is in the page from the start, so the
        first answer fades in too. Hidden means not focusable and not read out.
      */}
      <div
        aria-hidden={!visible}
        className={cn(
          "flex min-h-5 items-start gap-2 text-[13px] leading-5 text-gray-500",
          "transition-[opacity,visibility] duration-300 ease-out motion-reduce:transition-none",
          visible ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        {held && (
          <>
            {/* Cut off with an ellipsis, never wrapped. The whole sentence shows once the user has opened the details. */}
            <span
              aria-live="polite"
              className={cn("min-w-0", !open && "truncate")}
              title={open ? undefined : headline}
            >
              {headline}
            </span>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((current) => !current)}
              // The ::after gives a finger more to hit than one line of small text.
              className="relative inline-flex shrink-0 items-center gap-0.5 font-medium text-gray-700 underline-offset-2 after:absolute after:-inset-x-2 after:-inset-y-2.5 after:content-[''] hover:text-gray-900 hover:underline"
            >
              {open ? "Dölj" : "Visa"}
              <span className="sr-only"> mer om jobben</span>
              <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
            </button>
          </>
        )}
      </div>

      {/*
        Zero height until the user opens it. While closed it is also invisible,
        so nothing in it takes focus or is read out. It is built as soon as
        there is an answer, so the job email line is already in place when it
        opens instead of sliding in a moment after the click.
      */}
      <div
        id={detailsId}
        className={cn(
          "grid transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none",
          open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">{held && <EditorDetails result={held} />}</div>
      </div>
    </div>
  )
}

function EditorDetails({ result }: { result: OkMatch }) {
  const [listOpen, setListOpen] = useState(false)
  const listId = useId()

  const [narrowest, ...wider] = result.tiers
  const widerLine = wider.map((tier) => `${tier.count.toLocaleString("sv-SE")} i ${tier.name}`).join(", ")
  const jobs = result.jobs.slice(0, 5)

  return (
    // The gap to the line is padding inside the clipped box, so it opens and closes with it.
    <div className="pt-2">
      <div className="rounded-xl bg-gray-50 px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          {widerLine && (
            <p aria-live="polite" className="min-w-0 text-[13px] leading-relaxed text-gray-500">
              {widerLine}
            </p>
          )}
          <a
            href={narrowest.href}
            target="_blank"
            rel="noopener"
            className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            Visa jobben
            <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
            <span className="sr-only">{NEW_TAB_HINT}</span>
          </a>
        </div>

        {jobs.length > 0 && (
          <>
            <button
              type="button"
              aria-expanded={listOpen}
              aria-controls={listId}
              onClick={() => setListOpen((current) => !current)}
              className="mt-2 inline-flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-900"
            >
              {listOpen ? "Dölj annonserna" : "Visa de senaste annonserna"}
              <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 transition-transform", listOpen && "rotate-180")} />
            </button>
            <ul id={listId} hidden={!listOpen} className="mt-1.5 space-y-0.5">
              {jobs.map((job) => {
                const where = [job.employer, job.municipality].filter(Boolean).join(" · ")
                return (
                  <li key={job.id}>
                    <a
                      href={job.path}
                      target="_blank"
                      rel="noopener"
                      className="group -mx-2 block rounded-md px-2 py-1.5 hover:bg-white"
                    >
                      <span className="block truncate text-[13px] font-medium text-gray-900 group-hover:underline">
                        {job.headline}
                        <span className="sr-only"> {NEW_TAB_HINT}</span>
                      </span>
                      {where && <span className="block truncate text-xs text-gray-500">{where}</span>}
                    </a>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        <JobAlertToggle result={result} />

        <p className="mt-2 text-[11px] leading-4 text-gray-500">{JOBS_SOURCE_LABEL}</p>
      </div>
    </div>
  )
}

type JobAlertState =
  | { status: "on"; occupationLabel: string; locationName: string | null }
  | { status: "off" }
  // Has said no to email from us, to all of it or to the job email through the
  // link in it. The job email is not offered then.
  | { status: "opted_out" }

const ALERTS_ENDPOINT = "/api/jobs/alerts"
const ALERTS_TIMEOUT_MS = 12000

// Remembered per user for as long as the page lives, so details that are built
// again do not have to ask (and slide the line in) again.
const alertStateByUser = new Map<string, JobAlertState>()

/** null for every failure, and for a visitor who is not signed in. */
async function requestJobAlert(
  method: "GET" | "POST" | "DELETE",
  body?: { title: string; location: string }
): Promise<JobAlertState | null> {
  const controller = new AbortController()
  const giveUp = setTimeout(() => controller.abort(), ALERTS_TIMEOUT_MS)
  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) return null
    const response = await fetch(ALERTS_ENDPOINT, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    // 409: the server does not switch the email on for someone who has said no to it.
    if (response.status === 409) {
      const refusal = await response.json().catch(() => null)
      return refusal?.error === "opted_out" ? { status: "opted_out" } : null
    }
    if (!response.ok) return null
    const answer = await response.json()
    if (answer?.status === "off") return { status: "off" }
    if (answer?.status === "opted_out") return { status: "opted_out" }
    if (answer?.status === "on" && typeof answer.occupationLabel === "string") {
      return {
        status: "on",
        occupationLabel: answer.occupationLabel,
        locationName: typeof answer.locationName === "string" ? answer.locationName : null,
      }
    }
    return null
  } catch {
    return null
  } finally {
    clearTimeout(giveUp)
  }
}

/**
 * The opt-in for the weekly job email. Nothing for anonymous visitors, nothing
 * for someone who has unsubscribed, and nothing when the state cannot be read
 * (the details work without it).
 */
function JobAlertToggle({ result }: { result: OkMatch }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [state, setState] = useState<JobAlertState | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  // Set by the user's own click. Until then the line is not announced by screen readers.
  const [touched, setTouched] = useState(false)
  const actionRef = useRef<HTMLButtonElement>(null)
  const refocus = useRef(false)

  useEffect(() => {
    let active = true
    const apply = (session: { user?: { id?: string } } | null | undefined) => {
      if (active) setUserId(session?.user?.id ?? null)
    }
    let unsubscribe = () => {}
    try {
      supabase.auth.getSession().then(
        ({ data }) => apply(data.session),
        () => apply(null)
      )
      const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session))
      unsubscribe = () => data.subscription.unsubscribe()
    } catch {
      apply(null)
    }
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    setFailed(false)
    if (!userId) {
      setState(null)
      return
    }
    const known = alertStateByUser.get(userId)
    if (known) {
      setState(known)
      return
    }
    let active = true
    requestJobAlert("GET").then((answer) => {
      if (!active) return
      if (answer) alertStateByUser.set(userId, answer)
      setState(answer)
    })
    return () => {
      active = false
    }
  }, [userId])

  // The clicked button is replaced by the other one: hand the keyboard focus over.
  useEffect(() => {
    if (!refocus.current) return
    refocus.current = false
    actionRef.current?.focus()
  }, [state])

  const change = async (next: "on" | "off") => {
    if (!userId || busy) return
    setBusy(true)
    setTouched(true)
    setFailed(false)
    const answer =
      next === "on"
        ? await requestJobAlert("POST", { title: result.occupationLabel, location: result.locationLabel || "" })
        : await requestJobAlert("DELETE")
    setBusy(false)
    if (answer?.status === "opted_out") {
      // They have said no to our email since this line was drawn: stop offering it.
      alertStateByUser.set(userId, answer)
      setState(answer)
      return
    }
    if (!answer || answer.status !== next) {
      setFailed(true)
      return
    }
    alertStateByUser.set(userId, answer)
    refocus.current = true
    setState(answer)
  }

  const offered = state?.status === "on" || state?.status === "off"
  // aria-disabled, not disabled: a disabled button drops the keyboard focus.
  const buttonStyle = cn("underline underline-offset-2 hover:text-gray-900", busy && "opacity-60")

  return (
    // Normally in place before the details are opened. Slides in only if its answer is later than the click.
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
        offered ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div
        aria-live={touched ? "polite" : "off"}
        // The padding keeps the buttons' focus rings inside the clipped box.
        className="-mx-1 -mb-1 min-h-0 overflow-hidden px-1 pb-1 text-[13px] leading-5 text-gray-500"
      >
        {state?.status === "off" && (
          // Says what the cron does: the search that will be stored, on Mondays, and only when there is something new.
          <button
            ref={actionRef}
            type="button"
            aria-disabled={busy}
            onClick={() => change("on")}
            className={cn("mt-2 inline-flex items-start gap-1.5 text-left", buttonStyle)}
          >
            <Mail aria-hidden className="mt-[3px] h-3.5 w-3.5 shrink-0" />
            <span>
              Få ett mejl på måndagar när det finns nya jobb som {result.occupationLabel} i{" "}
              {result.locationLabel || "hela Sverige"}
            </span>
          </button>
        )}
        {state?.status === "on" && (
          // Always names the stored search: it can differ from the one in the line above.
          <p className="mt-2">
            Du får ett mejl på måndagar när det finns nya jobb som {state.occupationLabel} i{" "}
            {state.locationName || "hela Sverige"}.{" "}
            <button
              ref={actionRef}
              type="button"
              aria-disabled={busy}
              onClick={() => change("off")}
              className={buttonStyle}
            >
              Stäng av
            </button>
          </p>
        )}
        {offered && failed && <p className="mt-1 text-xs">Det gick inte att spara ditt val just nu.</p>}
      </div>
    </div>
  )
}
