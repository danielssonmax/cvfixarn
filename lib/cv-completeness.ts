/**
 * Scores how far along a saved CV is.
 *
 * Used by the abandoned-CV reminder for two jobs:
 *   - a gate: never email someone "your CV is waiting" about an empty row that
 *     the editor auto-created but they never typed into;
 *   - copy: "Ditt CV ar 70% klart" is a far stronger nudge than a generic one,
 *     and the section list lets the email name what they actually filled in.
 *
 * The shape is whatever `public.cvs` returns, so every accessor is defensive —
 * these are JSONB columns and older rows predate some of the fields.
 */

export interface CvCompleteness {
  /** 0-100, rounded. */
  percent: number
  /** Human-readable Swedish names of sections with real content. */
  completedSections: string[]
  /** Swedish names of the highest-value sections still empty. */
  missingSections: string[]
  /** False when the CV is effectively blank and not worth emailing about. */
  hasMeaningfulContent: boolean
  /** Best guess at the person's name, from the CV itself. */
  firstName: string | null
  /** The job title they typed, if any — good subject-line material. */
  headline: string | null
}

type AnyRecord = Record<string, unknown>

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asObject(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as AnyRecord)
    : {}
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

/** An entry counts only if it has some text in it, not just empty scaffolding. */
function hasFilledEntry(list: unknown[]): boolean {
  return list.some((entry) => {
    const obj = asObject(entry)
    return Object.entries(obj).some(
      ([key, value]) =>
        key !== "isPageBreak" && typeof value === "string" && value.trim().length > 0
    )
  })
}

/** Strips the HTML the rich-text editor stores, so "<p></p>" counts as empty. */
function plainTextLength(value: unknown): number {
  return text(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length
}

interface Rule {
  label: string
  weight: number
  done: boolean
  /** Rules worth naming in "what's left" copy. */
  headline?: boolean
}

export function scoreCv(cv: AnyRecord): CvCompleteness {
  const personal = asObject(cv.personal_info)
  const profile = asObject(cv.profile)

  const firstName = text(personal.firstName)
  const lastName = text(personal.lastName)
  const summary =
    plainTextLength(personal.summary) > 0
      ? text(personal.summary)
      : text(profile.description)

  const work = asArray(cv.work_experience)
  const education = asArray(cv.education)
  const skills = asArray(cv.skills)
  const languages = asArray(cv.languages)

  const rules: Rule[] = [
    { label: "Namn", weight: 12, done: firstName.length > 0 || lastName.length > 0 },
    {
      label: "Kontaktuppgifter",
      weight: 8,
      done: text(personal.email).length > 0 || text(personal.phone).length > 0,
    },
    { label: "Jobbtitel", weight: 5, done: text(personal.title).length > 0 },
    { label: "Ort", weight: 5, done: text(personal.location).length > 0 },
    {
      label: "Personlig profil",
      weight: 15,
      done: plainTextLength(summary) >= 40,
      headline: true,
    },
    {
      label: "Arbetslivserfarenhet",
      weight: 25,
      done: hasFilledEntry(work),
      headline: true,
    },
    { label: "Utbildning", weight: 15, done: hasFilledEntry(education), headline: true },
    { label: "Färdigheter", weight: 10, done: hasFilledEntry(skills), headline: true },
    { label: "Språk", weight: 5, done: hasFilledEntry(languages) },
  ]

  const earned = rules.reduce((sum, r) => sum + (r.done ? r.weight : 0), 0)
  const total = rules.reduce((sum, r) => sum + r.weight, 0)
  const percent = Math.round((earned / total) * 100)

  const completedSections = rules.filter((r) => r.done && r.headline).map((r) => r.label)
  const missingSections = rules.filter((r) => !r.done && r.headline).map((r) => r.label)

  // "Worth emailing about" is deliberately stricter than "percent > 0": a row
  // with only a prefilled email address is not a CV anyone remembers starting.
  const hasMeaningfulContent =
    hasFilledEntry(work) ||
    hasFilledEntry(education) ||
    hasFilledEntry(skills) ||
    plainTextLength(summary) >= 40 ||
    (firstName.length > 0 && lastName.length > 0)

  return {
    percent,
    completedSections,
    missingSections,
    hasMeaningfulContent,
    firstName: firstName || null,
    headline: text(personal.title) || null,
  }
}

/** Columns the scorer needs — keeps the cron's SELECT narrow. */
export const CV_SCORING_COLUMNS =
  "id, user_id, cv_name, updated_at, personal_info, profile, work_experience, education, skills, languages"
