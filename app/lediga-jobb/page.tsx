import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { JobFilters, JOBS_PLACE_PARAM } from "@/components/jobs/job-filters"
import { JobList } from "@/components/jobs/job-list"
import { JobPagination } from "@/components/jobs/job-pagination"
import { Section } from "@/components/section"
import { searchJobs } from "@/lib/jobs/client"
import {
  JOBS_BASE_PATH,
  JOBS_MAX_PAGE,
  JOBS_PAGE_SIZE,
  buildJobsSearchHref,
  formatJobCount,
  parseJobsSearchQuery,
} from "@/lib/jobs/format"
import type { JobsSearchQuery } from "@/lib/jobs/format"
import { listMunicipalities, listRegions, regionOf, resolveLocation } from "@/lib/jobs/locations"
import type { JobLocation } from "@/lib/jobs/locations"
import { searchParamsFromQuery } from "@/lib/jobs/match"
import { findOccupationByTerm } from "@/lib/jobs/occupations"
import type { JobSearchResult } from "@/lib/jobs/types"

type RawSearchParams = Record<string, string | string[] | undefined>

interface Props {
  searchParams: Promise<RawSearchParams>
}

const PAGE_URL = `https://www.cvfixaren.se${JOBS_BASE_PATH}`
const TITLE = "Lediga jobb i hela Sverige | CVfixaren"
const DESCRIPTION =
  "Sök bland lediga jobb från Arbetsförmedlingens Platsbanken. Filtrera på yrke, ort, omfattning och jobb utan krav på erfarenhet, och gör ditt CV klart för ansökan."

const linkClass = "font-semibold text-brand-700 underline-offset-4 hover:underline"

// Only the bare page is for search engines. Every search, filter and page
// number is a variation of it: noindex, with the bare page as canonical.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const raw = await searchParams
  if (Object.keys(raw).length === 0) {
    return {
      title: TITLE,
      description: DESCRIPTION,
      alternates: { canonical: PAGE_URL },
      openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL },
    }
  }

  const query = parseJobsSearchQuery(raw)
  const { location } = searchParamsFromQuery(query)
  const title = `Lediga jobb${location ? ` i ${location.name}` : ""}${query.q ? `: ${query.q}` : ""} | CVfixaren`
  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical: PAGE_URL },
    robots: { index: false, follow: true },
  }
}

/** The place field as typed, or undefined when the request did not come from the form. */
function readTypedPlace(raw: RawSearchParams): string | undefined {
  if (!(JOBS_PLACE_PARAM in raw)) return undefined
  const value = raw[JOBS_PLACE_PARAM]
  return ((Array.isArray(value) ? value[0] : value) || "").trim().replace(/\s+/g, " ").slice(0, 80)
}

const hasFilters = (query: JobsSearchQuery) =>
  Boolean(query.utanErfarenhet || query.distans || query.omfattning)

/**
 * "8 lediga jobb som undersköterska i Västerås". "som <yrke>" is only said
 * when the API read the search as an occupation; anything else is free text
 * and is described as a search, not as a profession.
 */
function describeResult(result: JobSearchResult, query: JobsSearchQuery, location: JobLocation | null): string {
  const count = formatJobCount(result.total)
  // A place written in the search field ("kock göteborg") narrows the result too.
  const place = location ? ` i ${location.name}` : result.concepts.location.length ? "" : " i hela Sverige"
  const filtered = hasFilters(query) ? " med dina filter" : ""
  if (!query.q) return `${count}${place}${filtered}`

  const term = query.q.toLowerCase()
  const isOccupation =
    result.concepts.occupation.length > 0 &&
    (result.concepts.occupation.indexOf(term) !== -1 || Boolean(findOccupationByTerm(term)))
  return isOccupation
    ? `${count} som ${term}${place}${filtered}`
    : `${count} för sökningen ”${query.q}”${place}${filtered}`
}

