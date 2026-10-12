import { z } from "zod"
import type { OptimizeCvInput } from "./types"

/**
 * Prompt and output schema for the model half of the optimiser.
 *
 * The single most important constraint here is the one against invention. A CV
 * optimiser that adds keywords the candidate cannot back up is not helping them
 * — it walks them into an interview they will fail, and in Sweden a materially
 * false CV is grounds for summary dismissal. So the model may only rephrase
 * what the CV already says, and anything the CV lacks has to come back as a gap
 * for the user to read, not an edit for them to accept.
 */

/** What the model is allowed to write to. Anything else is rejected on apply. */
export const EditableFieldSchema = z.object({
  path: z
    .string()
    .describe(
      "Exakt sökväg från listan i användarmeddelandet, t.ex. 'workExperience.0.description'."
    ),
  after: z.string().describe("Den omskrivna texten. Samma språk som originalet."),
  reason: z
    .string()
    .describe("En mening på svenska om varför ändringen hjälper, med koppling till annonsen."),
  keywords: z
    .array(z.string())
    .describe("Nyckelord från annonsen som den omskrivna texten nu innehåller."),
})

export const SkillSuggestionSchema = z.object({
  name: z.string().describe("Kompetensen, formulerad exakt som annonsen skriver den."),
  evidence: z
    .string()
    .describe(
      "Ordagrant citat ur CV:t som visar att personen faktiskt har kompetensen. Utan citat: föreslå inte."
    ),
})

export const KeywordSchema = z.object({
  term: z.string().describe("Nyckelordet exakt som annonsen skriver det."),
  present: z.boolean().describe("Sant om ordet eller en tydlig synonym redan finns i CV:t."),
})

export const OptimizeOutputSchema = z.object({
  keywords: z
    .array(KeywordSchema)
    .describe("Återkommande substantiv ur annonsen: system, metoder, verktyg, ansvar, titlar."),
  edits: z.array(EditableFieldSchema).describe("Föreslagna textändringar."),
  skills: z
    .array(SkillSuggestionSchema)
    .describe("Hårda kompetenser som redan finns i texten men saknas i kompetenssektionen."),
})

export type OptimizeOutput = z.infer<typeof OptimizeOutputSchema>

export const SYSTEM_PROMPT = `Du är en svensk CV-expert som anpassar ett CV mot en specifik jobbannons så att det passerar ATS-system (Applicant Tracking Systems) och tilltalar rekryteraren.

## Absolut viktigaste regeln

Du får ALDRIG hitta på erfarenhet, kompetens, verktyg, certifikat eller resultat som inte redan framgår av CV:t. Du omformulerar det som finns — du lägger inte till något nytt.

Om annonsen kräver något som kandidaten inte har: markera nyckelordet som present=false. Skriv då INTE in det i texten. Ett CV som påstår kompetens kandidaten saknar faller vid första intervjufrågan och är saklig grund för uppsägning.

Detta gäller även siffror. Står det inte i CV:t hur många personer någon ledde, skriv inte en siffra.

## Nyckelord — det som avgör om kandidaten hittas

1. Utgå från annonsen. Plocka ut återkommande substantiv: systemnamn, metoder, verktyg, ansvarsområden, certifieringar, titlar.
2. Använd annonsens exakta formuleringar. Står det "kravhantering" — skriv "kravhantering", inte "arbete med kravspecifikationer".
3. Skriv både förkortning och fullform första gången ordet används: "SEO (sökmotoroptimering)", "ERP-system (affärssystem)", "Kvalitetsledningssystem enligt ISO 9001".
4. Ta med både svensk och engelsk term när båda används i branschen: "projektledning / project management", "redovisning / accounting". Svenska rekryterare söker på båda.
5. Placera nyckelorden i sammanhang, i löpande text om vad personen faktiskt gjort — inte som en lös uppräkning. En kompetens som återkommer i en arbetsbeskrivning väger tyngre än ett ord i en lista.

## Jobbtitlar

Interna eller kreativa titlar ska standardiseras, med originalet kvar i parentes:
"Growth Ninja" → "Digital marknadsförare (intern titel: Growth Ninja)"
Är titeln redan standardiserad — lämna den.

## Så skriver du om texter

- Behåll samma språk som originalet (svenska om CV:t är på svenska).
- Behåll ungefär samma längd. Detta är en omskrivning, inte en utvidgning.
- Behåll radbrytningar och punktlistor som de är.
- Ändra bara det som blir bättre. Är en text redan bra och full av rätt nyckelord — hoppa över den helt, returnera ingen edit för den.
- Skriv aldrig om en text till att bli vagare. Konkreta verktyg och resultat ska vara kvar.

## Kompetenser

Föreslå bara kompetenser som du kan citera ordagrant ur CV-texten. Citatet läggs i fältet evidence. Kan du inte citera — föreslå inte.

Returnera bara de ändringar som faktiskt förbättrar CV:t mot just den här annonsen. En kort lista med träffsäkra ändringar är bättre än en lång lista med kosmetiska.`

/** Compact, path-labelled view of the CV. Keeps the prompt small and unambiguous. */
export function buildUserMessage(cv: OptimizeCvInput, jobAd: string): string {
  const lines: string[] = []

  lines.push("## Jobbannons\n")
  lines.push(jobAd.trim())

  lines.push("\n\n## CV — redigerbara fält\n")
  lines.push("Använd exakt dessa sökvägar i dina edits. Andra sökvägar ignoreras.\n")

  const title = (cv.personalInfo.title || "").trim()
  lines.push(`\n[personalInfo.title] Nuvarande jobbtitel: ${title || "(tom)"}`)

  const profile = (cv.sections.profile?.description || "").trim()
  if (profile) {
    lines.push(`\n[sections.profile.description] Profiltext:\n${profile}`)
  } else {
    lines.push("\n[sections.profile.description] Profiltext: (tom)")
  }

  cv.workExperience.forEach((job, index) => {
    const jobTitle = (job.title || "").trim()
    const company = (job.company || "").trim()
    const description = (job.description || "").trim()
    if (!jobTitle && !company && !description) return

    lines.push(`\n--- Tjänst ${index + 1}${company ? ` hos ${company}` : ""} ---`)
    lines.push(`[workExperience.${index}.title] Titel: ${jobTitle || "(tom)"}`)
    lines.push(
      `[workExperience.${index}.description] Beskrivning:\n${description || "(tom)"}`
    )
  })

  const skillNames = cv.skills
    .map((skill) => (skill.name || "").trim())
    .filter(Boolean)
  lines.push(
    `\n\n## Befintliga kompetenser\n${skillNames.length ? skillNames.join(", ") : "(inga)"}`
  )

  lines.push(
    "\n\nAnalysera annonsen, lista nyckelorden med present=true/false, och föreslå de textändringar som gör CV:t mätbart bättre mot just den här tjänsten. Hitta inte på något."
  )

  return lines.join("\n")
}

/** Guards the request: a two-line ad produces noise, a novel wastes tokens. */
export const JOB_AD_MIN_LENGTH = 120
export const JOB_AD_MAX_LENGTH = 15000
