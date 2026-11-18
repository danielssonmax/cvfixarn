import "server-only"
import { jobAdPath } from "@/lib/jobs/format"
import type {
  JobAdDetail,
  JobAdSummary,
  JobSearchParams,
  JobSearchResult,
  JobStat,
  JobStatsType,
} from "@/lib/jobs/types"

/**
 * Thin wrapper over Arbetsförmedlingen's open JobSearch API
 * (https://jobsearch.api.jobtechdev.se, no key, ads are CC0).
 *
 *   searchJobs(params, { fresh? }) -> { total, hits, concepts, stats? } | null
 *   countJobs(params, { fresh? })  -> number | null
 *   getJobAd(id)                   -> JobAdDetail | null   (null also for removed ads and bad ids)
 *
 * Nothing here throws. When the API is slow, down or answers with something
 * unexpected, the functions log one line and return null, and the caller simply
 * does not render the jobs UI.
 *
 * By default responses go through Next's data cache (searches 30 min, single
 * ads 1 h). That is only right inside a page Next rebuilds on a schedule
 * (/lediga-jobb/[slug]): a rebuild waits for a new answer once the entry is
 * older than that. A route handler, a cron or a page rendered per request is
 * instead handed the stored answer whatever its age, a week old if that is
 * when the same search was last made, and Next only refreshes it afterwards.
 * Those callers pass { fresh: true }, which skips the cache in both directions.
 */

const API_BASE = "https://jobsearch.api.jobtechdev.se"
const TIMEOUT_MS = 3500
const SEARCH_REVALIDATE_SECONDS = 30 * 60
const AD_REVALIDATE_SECONDS = 60 * 60

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 10
const MAX_OFFSET = 2000
const MAX_Q_LENGTH = 100

const WORKTIME_CONCEPT = { heltid: "6YE1_gAC_R2G", deltid: "947z_JGS_Uk2" } as const

type Raw = Record<string, any>

// The editor asks for matches whenever a CV changes, so without this an outage
// would write one log line per request.
let lastFailureLog = 0
function logFailure(what: string, reason: unknown) {
  const now = Date.now()
  if (now - lastFailureLog < 60000) return
  lastFailureLog = now
  console.warn(`[jobs] ${what} failed:`, reason instanceof Error ? reason.message : reason)
}

/**
 * revalidate false = no caching at all. Send either cache: "no-store" or
 * next.revalidate, never both: Next treats the pair as a conflict and drops both.
 */
async function fetchJson(path: string, revalidate: number | false): Promise<{ status: number; data: any }> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { accept: "application/json" },
    ...(revalidate === false ? { cache: "no-store" as const } : { next: { revalidate } }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) return { status: response.status, data: null }
  return { status: response.status, data: await response.json() }
}

const clamp = (value: number | undefined, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(Math.floor(value), min), max)
    : fallback

const asList = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

/**
 * Same search, same string: params in a fixed order, ids sorted, q lowercased
 * (the API ignores case). That keeps the cache key stable across callers.
 */
function buildSearchPath(params: JobSearchParams): string {
  const parts: string[] = []
  const add = (key: string, value: string | number | boolean) =>
    parts.push(`${key}=${encodeURIComponent(String(value))}`)
  const addAll = (key: string, values: string[]) =>
    values
      .filter(Boolean)
      .slice()
      .sort()
      .forEach((value) => add(key, value))

  const q = (params.q || "").trim().replace(/\s+/g, " ").toLowerCase().slice(0, MAX_Q_LENGTH)
  if (q) add("q", q)
  addAll("municipality", asList(params.municipality))
  addAll("region", asList(params.region))
  addAll("occupation-name", params.occupationName || [])
  addAll("occupation-group", params.occupationGroup || [])
  addAll("occupation-field", params.occupationField || [])
  if (params.noExperience) add("experience", false)
  if (params.remote) add("remote", true)
  if (params.worktime) add("worktime-extent", WORKTIME_CONCEPT[params.worktime])
  if (params.publishedAfter !== undefined && params.publishedAfter !== "") {
    add("published-after", params.publishedAfter)
  }

  const limit = clamp(params.limit, 0, MAX_LIMIT, DEFAULT_LIMIT)
  // Sort and offset do not change a count, so leave them out and let all
  // counts for the same filter share one cache entry.
  if (limit > 0) {
    if (params.sort) add("sort", params.sort)
    const offset = clamp(params.offset, 0, MAX_OFFSET, 0)
    if (offset > 0) add("offset", offset)
  }
  add("limit", limit)

  if (params.stats?.length) {
    addAll("stats", params.stats)
    add("stats.limit", clamp(params.statsLimit, 1, 30, 10))
  }
  return `/search?${parts.join("&")}`
}

const text = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed || null
}

/** Employers type these by hand: accept only real http(s) links, and repair a bare "www.". */
function httpUrl(value: unknown): string | null {
  const raw = text(value)
  if (!raw) return null
  try {
    const url = new URL(/^www\./i.test(raw) ? `https://${raw}` : raw)
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null
  } catch {
    return null
  }
}

