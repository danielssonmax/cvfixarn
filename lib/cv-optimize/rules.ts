import type { OptimizeCvInput, Proposal } from "./types"

/**
 * The deterministic half of the optimiser.
 *
 * Standard headings, section order and +46 phone formatting are rules, not
 * judgement calls — an ATS parser either recognises "Arbetslivserfarenhet" or it
 * does not. Running them in code rather than through the model makes them free,
 * instant, and identical every time, and it means the feature still does
 * something useful when no API key is configured.
 *
 * The model handles only what genuinely needs reading comprehension: keywords,
 * rewrites and title standardisation.
 */

/**
 * Headings an ATS is known to map to the right field, and the variants we see
 * in this editor's own defaults. The editor ships "Yrkeslivserfarenhet" and
 * "Färdigheter", which are both non-standard, so this rule has real work to do
 * on a default CV.
 */
const STANDARD_HEADINGS: Record<string, { standard: string; variants: string[] }> = {
  experience: {
    standard: "Arbetslivserfarenhet",
    variants: [
      "yrkeslivserfarenhet",
      "erfarenhet",
      "arbetserfarenhet",
      "min resa",
      "karriär",
      "var jag jobbat",
      "work experience",
    ],
  },
  education: {
    standard: "Utbildning",
    variants: ["studier", "min utbildning", "akademisk bakgrund", "education"],
  },
  skills: {
    standard: "Kompetenser",
    variants: [
      "färdigheter",
      "kunskaper",
      "vad jag kan",
      "mina styrkor",
      "skills",
      "kompetens",
    ],
  },
  languages: {
    standard: "Språk",
    variants: ["språkkunskaper", "languages"],
  },
  certificates: {
    standard: "Certifieringar",
    variants: ["certifikat", "diplom", "certifications"],
  },
  profile: {
    standard: "Profil",
    variants: [
      "sammanfattning",
      "om mig",
      "vad jag brinner för",
      "min historia",
      "summary",
    ],
  },
  personalInfo: {
    standard: "Kontaktuppgifter",
    variants: ["personuppgifter", "kontakt", "contact"],
  },
}

/**
 * The order an ATS reads most reliably:
 * kontakt → profil → arbetslivserfarenhet → utbildning → kompetenser → övrigt.
 */
const PREFERRED_ORDER = [
  "personalInfo",
  "profile",
  "experience",
  "education",
  "skills",
  "languages",
  "certificates",
  "licenses",
]

/**
 * Swedish mobile/landline → E.164. Recruiters and ATS filters both search on
 * +46, and a leading 0 is invisible to an international search.
 */
export function normalisePhone(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.startsWith("+")) return null // already international

  const digits = trimmed.replace(/[^\d]/g, "")
  if (digits.startsWith("00")) {
    return `+${digits.slice(2)}`
  }
  // Swedish numbers are 9 digits after the trunk 0 (mobile) or 8-9 (landline).
  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 11) {
    const national = digits.slice(1)
    // Group as +46 70 123 45 67 for readability.
    const groups = national.length === 9
      ? [national.slice(0, 2), national.slice(2, 5), national.slice(5, 7), national.slice(7)]
      : [national]
    return `+46 ${groups.join(" ")}`.trim()
  }
  return null
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Everything the rules can propose, given the current form state. */
export function buildRuleProposals(cv: OptimizeCvInput): Proposal[] {
  const proposals: Proposal[] = []

  // --- Standard headings ----------------------------------------------------
  for (const [sectionId, { standard, variants }] of Object.entries(STANDARD_HEADINGS)) {
    if (!cv.sectionOrder.includes(sectionId)) continue

    const current = (cv.sectionTitles[sectionId] || "").trim()
    if (!current) continue
    if (current.toLowerCase() === standard.toLowerCase()) continue

    // Only rename what we recognise. A heading we have never seen might be
    // deliberate, and renaming it blind would be worse than leaving it.
    if (!variants.includes(current.toLowerCase())) continue

    proposals.push({
      id: `heading-${sectionId}`,
      kind: "heading",
      path: `sectionTitle.${sectionId}`,
      label: `Rubrik: "${current}" → "${standard}"`,
      reason:
        "Standardrubriker känns igen av rekryteringssystemen. Kreativa varianter riskerar att hamna i fel fält eller ingenstans.",
      before: current,
      after: standard,
      defaultChecked: true,
      automatic: true,
    })
  }

  // --- Section order --------------------------------------------------------
  const ranked = [...cv.sectionOrder].sort((a, b) => {
    const ai = PREFERRED_ORDER.indexOf(a)
    const bi = PREFERRED_ORDER.indexOf(b)
    // Anything outside the preferred list keeps its relative position, last.
    const aRank = ai === -1 ? PREFERRED_ORDER.length + cv.sectionOrder.indexOf(a) : ai
    const bRank = bi === -1 ? PREFERRED_ORDER.length + cv.sectionOrder.indexOf(b) : bi
    return aRank - bRank
  })

  if (ranked.join(",") !== cv.sectionOrder.join(",")) {
    const nameOf = (id: string) => cv.sectionTitles[id] || id
    proposals.push({
      id: "section-order",
      kind: "order",
      path: "sectionOrder",
      label: "Ordna om avsnitten",
      reason:
        "Ordningen kontaktuppgifter → profil → arbetslivserfarenhet → utbildning → kompetenser är den som tolkas mest tillförlitligt.",
      before: cv.sectionOrder.map(nameOf).join(" → "),
      after: ranked.map(nameOf).join(" → "),
      defaultChecked: true,
      automatic: true,
    })
  }

  // --- Phone formatting -----------------------------------------------------
  const phone = (cv.personalInfo.phone || "").trim()
  if (phone) {
    const normalised = normalisePhone(phone)
    if (normalised && normalised !== phone) {
      proposals.push({
        id: "phone-e164",
        kind: "contact",
        path: "personalInfo.phone",
        label: "Telefonnummer med +46",
        reason:
          "Rekryterare och system söker på internationellt format. Ett inledande 0 syns inte i en sökning på +46.",
        before: phone,
        after: normalised,
        defaultChecked: true,
        automatic: true,
      })
    }
  }

  return proposals
}

/** Exposed for the model prompt so it uses the same vocabulary as the rules. */
export function standardHeadingFor(sectionId: string): string | null {
  return STANDARD_HEADINGS[sectionId]?.standard ?? null
}

export { PREFERRED_ORDER, titleCase }
