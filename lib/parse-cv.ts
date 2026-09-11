/**
 * Heuristic CV parser: plain text in, editor-shaped data out.
 *
 * No network, no AI - it works by recognising section headings (Swedish and
 * English) and date ranges, which is what the overwhelming majority of CVs are
 * built from. It is deliberately conservative: when a line cannot be understood
 * it ends up in the description rather than being dropped, so the user can fix
 * it in the editor instead of silently losing it.
 */

export interface ParsedEntry {
  title?: string
  company?: string
  school?: string
  degree?: string
  name?: string
  issuer?: string
  location?: string
  startYear?: string
  endYear?: string
  startDate?: string
  endDate?: string
  date?: string
  current?: boolean
  description?: string
}

export interface ParsedCv {
  personalInfo: {
    firstName: string
    lastName: string
    title: string
    email: string
    phone: string
    address: string
    postalCode: string
    location: string
    optionalFields: Record<string, string>
  }
  workExperience: ParsedEntry[]
  education: ParsedEntry[]
  skills: Array<{ name: string; level: string }>
  languages: Array<{ name: string; proficiency: string }>
  sections: Record<string, any>
  /** Section ids that actually got content, in reading order. */
  detectedSections: string[]
}

// ---------------------------------------------------------------- headings

const HEADINGS: Array<[string, string[]]> = [
  ["profile", ["profil", "personlig profil", "sammanfattning", "om mig", "presentation", "profile", "summary", "professional summary", "about me", "objective"]],
  ["experience", ["arbetslivserfarenhet", "yrkeslivserfarenhet", "arbetserfarenhet", "erfarenhet", "erfarenheter", "anstallningar", "anställningar", "arbete", "work experience", "experience", "professional experience", "employment", "employment history", "work history"]],
  ["education", ["utbildning", "utbildningar", "akademisk bakgrund", "studier", "education", "academic background", "academic qualifications"]],
  ["skills", ["fardigheter", "färdigheter", "kompetenser", "kompetens", "kunskaper", "tekniska fardigheter", "tekniska färdigheter", "skills", "technical skills", "key skills", "core competencies", "competencies"]],
  ["languages", ["sprak", "språk", "sprakkunskaper", "språkkunskaper", "languages", "language skills"]],
  ["courses", ["kurser", "kurs", "utbildningar och kurser", "courses", "training", "trainings"]],
  ["internship", ["praktik", "praktikplatser", "internship", "internships"]],
  ["certificates", ["certifikat", "certifieringar", "certifiering", "certificates", "certifications"]],
  ["licenses", ["licenser", "behorigheter", "behörigheter", "licenses", "licences"]],
  ["awards", ["utmarkelser", "utmärkelser", "priser", "awards", "honors", "honours"]],
  ["achievements", ["prestationer", "meriter", "achievements", "accomplishments", "key achievements"]],
  ["volunteering", ["volontararbete", "volontärarbete", "ideellt arbete", "volunteering", "volunteer work", "volunteer experience"]],
  ["references", ["referenser", "references"]],
  ["hobbies", ["intressen", "fritidsintressen", "fritidsaktiviteter", "hobbies", "interests"]],
  ["traits", ["egenskaper", "personliga egenskaper", "personal qualities", "strengths"]],
]

