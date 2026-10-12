import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import {
  OptimizeOutputSchema,
  SYSTEM_PROMPT,
  buildUserMessage,
  JOB_AD_MIN_LENGTH,
  JOB_AD_MAX_LENGTH,
} from "@/lib/cv-optimize/prompt"
import { buildRuleProposals } from "@/lib/cv-optimize/rules"
import type { OptimizeCvInput, OptimizeResult, Proposal } from "@/lib/cv-optimize/types"

export const runtime = "nodejs"
// Adaptive thinking over a job ad plus a full CV takes a while; give it room.
export const maxDuration = 120

/**
 * "Optimera mitt CV" — analyses the CV against a pasted job ad.
 *
 * Two halves. The deterministic rules (headings, section order, +46) run first
 * and always; the model handles what needs reading comprehension (keywords,
 * rewrites, title standardisation). If no API key is configured the route still
 * returns the rule proposals with `rulesOnly: true` rather than failing — the
 * structural half of ATS optimisation does not need an LLM.
 *
 * The response is a list of proposals, never a rewritten CV. See types.ts.
 */

const MAX_EXPERIENCE_ITEMS = 12

/** The set of paths the model is allowed to write to, for this specific CV. */
function allowedPaths(cv: OptimizeCvInput): Set<string> {
  const paths = new Set<string>(["personalInfo.title", "sections.profile.description"])
  cv.workExperience.forEach((_, index) => {
    paths.add(`workExperience.${index}.title`)
    paths.add(`workExperience.${index}.description`)
  })
  return paths
}

/** Reads the current value at a model-supplied path, for the before/after diff. */
function currentValue(cv: OptimizeCvInput, path: string): string {
  if (path === "personalInfo.title") return (cv.personalInfo.title || "").trim()
  if (path === "sections.profile.description")
    return (cv.sections.profile?.description || "").trim()

  const match = path.match(/^workExperience\.(\d+)\.(title|description)$/)
  if (match) {
    const job = cv.workExperience[Number(match[1])]
    if (!job) return ""
    return String(job[match[2] as "title" | "description"] || "").trim()
  }
  return ""
}

function labelFor(cv: OptimizeCvInput, path: string): string {
  if (path === "personalInfo.title") return "Jobbtitel"
  if (path === "sections.profile.description") return "Profiltext"

  const match = path.match(/^workExperience\.(\d+)\.(title|description)$/)
  if (match) {
    const index = Number(match[1])
    const job = cv.workExperience[index]
    const where = (job?.company || "").trim() || `tjänst ${index + 1}`
    return match[2] === "title" ? `Titel — ${where}` : `Beskrivning — ${where}`
  }
  return path
}

/** Trims the CV to what the prompt needs, so a huge CV cannot blow the request up. */
function sanitiseCv(raw: unknown): OptimizeCvInput | null {
  if (!raw || typeof raw !== "object") return null
  const cv = raw as Record<string, any>

  const workExperience = Array.isArray(cv.workExperience)
    ? cv.workExperience.slice(0, MAX_EXPERIENCE_ITEMS).map((job: any) => ({
        title: typeof job?.title === "string" ? job.title : "",
        company: typeof job?.company === "string" ? job.company : "",
        description: typeof job?.description === "string" ? job.description : "",
      }))
    : []

  return {
    personalInfo: {
      title: typeof cv.personalInfo?.title === "string" ? cv.personalInfo.title : "",
      phone: typeof cv.personalInfo?.phone === "string" ? cv.personalInfo.phone : "",
    },
    workExperience,
    skills: Array.isArray(cv.skills)
      ? cv.skills.map((skill: any) => ({
          name: typeof skill?.name === "string" ? skill.name : "",
          level: typeof skill?.level === "string" ? skill.level : "",
        }))
      : [],
    sections: {
      profile: {
        description:
          typeof cv.sections?.profile?.description === "string"
            ? cv.sections.profile.description
            : "",
      },
    },
    sectionOrder: Array.isArray(cv.sectionOrder)
      ? cv.sectionOrder.filter((id: unknown) => typeof id === "string")
      : [],
    sectionTitles:
      cv.sectionTitles && typeof cv.sectionTitles === "object" ? cv.sectionTitles : {},
  }
}