function toSummary(hit: Raw): JobAdSummary | null {
  const id = typeof hit?.id === "string" || typeof hit?.id === "number" ? String(hit.id) : ""
  const headline = text(hit?.headline)
  if (!/^\d+$/.test(id) || !headline) return null
  const logo = httpUrl(hit.logo_url)
  return {
    id,
    headline,
    employer: text(hit.employer?.name) || text(hit.employer?.workplace),
    municipality: text(hit.workplace_address?.municipality),
    region: text(hit.workplace_address?.region),
    publishedAt: text(hit.publication_date),
    deadline: text(hit.application_deadline),
    employmentType: text(hit.employment_type?.label),
    workingHours: text(hit.working_hours_type?.label),
    logoUrl: logo && logo.startsWith("https://") ? logo : null,
    path: jobAdPath(id),
  }
}

function toDetail(ad: Raw): JobAdDetail | null {
  const summary = toSummary(ad)
  if (!summary) return null
  const email = text(ad.application_details?.email)
  const platsbanken = httpUrl(ad.webpage_url)
  return {
    ...summary,
    descriptionHtml: text(ad.description?.text_formatted),
    descriptionText: text(ad.description?.text),
    applicationUrl: httpUrl(ad.application_details?.url),
    applicationEmail: email && /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email) ? email : null,
    applicationInfo: text(ad.application_details?.information),
    platsbankenUrl:
      platsbanken && platsbanken.startsWith("https://arbetsformedlingen.se/")
        ? platsbanken
        : `https://arbetsformedlingen.se/platsbanken/annonser/${summary.id}`,
    occupationLabel: text(ad.occupation?.label),
    occupationGroupId: text(ad.occupation_group?.concept_id),
    municipalityId: text(ad.workplace_address?.municipality_concept_id),
    regionId: text(ad.workplace_address?.region_concept_id),
    experienceRequired: typeof ad.experience_required === "boolean" ? ad.experience_required : null,
    salaryDescription: text(ad.salary_description),
    duration: text(ad.duration?.label),
    removed: ad.removed === true,
  }
}

const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []

/**
 * The API lists a concept once per taxonomy version it has ads for, with
 * overlapping counts. Keep one row per concept with its highest count.
 */
function toStats(raw: unknown): Partial<Record<JobStatsType, JobStat[]>> {
  const stats: Partial<Record<JobStatsType, JobStat[]>> = {}
  if (!Array.isArray(raw)) return stats
  raw.forEach((group: Raw) => {
    if (typeof group?.type !== "string" || !Array.isArray(group.values)) return
    const byId: Record<string, JobStat> = {}
    group.values.forEach((value: Raw) => {
      const id = text(value?.concept_id)
      const label = text(value?.term)
      if (!id || !label || typeof value.count !== "number") return
      if (!byId[id] || value.count > byId[id].count) byId[id] = { id, label, count: value.count }
    })
    stats[group.type as JobStatsType] = Object.keys(byId)
      .map((id) => byId[id])
      .sort((a, b) => b.count - a.count)
  })
  return stats
}

/** What every search takes besides its params. fresh: ask the API now, see the top of the file. */
type JobFetchOptions = { fresh?: boolean }

export async function searchJobs(
  params: JobSearchParams = {},
  options: JobFetchOptions = {}
): Promise<JobSearchResult | null> {
  const path = buildSearchPath(params)
  try {
    const { status, data } = await fetchJson(path, options.fresh ? false : SEARCH_REVALIDATE_SECONDS)
    if (typeof data?.total?.value !== "number" || !Array.isArray(data.hits)) {
      logFailure("search", `unexpected response (HTTP ${status}) for ${path}`)
      return null
    }
    const result: JobSearchResult = {
      total: data.total.value,
      hits: data.hits
        .filter((hit: Raw) => hit?.removed !== true)
        .map(toSummary)
        .filter((hit: JobAdSummary | null): hit is JobAdSummary => hit !== null),
      concepts: {
        occupation: stringList(data.freetext_concepts?.occupation),
        location: stringList(data.freetext_concepts?.location),
        skill: stringList(data.freetext_concepts?.skill),
      },
    }
    if (params.stats?.length) result.stats = toStats(data.stats)
    return result
  } catch (error) {
    logFailure("search", error)
    return null
  }
}

/** Number of ads matching the filter. Same params as searchJobs; limit, offset and sort are ignored. */
export async function countJobs(
  params: JobSearchParams = {},
  options: JobFetchOptions = {}
): Promise<number | null> {
  const result = await searchJobs({ ...params, limit: 0, stats: undefined }, options)
  return result ? result.total : null
}

export async function getJobAd(id: string): Promise<JobAdDetail | null> {
  if (typeof id !== "string" || !/^\d{1,12}$/.test(id)) return null
  try {
    const { status, data } = await fetchJson(`/ad/${id}`, AD_REVALIDATE_SECONDS)
    // Ads disappear when the deadline passes; that is the normal case, not a failure.
    if (status === 404) return null
    const ad = data ? toDetail(data) : null
    if (!ad) {
      logFailure("ad", `unexpected response (HTTP ${status}) for /ad/${id}`)
      return null
    }
    return ad.removed ? null : ad
  } catch (error) {
    logFailure("ad", error)
    return null
  }
}