const normalize = (line: string) =>
  line
    .toLowerCase()
    .replace(/[:：•·|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

function headingFor(line: string): string | null {
  if (line.length > 45) return null
  const key = normalize(line)
  if (!key) return null
  for (const [id, variants] of HEADINGS) {
    if (variants.includes(key)) return id
  }
  return null
}

// ---------------------------------------------------------------- patterns

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]{2,}/
const LINKEDIN_RE = /(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/(?:in|pub)\/[\w\-%.]+/i
const URL_RE = /(?:https?:\/\/)?(?:www\.)?[\w-]{2,}\.(?:se|com|net|org|io|dev|nu|eu|co\.uk)(?:\/[\w\-./%?=&#]*)?/i
// Swedish postal code plus city, e.g. "411 38 Göteborg". [^\S\n] rather than
// \s so the city can never be picked up from the following line.
const POSTAL_RE = /\b(\d{3}[^\S\n]?\d{2})[^\S\n]+([A-ZÅÄÖ][\wÅÄÖåäö-]+(?:[^\S\n]+[A-ZÅÄÖ][\wÅÄÖåäö-]+)?)/
const PHONE_RE = /(?:\+\d{1,3}[\s-]?)?(?:\(?0\)?[\s-]?)?\d{2,4}[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2,3}/

// Word boundaries matter here: without them "jun" matches inside
// "Juniorutvecklare" and swallows the job title along with the date.
const MONTH =
  "\\b(?:januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december|" +
  "january|february|march|june|july|august|october|" +
  "jan|feb|mar|apr|may|jun|jul|aug|sept|sep|okt|oct|nov|dec)\\.?\\b"
const NOW = "\\b(?:nuvarande|pågående|pagaende|idag|present|current|today|ongoing|now|nu)\\b"
const YEAR = "(?:19|20)\\d{2}"
const DASH = "(?:[-–—]|\\btill\\b|\\bto\\b|\\buntil\\b)"
const DATE_RANGE_RE = new RegExp(
  `(?:${MONTH}\\s*)?(${YEAR})\\s*${DASH}\\s*(?:(${NOW})|(?:${MONTH}\\s*)?(${YEAR}))`,
  "i",
)
const SINGLE_YEAR_RE = new RegExp(`\\b(${YEAR})\\b`)

const LANGUAGE_LEVELS: Array<[RegExp, string]> = [
  [/modersm[åa]l|native|mother ?tongue/i, "Modersmål"],
  [/flytande|fluent|avancerad|advanced|c1|c2/i, "Flytande"],
  [/medel|intermediate|god|good|b1|b2/i, "Medel"],
  [/grundl[äa]ggande|basic|elementary|a1|a2/i, "Grundläggande"],
  [/nyb[öo]rjare|beginner/i, "Nybörjare"],
]

const SKILL_LEVELS: Array<[RegExp, string]> = [
  [/expert|expert level/i, "Expert"],
  [/avancerad|advanced|mycket god/i, "Avancerad"],
  [/medel|intermediate|god/i, "Medel"],
  [/grundl[äa]ggande|basic/i, "Grundläggande"],
  [/nyb[öo]rjare|beginner/i, "Nybörjare"],
]

function matchLevel(text: string, table: Array<[RegExp, string]>): string {
  for (const [re, value] of table) if (re.test(text)) return value
  return ""
}

// ---------------------------------------------------------------- sectioning

interface Section {
  id: string
  lines: string[]
}

function splitIntoSections(lines: string[]): { header: string[]; sections: Section[] } {
  const header: string[] = []
  const sections: Section[] = []
  let current: Section | null = null

  for (const line of lines) {
    const id = headingFor(line)
    if (id) {
      current = { id, lines: [] }
      sections.push(current)
      continue
    }
    if (current) current.lines.push(line)
    else header.push(line)
  }

  return { header, sections }
}

// ---------------------------------------------------------------- header block

function looksLikeName(line: string): boolean {
  if (!line || line.length > 46) return false
  if (/\d|@|\/|\bcv\b/i.test(line)) return false
  const words = line.split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length > 4) return false
  // Accept "ERIK JOHANSSON" as well as "Erik Johansson"
  return words.every((w) => /^[A-ZÅÄÖ][\wÀ-ÿåäöéèü'’-]*$/.test(w) || /^[A-ZÅÄÖ]{2,}$/.test(w))
}

function toTitleCase(name: string): string {
  if (name !== name.toUpperCase()) return name
  return name
    .toLowerCase()
    .replace(/(^|[\s-])([a-zåäö])/g, (_, sep, ch) => sep + ch.toUpperCase())
}

/**
 * The name is not always at the top of the text: in a sidebar layout the
 * contact column is read first, so the name sits at the start of the *second*
 * column. Look at the opening lines of every block (blocks are separated by the
 * blank line the extractor writes between columns) and take the first that
 * reads like a name. Returns the line indices so the caller can remove them -
 * otherwise the name gets swept into whatever section precedes it.
 */
function findNameAndRole(lines: string[]): { full: string; role: string; nameIndex: number; roleIndex: number } {
  const empty = { full: "", role: "", nameIndex: -1, roleIndex: -1 }

  const blockStarts: number[] = []
  lines.forEach((line, i) => {
    if (line.trim() === "") return
    if (i === 0 || lines[i - 1].trim() === "") blockStarts.push(i)
  })

  for (const start of blockStarts) {
    for (let i = start; i < Math.min(start + 3, lines.length); i++) {
      if (!looksLikeName(lines[i]) || headingFor(lines[i])) continue

      // Role: the next usable line, when it is short and free of contact details.
      let roleIndex = -1
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const line = lines[j]
        if (!line || line.trim() === "" || line.length > 60) continue
        if (headingFor(line)) break
        if (EMAIL_RE.test(line) || URL_RE.test(line) || /\d{3}/.test(line)) continue
        roleIndex = j
        break
      }

      return {
        full: lines[i],
        role: roleIndex === -1 ? "" : lines[roleIndex].replace(/[|•·]+/g, " ").replace(/\s+/g, " ").trim(),
        nameIndex: i,
        roleIndex,
      }
    }
  }

  return empty
}

function parseHeader(headerLines: string[], allLines: string[], name: { full: string; role: string }) {
  const info: ParsedCv["personalInfo"] = {
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    location: "",
    optionalFields: {},
  }

  // Contact details are sometimes below the fold (sidebars, footers), so scan
  // the whole document for them but only take the first hit of each.
  const haystack = allLines.join("\n")

  const email = haystack.match(EMAIL_RE)
  if (email) info.email = email[0]

  const linkedin = haystack.match(LINKEDIN_RE)
  if (linkedin) info.optionalFields.linkedin = linkedin[0].replace(/^https?:\/\//, "")

  for (const line of allLines) {
    const postal = line.match(POSTAL_RE)
    if (postal) {
      info.postalCode = postal[1].trim()
      info.location = postal[2].trim()
      break
    }
  }
  const postal = allLines.map((l) => l.match(POSTAL_RE)).find(Boolean) || null

  for (const line of allLines) {
    if (info.phone) break
    // Skip lines that are really dates or postal codes
    if (DATE_RANGE_RE.test(line)) continue
    const withoutEmail = line.replace(EMAIL_RE, " ")
    const candidate = withoutEmail.match(PHONE_RE)
    if (!candidate) continue
    const digits = candidate[0].replace(/\D/g, "")
    if (digits.length < 8 || digits.length > 15) continue
    if (POSTAL_RE.test(line) && postal && candidate[0].includes(postal[1])) continue
    info.phone = candidate[0].trim()
  }

  if (!info.optionalFields.linkedin) {
    for (const line of allLines) {
      const url = line.replace(EMAIL_RE, " ").match(URL_RE)
      if (url && !/linkedin/i.test(url[0])) {
        info.optionalFields.website = url[0]
        break
      }
    }
  }

  if (name.full) {
    const parts = toTitleCase(name.full).split(/\s+/)
    info.firstName = parts[0] || ""
    info.lastName = parts.slice(1).join(" ")
  }
  info.title = name.role

  // No postal code? Take a bare city from the contact line, e.g.
  // "maria@example.com | +46 76 223 41 90 | Malmö".
  if (!info.location) {
    for (const line of allLines) {
      if (!EMAIL_RE.test(line) && !PHONE_RE.test(line)) continue
      const pieces = line.split(/\s*[|•·]\s*/).map((x) => x.trim())
      if (pieces.length < 2) continue
      const city = pieces
        .slice(1)
        .reverse()
        .find((x) => /^[A-ZÅÄÖ][\wÅÄÖåäö -]{1,28}$/.test(x) && !/\d|@/.test(x))
      if (city) {
        info.location = city
        break
      }
    }
  }

  // Street address: a line with a street name followed by a number.
  for (const line of headerLines) {
    if (info.address) break
    const cleaned = line.replace(EMAIL_RE, " ").replace(URL_RE, " ")
    for (const part of cleaned.split(/[|•·,]/)) {
      const piece = part.trim()
      if (/^[A-ZÅÄÖ][\wÅÄÖåäö.\- ]{2,40}\s+\d{1,4}\s*[A-Za-z]?$/.test(piece) && !POSTAL_RE.test(piece)) {
        info.address = piece
        break
      }
    }
  }

  return info
}

// ---------------------------------------------------------------- entries

interface DateInfo {
  startYear: string
  endYear: string
  current: boolean
  raw: string
}

function readDates(line: string): DateInfo | null {
  const m = line.match(DATE_RANGE_RE)
  if (!m) return null
  return {
    startYear: m[1] || "",
    endYear: m[3] || "",
    current: Boolean(m[2]),
    raw: m[0],
  }
}

/**
 * Split a section body into entries. Date ranges are the reliable anchor in
 * almost every CV layout; the title is either on the same line as the date or
 * on the line just above it.
 */
function splitEntries(lines: string[]): Array<{ lines: string[]; dates: DateInfo | null }> {
  const anchors: number[] = []
  lines.forEach((line, i) => {
    if (readDates(line)) anchors.push(i)
  })

  if (anchors.length === 0) {
    // No dates at all - fall back to treating blank-line groups as entries.
    const groups: string[][] = []
    let group: string[] = []
    for (const line of lines) {
      if (!line.trim()) {
        if (group.length) groups.push(group)
        group = []
      } else group.push(line)
    }
    if (group.length) groups.push(group)
    return groups.map((g) => ({ lines: g, dates: null }))
  }

  // Two layouts dominate real CVs:
  //   A  "Title          2021 - 2023"   then  "Company, City"
  //   B  "Title"                        then  "Company | 2021 - 2023"
  // In A the text left on the date line is the title, in B it is the employer.
  // The tell is whether the line above the date is still free: in B it holds the
  // title, in A it is already part of the previous entry's description.
  const starts: number[] = []

  for (const anchor of anchors) {
    const residual = lines[anchor].replace(readDates(lines[anchor])!.raw, "").replace(/[|•·,\-–—]/g, " ").trim()
    const previousStart = starts.length ? starts[starts.length - 1] : -1
    const above = anchor - 1
    const aboveText = above >= 0 ? lines[above].trim() : ""
    const aboveIsFree =
      above > previousStart &&
      aboveText !== "" &&
      aboveText.length <= 70 &&
      !/[.!?]\s/.test(aboveText) && // prose belongs to the previous entry
      !readDates(aboveText) &&
      !headingFor(aboveText)

    // A tab means the extractor saw a wide gap on the page, i.e. the date was
    // pushed to the right of a title - that is layout A, whatever sits above.
    const dateIsOwnColumn = lines[anchor].includes("\t")

    if (!dateIsOwnColumn && aboveIsFree) {
      starts.push(above) // layout B: title above, employer on the date line
    } else {
      starts.push(anchor) // layout A
    }
  }

  const entries: Array<{ lines: string[]; dates: DateInfo | null }> = []
  for (let i = 0; i < starts.length; i++) {
    const from = starts[i]
    const to = i + 1 < starts.length ? starts[i + 1] : lines.length
    const slice = lines.slice(from, to).filter((l) => l.trim() !== "")
    if (slice.length) {
      entries.push({ lines: slice, dates: readDates(lines[anchors[i]]) })
    }
  }

  // Anything above the first entry still belongs to the section.
  if (starts[0] > 0) {
    const lead = lines.slice(0, starts[0]).filter((l) => l.trim() !== "")
    if (lead.length) entries.unshift({ lines: lead, dates: null })
  }

  return entries
}

const trimSeparators = (value: string) =>
  value.replace(/^[\s|•·,\-–—]+/, "").replace(/[\s|•·,\-–—]+$/, "").replace(/\s+/g, " ").trim()

/** Pull "Company, City" or "Company | City" apart. */
function splitOrgAndLocation(line: string): { org: string; location: string } {
  const cleaned = trimSeparators(line.replace(/\s*[|•·]\s*/g, ", "))
  const parts = cleaned.split(",").map((p) => trimSeparators(p)).filter(Boolean)
  if (parts.length >= 2) {
    const last = parts[parts.length - 1]
    // A short trailing part with no digits reads as a place name.
    if (last.length <= 28 && !/\d/.test(last)) {
      return { org: parts.slice(0, -1).join(", "), location: last }
    }
  }
  return { org: cleaned, location: "" }
}

function buildEntry(
  entry: { lines: string[]; dates: DateInfo | null },
  kind: "experience" | "education",
): ParsedEntry {
  const lines = [...entry.lines]
  const dates = entry.dates

  let titleLine = lines.shift() || ""
  if (dates) titleLine = titleLine.replace(dates.raw, "")
  titleLine = trimSeparators(titleLine)

  // The organisation is usually the next line; strip a date if it carries one.
  let orgLine = ""
  if (lines.length) {
    const candidate = lines[0]
    const candidateDates = readDates(candidate)
    const residual = candidateDates ? candidate.replace(candidateDates.raw, "") : candidate
    const cleaned = trimSeparators(residual)
    // Long prose is a description, not a company name.
    if (cleaned && cleaned.length <= 70 && !/[.!?]\s/.test(cleaned)) {
      orgLine = cleaned
      lines.shift()
    }
  }

  const { org, location } = splitOrgAndLocation(orgLine)
  const description = lines.join(" ").replace(/\s+/g, " ").trim()

  const base = {
    location,
    startYear: dates?.startYear || "",
    endYear: dates?.current ? "" : dates?.endYear || "",
    current: dates?.current || false,
    startDate: "",
    endDate: "",
    description,
  }

  return kind === "experience"
    ? { ...base, title: titleLine, company: org }
    : { ...base, degree: titleLine, school: org }
}

// ---------------------------------------------------------------- lists

function splitList(lines: string[]): string[] {
  const out: string[] = []
  for (const line of lines) {
    const pieces = line.split(/[,;•·|]|\s{3,}/)
    for (const piece of pieces) {
      const value = piece.replace(/^[-–—*\s]+/, "").trim()
      if (value.length >= 2 && value.length <= 45) out.push(value)
    }
  }
  return Array.from(new Set(out))
}

function parseSkills(lines: string[]) {
  return splitList(lines)
    .map((raw) => {
      const m = raw.split(/\s+[-–—:]\s+/)
      if (m.length === 2) {
        const level = matchLevel(m[1], SKILL_LEVELS)
        if (level) return { name: m[0].trim(), level }
      }
      return { name: raw, level: "" }
    })
    .filter((s) => s.name.length >= 2)
    .slice(0, 30)
}

function parseLanguages(lines: string[]) {
  const out: Array<{ name: string; proficiency: string }> = []
  for (const line of lines) {
    for (const piece of line.split(/[,;•·|]/)) {
      const value = piece.replace(/^[-–—*\s]+/, "").trim()
      if (!value) continue
      const parts = value.split(/\s+[-–—:(]\s*/)
      const name = parts[0].replace(/[()]/g, "").trim()
      if (!name || name.length > 30 || /\d/.test(name)) continue
      out.push({ name, proficiency: matchLevel(parts.slice(1).join(" "), LANGUAGE_LEVELS) })
    }
  }
  return out.filter((l, i, arr) => arr.findIndex((o) => o.name.toLowerCase() === l.name.toLowerCase()) === i).slice(0, 12)
}

/** Simple "name / issuer / year" sections: certificates, courses, awards, licenses. */
function parseNamedEntries(lines: string[], nameKey: "name" | "title") {
  return splitEntries(lines)
    .map((entry) => {
      const rows = [...entry.lines]
      let first = rows.shift() || ""
      const dates = entry.dates
      const year = dates ? dates.startYear : (first.match(SINGLE_YEAR_RE)?.[1] || "")
      if (dates) first = first.replace(dates.raw, "")
      else if (year) first = first.replace(year, "")
      const title = trimSeparators(first)
      const issuer = trimSeparators(rows.shift() || "")
      const description = rows.join(" ").replace(/\s+/g, " ").trim()
      return { [nameKey]: title, issuer, date: year, description } as ParsedEntry
    })
    .filter((e) => String(e[nameKey] || "").length >= 2)
    .slice(0, 15)
}

// ---------------------------------------------------------------- entry point

export function parseCv(text: string): ParsedCv {
  const lines = text
    .split("\n")
    .map((l) => l.replace(/ /g, " ").trim())
    .filter((l, i, arr) => l !== "" || arr[i - 1] !== "")

  // Resolve the name first and take those lines out of circulation, so that a
  // name sitting at the top of a second column is not swept into whichever
  // section happened to precede it.
  const name = findNameAndRole(lines)
  const sectionLines = lines.map((line, i) =>
    i === name.nameIndex || i === name.roleIndex ? "" : line,
  )

  const { header, sections } = splitIntoSections(sectionLines)

  const result: ParsedCv = {
    personalInfo: parseHeader(header, lines, name),
    workExperience: [],
    education: [],
    skills: [],
    languages: [],
    sections: {},
    detectedSections: [],
  }

  const bodyOf = (id: string) =>
    sections.filter((s) => s.id === id).flatMap((s) => s.lines).filter((l) => l.trim() !== "")

  const seen = new Set<string>()
  for (const section of sections) {
    if (seen.has(section.id)) continue
    seen.add(section.id)
    const body = bodyOf(section.id)
    if (body.length === 0) continue

    switch (section.id) {
      case "profile": {
        const description = body.join(" ").replace(/\s+/g, " ").trim()
        if (description) {
          result.sections.profile = { description }
          result.detectedSections.push("profile")
        }
        break
      }
      case "experience":
      case "internship":
      case "volunteering": {
        const entries = splitEntries(body)
          .map((e) => buildEntry(e, "experience"))
          .filter((e) => (e.title || e.company || "").length >= 2)
        if (!entries.length) break
        if (section.id === "experience") result.workExperience = entries
        else result.sections[section.id] = entries
        result.detectedSections.push(section.id)
        break
      }
      case "education": {
        const entries = splitEntries(body)
          .map((e) => buildEntry(e, "education"))
          .filter((e) => (e.degree || e.school || "").length >= 2)
        if (!entries.length) break
        result.education = entries
        result.detectedSections.push("education")
        break
      }
      case "skills": {
        const skills = parseSkills(body)
        if (!skills.length) break
        result.skills = skills
        result.detectedSections.push("skills")
        break
      }
      case "languages": {
        const languages = parseLanguages(body)
        if (!languages.length) break
        result.languages = languages
        result.detectedSections.push("languages")
        break
      }
      case "traits":
      case "hobbies": {
        const values = splitList(body)
        if (!values.length) break
        result.sections[section.id] = values.map((name) => ({ name, title: name, description: "" }))
        result.detectedSections.push(section.id)
        break
      }
      case "references": {
        const entries = body.map((line) => ({ name: line, title: "", company: "", email: "", phone: "" }))
        const usable = entries.filter((e) => e.name.length >= 2 && !/beg[äa]ran|request/i.test(e.name))
        if (!usable.length) break
        result.sections.references = usable.slice(0, 6)
        result.detectedSections.push("references")
        break
      }
      case "certificates":
      case "licenses": {
        const entries = parseNamedEntries(body, "name")
        if (!entries.length) break
        result.sections[section.id] = entries
        result.detectedSections.push(section.id)
        break
      }
      case "courses": {
        const entries = parseNamedEntries(body, "name").map((e) => ({
          name: e.name,
          institution: e.issuer,
          date: e.date,
          description: e.description,
        }))
        if (!entries.length) break
        result.sections.courses = entries
        result.detectedSections.push("courses")
        break
      }
      case "awards":
      case "achievements": {
        const entries = parseNamedEntries(body, "title")
        if (!entries.length) break
        result.sections[section.id] = entries
        result.detectedSections.push(section.id)
        break
      }
    }
  }

  return result
}