/** Is `term` already somewhere in the CV? Used to sanity-check the model's flags. */
function cvContains(haystack: string, term: string): boolean {
  const needle = term.trim().toLowerCase()
  if (!needle) return false
  return haystack.includes(needle)
}

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 })
  }

  const jobAd = typeof body?.jobAd === "string" ? body.jobAd.trim() : ""
  const cv = sanitiseCv(body?.cv)

  if (!cv) {
    return NextResponse.json({ error: "CV-data saknas." }, { status: 400 })
  }
  if (jobAd.length < JOB_AD_MIN_LENGTH) {
    return NextResponse.json(
      {
        error:
          "Klistra in hela jobbannonsen så att vi har tillräckligt att gå på — gärna kraven och arbetsuppgifterna.",
      },
      { status: 400 }
    )
  }
  if (jobAd.length > JOB_AD_MAX_LENGTH) {
    return NextResponse.json(
      { error: "Annonsen är för lång. Klistra in annonstexten utan sidfot och övrigt innehåll." },
      { status: 413 }
    )
  }

  // Structural rules first — they never fail and never cost anything.
  const ruleProposals = buildRuleProposals(cv)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    const result: OptimizeResult = {
      proposals: ruleProposals,
      keywords: [],
      coverage: 0,
      gaps: [],
      rulesOnly: true,
    }
    return NextResponse.json(result)
  }

  const client = new Anthropic({ apiKey })

  let parsed
  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(cv, jobAd) }],
      output_config: { format: zodOutputFormat(OptimizeOutputSchema) },
    })

    if (response.stop_reason === "refusal") {
      console.error("[optimize-cv] refused:", response.stop_details)
      return NextResponse.json(
        { error: "Vi kunde inte analysera den här annonsen. Prova med en annan text." },
        { status: 422 }
      )
    }

    parsed = response.parsed_output
  } catch (error: unknown) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Många optimeringar just nu. Försök igen om en stund." },
        { status: 429 }
      )
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("[optimize-cv] bad API key")
      return NextResponse.json(
        { error: "Optimeringen är inte korrekt konfigurerad. Kontakta support." },
        { status: 500 }
      )
    }
    const message = error instanceof Error ? error.message : String(error)
    console.error("[optimize-cv] request failed:", message)
    return NextResponse.json(
      { error: "Analysen misslyckades. Försök igen om en stund." },
      { status: 502 }
    )
  }

  if (!parsed) {
    // Schema parse failed. The rules still hold, so return those rather than
    // nothing — a partial answer beats an error the user cannot act on.
    const result: OptimizeResult = {
      proposals: ruleProposals,
      keywords: [],
      coverage: 0,
      gaps: [],
      rulesOnly: true,
    }
    return NextResponse.json(result)
  }

  // --- Turn the model output into proposals, validating as we go -------------
  const permitted = allowedPaths(cv)
  const modelProposals: Proposal[] = []

  for (const edit of parsed.edits) {
    if (!permitted.has(edit.path)) continue

    const before = currentValue(cv, edit.path)
    const after = (edit.after || "").trim()
    if (!after || after === before) continue

    modelProposals.push({
      id: `edit-${edit.path}`,
      kind: edit.path.endsWith(".title") || edit.path === "personalInfo.title" ? "title" : "text",
      path: edit.path as Proposal["path"],
      label: labelFor(cv, edit.path),
      reason: edit.reason,
      before,
      after,
      keywords: edit.keywords?.slice(0, 8),
      // Model rewrites are opt-in: the user reads them before they land.
      defaultChecked: false,
      automatic: false,
    })
  }

  // Skills: only those the model could quote evidence for, and that are not
  // already listed. The evidence is shown in the UI so the user can check it.
  const existingSkills = new Set(
    cv.skills.map((skill) => (skill.name || "").trim().toLowerCase()).filter(Boolean)
  )
  const newSkills = parsed.skills.filter(
    (skill) =>
      skill.name?.trim() &&
      skill.evidence?.trim() &&
      !existingSkills.has(skill.name.trim().toLowerCase())
  )

  if (newSkills.length) {
    const combined = [
      ...cv.skills.map((skill) => (skill.name || "").trim()).filter(Boolean),
      ...newSkills.map((skill) => skill.name.trim()),
    ]
    modelProposals.push({
      id: "skills-add",
      kind: "skill",
      path: "skills",
      label: `Lägg till ${newSkills.length} kompetens${newSkills.length > 1 ? "er" : ""}`,
      reason:
        "Kompetenser som redan framgår av dina beskrivningar men saknas i kompetenssektionen, där systemen letar efter dem.",
      before: cv.skills.map((skill) => (skill.name || "").trim()).filter(Boolean).join(", ") || "(inga)",
      after: combined.join(", "),
      keywords: newSkills.map((skill) => skill.name.trim()),
      evidence: newSkills.map((skill) => `"${skill.name.trim()}" — ${skill.evidence.trim()}`).join("\n"),
      defaultChecked: false,
      automatic: false,
    })
  }

  // --- Keyword coverage -----------------------------------------------------
  // Recompute presence from the actual CV text rather than trusting the model's
  // flag; a wrong "present" here would hide a real gap from the user.
  const cvHaystack = [
    cv.personalInfo.title,
    cv.sections.profile?.description,
    ...cv.workExperience.flatMap((job) => [job.title, job.company, job.description]),
    ...cv.skills.map((skill) => skill.name),
  ]
    .filter(Boolean)
    .join(" \n ")
    .toLowerCase()

  const keywords = parsed.keywords
    .filter((keyword) => keyword.term?.trim())
    .slice(0, 40)
    .map((keyword) => ({
      term: keyword.term.trim(),
      // Either signal counts as present: the model catches synonyms, the
      // substring check catches terms the model overlooked.
      present: keyword.present || cvContains(cvHaystack, keyword.term),
    }))

  const present = keywords.filter((keyword) => keyword.present).length
  const coverage = keywords.length ? Math.round((present / keywords.length) * 100) : 0

  const result: OptimizeResult = {
    proposals: [...ruleProposals, ...modelProposals],
    keywords,
    coverage,
    gaps: keywords.filter((keyword) => !keyword.present).map((keyword) => keyword.term),
    rulesOnly: false,
  }

  return NextResponse.json(result)
}
