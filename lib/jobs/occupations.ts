import data from "@/data/jobs/occupations.json"
import type { JobSearchParams } from "@/lib/jobs/types"

/**
 * The professions the site already has a CV example or cover letter for,
 * mapped to the JobSearch query that returns ads for that profession.
 *
 *   getOccupation("underskoterska")   -> entry | undefined
 *   listOccupations()                 -> all entries
 *   occupationSearchParams(entry)     -> params to spread into searchJobs / countJobs
 *   findOccupationByTerm("kundtjänst") -> entry for a free-text word, or undefined
 *
 *   const entry = getOccupation("underskoterska")
 *   const count = await countJobs({ ...occupationSearchParams(entry), municipality: "8deT_FRF_2SP" })
 *
 * Data lives in data/jobs/occupations.json. Each mapping was checked against
 * the live API (count plus a read of the newest headlines) on 2026-11-18.
 * Concept ids come from https://taxonomy.api.jobtechdev.se: occupation-group is
 * an SSYK level 4 group, occupation-name a single occupation within a group.
 *
 * Left out on purpose because no honest mapping exists: student and
 * gymnasieelev (not occupations), konsult and chef (the API does not read them
 * as an occupation), operativ-chef and kontorschef (a handful of ads of mixed
 * kinds, such as bank managers and school heads).
 */

export type OccupationQuery = {
  occupationGroup?: string[]
  occupationName?: string[]
  /** Free-text fallback, used only where no concept covers the profession (projektledare). */
  q?: string
}

export type Occupation = {
  /** Url slug. Equals the CV example slug where one exists, otherwise the cover letter slug. */
  slug: string
  /** Lowercase singular for use in a sentence: "lediga jobb som undersköterska". */
  label: string
  /**
   * A free-text q the API recognises as this occupation, for links to
   * /lediga-jobb?q=... A free-text search also finds ads that mention the
   * occupation in other groups, so its total differs a little from the
   * concept-based count: show a count next to the link built from the same query.
   */
  searchTerm: string
  /** Other words for the same profession, as users write them or as the API names them. */
  aliases?: string[]
  /** The query that defines the profession. */
  query: OccupationQuery
  /** Slug under /cv-exempel, if the site has that page. */
  cvExampleSlug: string | null
  /** Slug under /exempel-personliga-brev, if the site has that page. */
  coverLetterSlug: string | null
}

const occupations = data as Occupation[]

export function listOccupations(): Occupation[] {
  return occupations
}

/**
 * Looks up by occupation slug, and also accepts the CV example or cover letter
 * slug where they differ ("servitris" finds "servitor-servitris").
 */
export function getOccupation(slug: string): Occupation | undefined {
  return (
    occupations.find((occupation) => occupation.slug === slug) ||
    occupations.find(
      (occupation) => occupation.cvExampleSlug === slug || occupation.coverLetterSlug === slug
    )
  )
}

export function occupationSearchParams(
  occupation: Occupation
): Pick<JobSearchParams, "occupationGroup" | "occupationName" | "q"> {
  const { occupationGroup, occupationName, q } = occupation.query
  return {
    ...(occupationGroup?.length ? { occupationGroup } : {}),
    ...(occupationName?.length ? { occupationName } : {}),
    ...(q ? { q } : {}),
  }
}

/** Finds an entry by its label, search term or an alias. Case and surrounding spaces are ignored. */
export function findOccupationByTerm(term: string): Occupation | undefined {
  const wanted = (term || "").trim().toLowerCase()
  if (!wanted) return undefined
  return occupations.find(
    (occupation) =>
      occupation.label === wanted ||
      occupation.searchTerm === wanted ||
      (occupation.aliases || []).indexOf(wanted) !== -1
  )
}
