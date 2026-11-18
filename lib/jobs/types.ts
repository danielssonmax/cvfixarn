/**
 * Shared types for the jobs add-on (ads from Arbetsförmedlingen's JobSearch API).
 * Types only, so this file is safe to import from client components.
 *
 *   lib/jobs/client.ts       server-only fetch wrapper: searchJobs, countJobs, getJobAd
 *   lib/jobs/locations.ts    municipalities and regions, resolveLocation("721 30 Västerås")
 *   lib/jobs/occupations.ts  the professions the site has content for, mapped to API queries
 *   lib/jobs/match.ts        server-only: matchJobsForCv, searchParamsFromQuery
 *   lib/jobs/format.ts       URL params, buildJobsSearchHref, small formatters (client-safe)
 *
 * Every function that talks to the API returns null (or status "unavailable")
 * instead of throwing, so a caller only has to skip rendering.
 */

/** What a row in a job list needs. */
export type JobAdSummary = {
  /** Platsbanken ad id, digits only. */
  id: string
  headline: string
  employer: string | null
  /**
   * The ad's first workplace. An ad that lists several places is found under
   * each of them, so this can differ from the municipality that was searched.
   */
  municipality: string | null
  region: string | null
  /** Swedish local time without offset, as the API gives it: "2026-11-09T13:44:12". */
  publishedAt: string | null
  /** Last day to apply, same format as publishedAt. */
  deadline: string | null
  /** "Vanlig anställning", "Sommarjobb / feriejobb", "Behovsanställning" ... */
  employmentType: string | null
  /** "Heltid" or "Deltid". */
  workingHours: string | null
  /** Employer logo on arbetsformedlingen.se (https), when the employer has one. */
  logoUrl: string | null
  /** Our own ad page: /lediga-jobb/annons/<id>. */
  path: string
}

export type JobAdDetail = JobAdSummary & {
  /**
   * The ad body as HTML, exactly as the employer wrote it. NOT sanitised here:
   * the page must run it through sanitizeHTML from lib/sanitize.ts before
   * rendering it.
   */
  descriptionHtml: string | null
  descriptionText: string | null
  /** External application link (http/https only). */
  applicationUrl: string | null
  applicationEmail: string | null
  /** Free-text instructions from the employer on how to apply. */
  applicationInfo: string | null
  /** The ad on Platsbanken. Always set; use it when there is no applicationUrl or applicationEmail. */
  platsbankenUrl: string
  occupationLabel: string | null
  occupationGroupId: string | null
  municipalityId: string | null
  regionId: string | null
  experienceRequired: boolean | null
  salaryDescription: string | null
  /** "Tills vidare", "3 månader – upp till 6 månader" ... */
  duration: string | null
  /** getJobAd returns null for removed ads, so this is false on anything it returns. */
  removed: boolean
}

export type JobStatsType = "occupation-name" | "occupation-group" | "occupation-field" | "municipality" | "region"

export type JobStat = { id: string; label: string; count: number }

export type JobSort = "relevance" | "pubdate-desc" | "pubdate-asc" | "applydate-asc" | "applydate-desc"

/** Ids are JobTech taxonomy concept ids, e.g. "8deT_FRF_2SP" for Västerås. */
export type JobSearchParams = {
  /** Free text. The API extracts occupations, places and skills from it. */
  q?: string
  municipality?: string | string[]
  region?: string | string[]
  occupationName?: string[]
  occupationGroup?: string[]
  occupationField?: string[]
  /** Only ads that do not require experience. */
  noExperience?: boolean
  /** Only ads that allow remote work. */
  remote?: boolean
  worktime?: "heltid" | "deltid"
  /**
   * Minutes back in time (10080 = one week) or an ISO datetime. Minutes count
   * from the moment the API is asked, so a cached answer covers an older period
   * than the one asked for: a search that has to reach up to now (the weekly
   * job email) must be made with { fresh: true }, see lib/jobs/client.ts.
   */
  publishedAfter?: number | string
  sort?: JobSort
  /** 0 to 50, default 10. A full ad is about 15 kB upstream, hence the cap. */
  limit?: number
  /** 0 to 2000 (API limit). */
  offset?: number
  stats?: JobStatsType[]
  /** 1 to 30, default 10. */
  statsLimit?: number
}

export type JobSearchResult = {
  total: number
  hits: JobAdSummary[]
  /**
   * What the API recognised in q. An empty occupation list means q was treated
   * as plain free text and the result is noisy: do not present it as jobs "som <q>".
   */
  concepts: { occupation: string[]; location: string[]; skill: string[] }
  /** Present when stats were requested. Counts are per concept, highest first. */
  stats?: Partial<Record<JobStatsType, JobStat[]>>
}

export type JobMatchInput = {
  /** The CV title / headline, e.g. "Undersköterska". */
  title: string
  /** The CV "Ort" field as typed, e.g. "721 30 Västerås". */
  location: string
  /** Job titles from the CV's work experience, most recent first. Used when the title is not an occupation. */
  experienceTitles?: string[]
}

export type JobMatchTier = {
  scope: "municipality" | "region" | "country"
  /** "Västerås", "Västmanlands län" or "hela Sverige": reads correctly after "i". */
  name: string
  count: number
  /** /lediga-jobb with the same search, see buildJobsSearchHref in lib/jobs/format.ts. */
  href: string
}

export type JobMatchResult =
  | {
      status: "ok"
      /** Lowercase, for use in a sentence: "8 lediga jobb som undersköterska i Västerås". */
      occupationLabel: string
      /** The municipality or region the CV location resolved to, if any. */
      locationLabel?: string
      /**
       * Narrowest first. A tier with 0 ads is left out, and so is a region with
       * the same count as its municipality. The country tier is always there, last.
       */
      tiers: JobMatchTier[]
      /** Up to 5 newest ads from the narrowest tier that has any. */
      jobs: JobAdSummary[]
    }
  /** Neither the title nor the experience titles name an occupation. Show nothing, or a gentle hint. */
  | { status: "no_occupation" }
  /** The jobs API is slow or down. Show nothing. */
  | { status: "unavailable" }
