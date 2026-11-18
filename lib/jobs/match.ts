import "server-only"
import { searchJobs } from "@/lib/jobs/client"
import { JOBS_PAGE_SIZE, buildJobsSearchHref } from "@/lib/jobs/format"
import type { JobsSearchQuery } from "@/lib/jobs/format"
import { getMunicipalityBySlug, getRegionBySlug, regionOf, resolveLocation } from "@/lib/jobs/locations"
import type { JobLocation } from "@/lib/jobs/locations"
import { findOccupationByTerm } from "@/lib/jobs/occupations"
import type {
  JobAdSummary,
  JobMatchInput,
  JobMatchResult,
  JobMatchTier,
  JobSearchParams,
  JobSearchResult,
} from "@/lib/jobs/types"

/**
 * "N lediga jobb som <yrke> i <ort>" for a CV.
 *
 *   matchJobsForCv({ title, location, experienceTitles? }, { withJobs? })
 *     -> { status: "ok", occupationLabel, locationLabel?, tiers, jobs }
 *      | { status: "no_occupation" }
 *      | { status: "unavailable" }
 *
 *   searchParamsFromQuery(query)
 *     -> { params, location }   for the /lediga-jobb page: the parsed URL query
 *                               (lib/jobs/format.ts) as searchJobs parameters
 *
 * A match is only reported when the JobSearch API itself recognises an
 * occupation in the title (or, failing that, in a recent job title). Without
 * one the API falls back to plain free text and the totals are noise, so the
 * answer is "no_occupation" rather than a number that means nothing.
 *
 * The counts are a free-text search on the recognised occupation, the same
 * search a tier's href opens on /lediga-jobb, so the number in the CV widget
 * and the number on the page agree.
 */

const MAX_TITLE_LENGTH = 80
const MAX_EXPERIENCE_TITLES = 3
const MATCH_JOBS_LIMIT = 5
// matchJobsForCv only runs in route handlers and crons, where a cached search
// can be of any age (see lib/jobs/client.ts). The numbers are shown as "just nu".
const FRESH = { fresh: true }

type Recognised = { q: string; label: string }

const normalise = (value: unknown): string =>
  typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").toLowerCase().slice(0, MAX_TITLE_LENGTH)
    : ""

/**
 * First candidate the API reads as an occupation. Where the occupation is one
 * of our own professions, search on its verified term instead: the API accepts
 * "butiksbiträde" but files nearly all such ads under "butikssäljare".
 */
async function recogniseOccupation(candidates: string[]): Promise<Recognised | null | "unavailable"> {
  for (let i = 0; i < candidates.length; i++) {
    const detected = await searchJobs({ q: candidates[i], limit: 0 }, FRESH)
    if (!detected) return "unavailable"
    const term = detected.concepts.occupation[0]
    const known = findOccupationByTerm(term || candidates[i])
    if (known) return { q: known.searchTerm, label: known.label }
    if (term) return { q: term, label: term }
  }
  return null
}

type Scope = Pick<JobMatchTier, "scope" | "name" | "href"> & {
  filter: Pick<JobSearchParams, "municipality" | "region">
}

/** Narrowest first, the country always last. */
function scopesFor(q: string, location: JobLocation | null): Scope[] {
  const scopes: Scope[] = []
  const municipality = location?.kind === "municipality" ? location : null
  const region = location?.kind === "region" ? location : municipality ? regionOf(municipality) : null

  if (municipality) {
    scopes.push({
      scope: "municipality",
      name: municipality.name,
      href: buildJobsSearchHref({ q, ort: municipality.slug }),
      filter: { municipality: municipality.id },
    })
  }
  if (region) {
    scopes.push({
      scope: "region",
      name: region.name,
      href: buildJobsSearchHref({ q, lan: region.slug }),
      filter: { region: region.id },
    })
  }
  scopes.push({ scope: "country", name: "hela Sverige", href: buildJobsSearchHref({ q }), filter: {} })
  return scopes
}

