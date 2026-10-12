/**
 * Shared types for the "Optimera mitt CV" flow.
 *
 * The whole feature is built around one idea: nothing is applied to the user's
 * CV without them seeing it and approving it. The API never returns a rewritten
 * CV — it returns a list of *proposals*, each with a before and an after, which
 * the dialog renders as an opt-in checklist.
 *
 * That matters for more than UX. An optimiser that silently rewrites a CV can
 * put words in a candidate's mouth that they cannot back up in an interview, so
 * the model is constrained to rephrasing what is already there (see
 * `prompt.ts`), and anything the CV genuinely lacks is reported as a *gap* to
 * read, never as an edit to apply.
 */

/** Where a proposal writes to. Validated against this union before applying. */
export type ProposalPath =
  | "personalInfo.title"
  | "personalInfo.phone"
  | "sections.profile.description"
  | `workExperience.${number}.title`
  | `workExperience.${number}.description`
  | `sectionTitle.${string}`
  | "sectionOrder"
  | "skills"

export type ProposalKind =
  /** A standard heading the ATS parser recognises. */
  | "heading"
  /** Section order: kontakt → profil → erfarenhet → utbildning → kompetenser. */
  | "order"
  /** Contact formatting, e.g. +46 phone numbers. */
  | "contact"
  /** A standardised job title, keeping the internal one in parentheses. */
  | "title"
  /** Free text rewritten to carry the ad's own wording. */
  | "text"
  /** A hard skill pulled out of existing text into the skills section. */
  | "skill"

export interface Proposal {
  id: string
  kind: ProposalKind
  path: ProposalPath
  /** Swedish label, e.g. "Rubrik: Färdigheter → Kompetenser". */
  label: string
  /** Why this helps, in one sentence, referencing the ad where relevant. */
  reason: string
  before: string
  after: string
  /** Keywords from the ad this change introduces. */
  keywords?: string[]
  /**
   * For skill proposals: the text in the user's own CV that shows they have
   * this skill. Required — a skill with no evidence is not proposed at all.
   */
  evidence?: string
  /** Deterministic rules are pre-checked; model rewrites the user opts into. */
  defaultChecked: boolean
  /** True when the change came from a rule rather than the model. */
  automatic: boolean
}

export interface KeywordHit {
  /** The term exactly as the ad writes it. */
  term: string
  /** Already somewhere in the CV. */
  present: boolean
}

export interface OptimizeResult {
  proposals: Proposal[]
  /** Every keyword found in the ad, with presence in the current CV. */
  keywords: KeywordHit[]
  /** 0–100: share of the ad's keywords already covered by the CV. */
  coverage: number
  /**
   * Ad keywords the CV does not support. Shown as advice to act on manually —
   * deliberately never turned into edits, because the CV does not back them up.
   */
  gaps: string[]
  /** True when the model was skipped (no API key) and only rules ran. */
  rulesOnly: boolean
}

/** The slice of the form the optimiser reads. Mirrors react-hook-form's shape. */
export interface OptimizeCvInput {
  personalInfo: {
    title?: string
    phone?: string
    [key: string]: unknown
  }
  workExperience: Array<{
    title?: string
    company?: string
    description?: string
    [key: string]: unknown
  }>
  skills: Array<{ name?: string; level?: string }>
  sections: {
    profile?: { description?: string }
    [key: string]: unknown
  }
  /** Current section ids in display order. */
  sectionOrder: string[]
  /** Current heading text per section id. */
  sectionTitles: Record<string, string>
}
