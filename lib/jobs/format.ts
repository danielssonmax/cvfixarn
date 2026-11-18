/**
 * URL contract and small formatters for the jobs add-on. No server code and no
 * data files, so client components can import it.
 *
 * The search page lives at /lediga-jobb and reads these query params:
 *
 *   q                 free text, normally an occupation ("undersköterska")
 *   ort               municipality slug from lib/jobs/locations.ts ("vasteras")
 *   lan               region slug ("vastmanlands-lan"); ignored when ort is set
 *   utan-erfarenhet   "1" = only ads that do not require experience
 *   distans           "1" = only ads that allow remote work
 *   omfattning        "heltid" | "deltid"
 *   sida              page number, 1-based; left out on page 1
 *
 * Always build links with buildJobsSearchHref and read them with
 * parseJobsSearchQuery, so the CV widget, the search page and the emails agree.
 * On the server, searchParamsFromQuery in lib/jobs/match.ts turns a parsed
 * query into parameters for searchJobs.
 */

export const JOBS_BASE_PATH = "/lediga-jobb"

/** Show this wherever ads or ad counts are displayed. */
export const JOBS_SOURCE_LABEL = "Källa: Arbetsförmedlingen (Platsbanken)"

export const JOBS_PAGE_SIZE = 20

/** The API cannot page past offset 2000. */
export const JOBS_MAX_PAGE = Math.floor(2000 / JOBS_PAGE_SIZE) + 1

export const JOBS_PARAMS = {
  q: "q",
  ort: "ort",
  lan: "lan",
  utanErfarenhet: "utan-erfarenhet",
  distans: "distans",
  omfattning: "omfattning",
  sida: "sida",
} as const

export type JobsSearchQuery = {
  q?: string
  /** Municipality slug. */
  ort?: string
  /** Region slug. */
  lan?: string
  utanErfarenhet?: boolean
  distans?: boolean
  omfattning?: "heltid" | "deltid"
  sida?: number
}

const MAX_Q_LENGTH = 100
const SLUG = /^[a-z0-9-]{1,60}$/

/** Our own ad page for a Platsbanken ad id. */
export function jobAdPath(id: string): string {
  return `${JOBS_BASE_PATH}/annons/${id}`
}

/**
 *   buildJobsSearchHref({ q: "undersköterska", ort: "vasteras" })
 *     -> "/lediga-jobb?q=undersk%C3%B6terska&ort=vasteras"
 *   buildJobsSearchHref() -> "/lediga-jobb"
 *
 * Params always come in the same order and empty ones are left out, so equal
 * searches give equal URLs.
 */
export function buildJobsSearchHref(query: JobsSearchQuery = {}): string {
  const params = new URLSearchParams()
  const q = query.q?.trim().replace(/\s+/g, " ").slice(0, MAX_Q_LENGTH)
  if (q) params.set(JOBS_PARAMS.q, q)
  if (query.ort) params.set(JOBS_PARAMS.ort, query.ort)
  else if (query.lan) params.set(JOBS_PARAMS.lan, query.lan)
  if (query.utanErfarenhet) params.set(JOBS_PARAMS.utanErfarenhet, "1")
  if (query.distans) params.set(JOBS_PARAMS.distans, "1")
  if (query.omfattning) params.set(JOBS_PARAMS.omfattning, query.omfattning)
  if (query.sida && query.sida > 1) params.set(JOBS_PARAMS.sida, String(Math.floor(query.sida)))
  const search = params.toString()
  return search ? `${JOBS_BASE_PATH}?${search}` : JOBS_BASE_PATH
}

/**
 * Reads the params above from a page's searchParams object or a URLSearchParams.
 * Unknown or malformed values are dropped rather than passed on.
 */
export function parseJobsSearchQuery(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): JobsSearchQuery {
  const read = (name: string): string => {
    const value =
      searchParams instanceof URLSearchParams ? searchParams.get(name) : searchParams[name]
    return ((Array.isArray(value) ? value[0] : value) || "").trim()
  }

  const query: JobsSearchQuery = {}
  const q = read(JOBS_PARAMS.q).replace(/\s+/g, " ").slice(0, MAX_Q_LENGTH)
  if (q) query.q = q
  const ort = read(JOBS_PARAMS.ort).toLowerCase()
  const lan = read(JOBS_PARAMS.lan).toLowerCase()
  if (SLUG.test(ort)) query.ort = ort
  else if (SLUG.test(lan)) query.lan = lan
  if (read(JOBS_PARAMS.utanErfarenhet) === "1") query.utanErfarenhet = true
  if (read(JOBS_PARAMS.distans) === "1") query.distans = true
  const omfattning = read(JOBS_PARAMS.omfattning)
  if (omfattning === "heltid" || omfattning === "deltid") query.omfattning = omfattning
  const sida = Number.parseInt(read(JOBS_PARAMS.sida), 10)
  if (sida > 1) query.sida = Math.min(sida, JOBS_MAX_PAGE)
  return query
}

/** "1 ledigt jobb", "8 lediga jobb", "1 388 lediga jobb". */
export function formatJobCount(count: number): string {
  return count === 1 ? "1 ledigt jobb" : `${count.toLocaleString("sv-SE")} lediga jobb`
}

/**
 * "2026-11-09T13:44:12" -> "9 november 2026". Only the date part is read, so the
 * result is the same on the server and in any browser time zone.
 */
export function formatJobDate(value: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "")
  if (!match) return ""
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}