export default async function LedigaJobbPage({ searchParams }: Props) {
  const raw = await searchParams
  const query = parseJobsSearchQuery(raw)

  // The form sends the place as typed text. Resolve it and move to the ort/lan
  // URL, the same one the CV editor and the emails link to. Text we cannot
  // resolve stays in the URL so the visitor sees what they wrote and why the
  // search is not limited to a place.
  let unknownPlace = ""
  const typedPlace = readTypedPlace(raw)
  if (typedPlace !== undefined) {
    const found = typedPlace ? resolveLocation(typedPlace) : null
    if (found || !typedPlace) {
      redirect(
        buildJobsSearchHref({
          ...query,
          ort: found?.kind === "municipality" ? found.slug : undefined,
          lan: found?.kind === "region" ? found.slug : undefined,
          sida: undefined,
        })
      )
    }
    unknownPlace = typedPlace
    delete query.ort
    delete query.lan
  }

  const { params, location } = searchParamsFromQuery(query)
  if (!location && !unknownPlace) unknownPlace = query.ort || query.lan || ""

  // This page is rendered per request, where a cached search can be of any age
  // (see lib/jobs/client.ts): ask the API directly.
  const result = await searchJobs(params, { fresh: true })

  const page = query.sida || 1
  const totalPages = result
    ? Math.max(1, Math.min(Math.ceil(result.total / JOBS_PAGE_SIZE), JOBS_MAX_PAGE))
    : 1
  // A page number past the last page (an edited URL, or an old link to a search
  // that has shrunk since) goes to the last page that exists.
  if (result && page > totalPages) {
    redirect(buildJobsSearchHref({ ...query, sida: totalPages }))
  }
  const reachable = JOBS_MAX_PAGE * JOBS_PAGE_SIZE
  const region = location?.kind === "municipality" ? regionOf(location) : undefined
  const places = listMunicipalities()
    .map((municipality) => municipality.name)
    .concat(listRegions().map((item) => item.name))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-subtle py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <Breadcrumbs items={[{ label: "Lediga jobb", href: JOBS_BASE_PATH }]} />
              <h1 className="mt-6 text-3xl font-bold md:text-4xl">Lediga jobb</h1>
              <p className="mb-6 mt-3 max-w-2xl text-ink-600">
                Sök bland annonser från Arbetsförmedlingens Platsbanken och hitta jobb att söka med ditt CV.
              </p>
              <JobFilters query={query} place={location?.name || unknownPlace} places={places} />
            </div>
          </div>
        </section>

        <Section background="white" className="!py-10 md:!py-14">
          <div className="mx-auto max-w-4xl">
            {unknownPlace && (
              <p className="mb-6 rounded-lg border border-ink-100 bg-ink-50 px-4 py-3 text-sm text-ink-700">
                Vi känner inte igen platsen ”{unknownPlace}”, så sökningen gäller hela Sverige. Välj en kommun eller ett
                län i listan för att söka på en plats.
              </p>
            )}

            {!result && (
              <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-6">
                <h2 className="text-lg font-semibold text-ink">Vi kan inte visa annonserna just nu</h2>
                <p className="mt-2 text-ink-600">
                  Annonserna hämtas från Arbetsförmedlingen och tjänsten svarar inte för tillfället. Försök igen om en
                  stund.
                </p>
              </div>
            )}

            {result && result.total === 0 && (
              <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-6">
                <h2 className="text-lg font-semibold text-ink">Inga lediga jobb för den här sökningen just nu</h2>
                <p className="mt-2 text-ink-600">
                  Prova ett annat sökord, en större ort eller färre filter.
                </p>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {hasFilters(query) && (
                    <li>
                      <Link
                        href={buildJobsSearchHref({ q: query.q, ort: query.ort, lan: query.lan })}
                        prefetch={false}
                        className={linkClass}
                      >
                        Sök utan filter
                      </Link>
                    </li>
                  )}
                  {region && (
                    <li>
                      <Link
                        href={buildJobsSearchHref({ ...query, ort: undefined, lan: region.slug, sida: undefined })}
                        prefetch={false}
                        className={linkClass}
                      >
                        Sök i {region.name}
                      </Link>
                    </li>
                  )}
                  {location && (
                    <li>
                      <Link
                        href={buildJobsSearchHref({ ...query, ort: undefined, lan: undefined, sida: undefined })}
                        prefetch={false}
                        className={linkClass}
                      >
                        Sök i hela Sverige
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href={JOBS_BASE_PATH} prefetch={false} className={linkClass}>
                      Visa alla lediga jobb
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {result && result.total > 0 && (
              <>
                <h2 className="mb-5 text-xl font-semibold text-ink md:text-2xl">
                  {describeResult(result, query, location)}
                </h2>

                {result.hits.length > 0 ? (
                  <JobList jobs={result.hits} />
                ) : (
                  <p className="text-ink-600">
                    Det finns inga annonser på den här sidan.{" "}
                    <Link href={buildJobsSearchHref({ ...query, sida: undefined })} prefetch={false} className={linkClass}>
                      Gå till första sidan
                    </Link>
                  </p>
                )}

                {page >= JOBS_MAX_PAGE && result.total > reachable && (
                  <p className="mt-6 text-sm text-ink-600">
                    Listan visar de {reachable.toLocaleString("sv-SE")} senaste annonserna för en sökning. Lägg till
                    ett sökord, en ort eller ett filter för att hitta fler.
                  </p>
                )}

                <JobPagination query={query} page={page} totalPages={totalPages} />
              </>
            )}

            <div className="mt-10 flex flex-col gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-600">
                <span className="font-semibold text-ink">Har du ett uppdaterat CV?</span> Gör det klart innan du
                skickar din ansökan.
              </p>
              <Link href="/profil/skapa-cv" className={`shrink-0 text-sm ${linkClass}`}>
                Skapa ditt CV
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
