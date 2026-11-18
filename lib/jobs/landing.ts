import { JOBS_BASE_PATH } from "@/lib/jobs/format"
import { getMunicipalityBySlug } from "@/lib/jobs/locations"
import type { Municipality } from "@/lib/jobs/locations"
import { listOccupations } from "@/lib/jobs/occupations"
import type { Occupation } from "@/lib/jobs/occupations"

/**
 * Which landing pages exist under /lediga-jobb/<slug>, and when one is too thin
 * to be indexed. Rendered by app/lediga-jobb/[slug]/page.tsx.
 *
 *   listLandings()                       -> every page, professions first
 *   getLanding("underskoterska")         -> { kind: "profession", occupation, ... }
 *   getLanding("vasteras")               -> { kind: "place", municipality, ... }
 *   professionLandingForExample("cv", "servitor-servitris")  -> the profession page, or undefined
 *   isLandingIndexable(total)            -> false below LANDING_MIN_ADS or when the API gave no answer
 *
 * Two kinds only, and deliberately few pages:
 *   profession  one per entry in lib/jobs/occupations.ts, the professions the
 *               site has a CV example or cover letter for
 *   place       the municipalities in LANDING_PLACE_SLUGS
 * There are no profession-by-place pages. Those searches are filtered views of
 * /lediga-jobb, which are noindex.
 *
 * No server-only code here, so the sitemap and the example pages can import it.
 */

/**
 * The 20 municipalities with the most ads on 2026-11-18, from a live
 * /search?stats=municipality query (Stockholm 6 969 down to Borås 423). Slugs
 * are the ones in lib/jobs/locations.ts. To change the list, rerun the query
 * and check that no slug equals an occupation slug or "annons".
 */
export const LANDING_PLACE_SLUGS = [
  "stockholm",
  "goteborg",
  "malmo",
  "linkoping",
  "uppsala",
  "jonkoping",
  "vasteras",
  "orebro",
  "lund",
  "umea",
  "norrkoping",
  "helsingborg",
  "lulea",
  "solna",
  "vaxjo",
  "sundsvall",
  "karlstad",
  "gavle",
  "eskilstuna",
  "boras",
]

/** A page with fewer live ads than this is rendered with robots noindex. */
export const LANDING_MIN_ADS = 10

/** Newest ads listed on a landing page. */
export const LANDING_JOBS_SHOWN = 8

/** Rows in "orter med flest jobb" (profession) and "vanligaste yrkesområdena" (place). */
export const LANDING_ROWS_SHOWN = 6

export type ProfessionLanding = {
  kind: "profession"
  slug: string
  /** "/lediga-jobb/underskoterska" */
  path: string
  /** "Lediga jobb som undersköterska": the h1, and the text of links to the page. */
  heading: string
  /** "Undersköterska": breadcrumb and short link text. */
  label: string
  occupation: Occupation
}

export type PlaceLanding = {
  kind: "place"
  slug: string
  path: string
  /** "Lediga jobb i Västerås" */
  heading: string
  /** "Västerås" */
  label: string
  municipality: Municipality
}

export type Landing = ProfessionLanding | PlaceLanding

const capitalise = (value: string) => value.charAt(0).toLocaleUpperCase("sv-SE") + value.slice(1)

const professions: ProfessionLanding[] = listOccupations().map((occupation) => ({
  kind: "profession" as const,
  slug: occupation.slug,
  path: `${JOBS_BASE_PATH}/${occupation.slug}`,
  heading: `Lediga jobb som ${occupation.label}`,
  label: capitalise(occupation.label),
  occupation,
}))

// "annons" is the static folder beside the dynamic route. A place that shares
// its slug with a profession (none do today) or is unknown is left out, so a
// slug can never mean two pages.
const takenSlugs = professions.map((landing) => landing.slug).concat("annons")

const places: PlaceLanding[] = LANDING_PLACE_SLUGS.filter(
  (slug, index) => takenSlugs.indexOf(slug) === -1 && LANDING_PLACE_SLUGS.indexOf(slug) === index
).reduce<PlaceLanding[]>((list, slug) => {
  const municipality = getMunicipalityBySlug(slug)
  if (!municipality) return list
  return list.concat({
    kind: "place",
    slug,
    path: `${JOBS_BASE_PATH}/${slug}`,
    heading: `Lediga jobb i ${municipality.name}`,
    label: municipality.name,
    municipality,
  })
}, [])

const landings: Landing[] = (professions as Landing[]).concat(places)

export function listLandings(): Landing[] {
  return landings
}

export function listProfessionLandings(): ProfessionLanding[] {
  return professions
}

export function listPlaceLandings(): PlaceLanding[] {
  return places
}

/** Exact slugs only: "servitris" is a cover letter slug, not a landing page. */
export function getLanding(slug: string): Landing | undefined {
  return landings.find((landing) => landing.slug === slug)
}

/**
 * The profession page that belongs to a CV example ("cv") or a cover letter
 * example ("letter"), looked up by that example's own slug.
 */
export function professionLandingForExample(
  kind: "cv" | "letter",
  exampleSlug: string
): ProfessionLanding | undefined {
  return professions.find(
    (landing) =>
      (kind === "cv" ? landing.occupation.cvExampleSlug : landing.occupation.coverLetterSlug) === exampleSlug
  )
}

/** total is the page's live number of ads, or null when the API gave no answer. */
export function isLandingIndexable(total: number | null | undefined): boolean {
  return typeof total === "number" && total >= LANDING_MIN_ADS
}