/**
 * Pass withJobs: false when the caller will not show the ads (anonymous
 * visitors); it saves the heavier ad fetch. Normally one upstream call to
 * recognise the occupation and one parallel round for the tiers, each call
 * limited to a few seconds and sent straight to the API, not through the cache.
 */
export async function matchJobsForCv(
  input: JobMatchInput,
  options: { withJobs?: boolean } = {}
): Promise<JobMatchResult> {
  const withJobs = options.withJobs !== false
  const candidates: string[] = []
  const titles = [input?.title].concat(
    Array.isArray(input?.experienceTitles) ? input.experienceTitles.slice(0, MAX_EXPERIENCE_TITLES) : []
  )
  titles.forEach((title) => {
    const candidate = normalise(title)
    if (candidate.length >= 2 && candidates.indexOf(candidate) === -1) candidates.push(candidate)
  })

  const occupation = await recogniseOccupation(candidates)
  if (occupation === "unavailable") return { status: "unavailable" }
  if (!occupation) return { status: "no_occupation" }

  const location = resolveLocation(input.location)
  const scopes = scopesFor(occupation.q, location)
  const newest = (scope: Scope) =>
    searchJobs({ q: occupation.q, ...scope.filter, limit: MATCH_JOBS_LIMIT, sort: "pubdate-desc" }, FRESH)

  // The narrowest scope usually has ads, so fetch its newest ones together with the counts.
  const results: (JobSearchResult | null)[] = await Promise.all(
    scopes.map((scope, index) =>
      withJobs && index === 0
        ? newest(scope)
        : searchJobs({ q: occupation.q, ...scope.filter, limit: 0 }, FRESH)
    )
  )
  const country = results[results.length - 1]
  if (!country) return { status: "unavailable" }

  const tiers: JobMatchTier[] = []
  scopes.forEach((scope, index) => {
    const result = results[index]
    if (!result) return
    if (scope.scope !== "country") {
      if (result.total === 0) return
      // A län with the same number as its kommun adds nothing (always so on Gotland).
      if (tiers.length && tiers[tiers.length - 1].count === result.total) return
    }
    tiers.push({ scope: scope.scope, name: scope.name, count: result.total, href: scope.href })
  })

  let jobs: JobAdSummary[] = []
  if (withJobs) {
    let narrowest = -1
    results.forEach((result, index) => {
      if (narrowest === -1 && result && result.total > 0) narrowest = index
    })
    if (narrowest === 0) jobs = results[0]!.hits
    else if (narrowest > 0) jobs = (await newest(scopes[narrowest]))?.hits || []
  }

  return {
    status: "ok",
    occupationLabel: occupation.label,
    ...(location ? { locationLabel: location.name } : {}),
    tiers,
    jobs,
  }
}

/**
 * For the /lediga-jobb page:
 *
 *   const query = parseJobsSearchQuery(await searchParams)
 *   const { params, location } = searchParamsFromQuery(query)
 *   const result = await searchJobs(params, { fresh: true })
 *
 * An unknown ort or lan slug gives location null and no place filter; the page
 * decides whether that is a 404. Results are sorted newest first.
 */
export function searchParamsFromQuery(query: JobsSearchQuery): {
  params: JobSearchParams
  location: JobLocation | null
} {
  const location =
    (query.ort && getMunicipalityBySlug(query.ort)) || (query.lan && getRegionBySlug(query.lan)) || null
  const page = query.sida && query.sida > 1 ? Math.floor(query.sida) : 1
  const params: JobSearchParams = {
    limit: JOBS_PAGE_SIZE,
    offset: (page - 1) * JOBS_PAGE_SIZE,
    sort: "pubdate-desc",
  }
  if (query.q) params.q = query.q
  if (location?.kind === "municipality") params.municipality = location.id
  if (location?.kind === "region") params.region = location.id
  if (query.utanErfarenhet) params.noExperience = true
  if (query.distans) params.remote = true
  if (query.omfattning) params.worktime = query.omfattning
  return { params, location }
}
