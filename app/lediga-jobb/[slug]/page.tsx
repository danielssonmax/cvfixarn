import { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { JobList } from "@/components/jobs/job-list"
import { LandingCountList } from "@/components/jobs/landing-count-list"
import type { LandingCountRow } from "@/components/jobs/landing-count-list"
import { LandingCvBlock } from "@/components/jobs/landing-cv-block"
import { LandingFacts } from "@/components/jobs/landing-facts"
import type { LandingFact } from "@/components/jobs/landing-facts"
import { LandingLinks } from "@/components/jobs/landing-links"
import { Section } from "@/components/section"
import { getCoverLetterExample } from "@/lib/cover-letter-examples"
import { cvExamples } from "@/lib/cv-examples"
import { countJobs, searchJobs } from "@/lib/jobs/client"
import { JOBS_BASE_PATH, buildJobsSearchHref, formatJobCount } from "@/lib/jobs/format"
import type { JobsSearchQuery } from "@/lib/jobs/format"
import {
  LANDING_JOBS_SHOWN,
  LANDING_ROWS_SHOWN,
  getLanding,
  isLandingIndexable,
  listLandings,
} from "@/lib/jobs/landing"
import type { Landing } from "@/lib/jobs/landing"
import { getMunicipalityById } from "@/lib/jobs/locations"
import type { JobAdSummary, JobSearchParams, JobStatsType } from "@/lib/jobs/types"

interface Props {
  params: Promise<{ slug: string }>
}

// Only the slugs in lib/jobs/landing.ts are pages; anything else is a 404.
export const dynamicParams = false

// The numbers on the page are live counts, so it is rebuilt regularly. The
// jobs client caches its calls for 30 minutes, which is the interval Next ends
// up using for the page as well.
export const revalidate = 3600

export function generateStaticParams() {
  return listLandings().map((landing) => ({ slug: landing.slug }))
}

const BASE_URL = "https://www.cvfixaren.se"
const WEEK_IN_MINUTES = 7 * 24 * 60
const linkClass = "font-semibold text-brand-700 underline-offset-4 hover:underline"

type LandingData = {
  total: number
  jobs: JobAdSummary[]
  /** The /lediga-jobb view with the same search as the page, so its total is this total. */
  allHref: string
  facts: LandingFact[]
  rows: LandingCountRow[]
}

/**
 * Everything live on the page. null when the API gives no usable answer; the
 * page then renders without numbers. (When the API gives no answer at all on
 * the live site it throws instead, see below.) A part that fails on its own
 * (one fact, one row) is left out.
 *
 * A profession is searched as free text on its verified search term, the same
 * search the CV editor and /lediga-jobb?q= use, so the numbers agree across
 * the site.
 */
async function loadLandingData(landing: Landing): Promise<LandingData | null> {
  const filter: JobSearchParams =
    landing.kind === "profession" ? { q: landing.occupation.searchTerm } : { municipality: landing.municipality.id }
  const query: JobsSearchQuery =
    landing.kind === "profession" ? { q: landing.occupation.searchTerm } : { ort: landing.municipality.slug }
  const statsType: JobStatsType = landing.kind === "profession" ? "municipality" : "occupation-field"
  const candidateCount = LANDING_ROWS_SHOWN + 2

  const main = await searchJobs({
    ...filter,
    limit: LANDING_JOBS_SHOWN,
    sort: "pubdate-desc",
    stats: [statsType],
    // The API can list a concept more than once, so ask for a few extra.
    statsLimit: candidateCount + 4,
  })
  if (!main) {
    // No answer from the API. On the live site, fail this render: Next then
    // keeps serving the page it already has and tries again later, where
    // returning null would replace an indexed page with the outage notice and
    // its noindex. During next build (NEXT_PHASE is PHASE_PRODUCTION_BUILD from
    // next/constants) there is no earlier page to keep, and a deploy must not
    // fail because the API is down, so there the notice stays the fallback.
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      throw new Error("[jobs] landing search unavailable")
    }
    return null
  }
  // If the API stops reading the term as an occupation it falls back to plain
  // free text, and the total would no longer mean "jobs as <profession>".
  if (landing.kind === "profession" && main.concepts.occupation.length === 0) return null

  const data: LandingData = {
    total: main.total,
    jobs: main.hits,
    allHref: buildJobsSearchHref(query),
    facts: [],
    rows: [],
  }
  if (main.total === 0) return data

  // The stats only pick which rows to show. Their counts are not used: they
  // can differ from a filtered search (Stockholm 122 against 116 for one
  // profession), and a number beside a link has to be the number the linked
  // search shows. A place lists occupation fields rather than groups because
  // the group stats are keyed on SSYK codes and come back under the wrong
  // group name now and then.
  const candidates = (main.stats?.[statsType] || []).slice(0, candidateCount)
  const [noExperience, lastWeek, partTime, rowCounts] = await Promise.all([
    countJobs({ ...filter, noExperience: true }),
    countJobs({ ...filter, publishedAfter: WEEK_IN_MINUTES }),
    countJobs({ ...filter, worktime: "deltid" }),
    Promise.all(
      candidates.map((candidate) =>
        countJobs(
          landing.kind === "profession"
            ? { ...filter, municipality: candidate.id }
            : { ...filter, occupationField: [candidate.id] }
        )
      )
    ),
  ])

  const addFact = (label: string, count: number | null, href?: string) => {
    if (typeof count === "number" && count > 0) data.facts.push({ label, count, href })
  }
  addFact("Utan krav på erfarenhet", noExperience, buildJobsSearchHref({ ...query, utanErfarenhet: true }))
  addFact("Publicerade de senaste sju dagarna", lastWeek)
  addFact("Deltid", partTime, buildJobsSearchHref({ ...query, omfattning: "deltid" }))

  candidates.forEach((candidate, index) => {
    const count = rowCounts[index]
    if (typeof count !== "number" || count === 0) return
    if (landing.kind === "profession") {
      const municipality = getMunicipalityById(candidate.id)
      if (!municipality) return
      data.rows.push({
        id: candidate.id,
        label: municipality.name,
        count,
        href: buildJobsSearchHref({ ...query, ort: municipality.slug }),
      })
    } else {
      // No link: /lediga-jobb cannot filter on an occupation field.
      data.rows.push({ id: candidate.id, label: candidate.label, count })
    }
  })
  data.rows = data.rows.sort((a, b) => b.count - a.count).slice(0, LANDING_ROWS_SHOWN)
  return data
}

// The jobs client passes a timeout signal to fetch, which turns off React's own
// de-duplication. Without this the metadata and the page would each run every call.
const loadData = cache(async (slug: string): Promise<LandingData | null> => {
  const landing = getLanding(slug)
  return landing ? loadLandingData(landing) : null
})

/** Our own example pages for a profession, checked against the content that exists. */
function exampleLinks(landing: Landing): { cvExampleHref?: string; coverLetterHref?: string } {
  if (landing.kind !== "profession") return {}
  const { cvExampleSlug, coverLetterSlug } = landing.occupation
  return {
    cvExampleHref: cvExampleSlug && cvExamples[cvExampleSlug] ? `/cv-exempel/${cvExampleSlug}` : undefined,
    coverLetterHref:
      coverLetterSlug && getCoverLetterExample(coverLetterSlug)
        ? `/exempel-personliga-brev/${coverLetterSlug}`
        : undefined,
  }
}

// Title and description carry no numbers, so they cannot go stale between rebuilds.
function describe(landing: Landing): string {
  if (landing.kind === "place") {
    return `Se aktuella lediga jobb i ${landing.municipality.name} från Arbetsförmedlingens Platsbanken och vilka yrkesområden som har flest annonser. Gör ditt CV klart innan du söker.`
  }
  const { cvExampleHref, coverLetterHref } = exampleLinks(landing)
  const examples =
    cvExampleHref && coverLetterHref
      ? " Här finns också vårt CV-exempel och vårt exempel på personligt brev för yrket."
      : cvExampleHref
        ? " Här finns också vårt CV-exempel för yrket."
        : coverLetterHref
          ? " Här finns också vårt exempel på personligt brev för yrket."
          : ""
  return `Se aktuella lediga jobb som ${landing.occupation.label} från Arbetsförmedlingens Platsbanken och orterna med flest annonser.${examples}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const landing = getLanding(slug)
  if (!landing) return { title: "Sidan hittades inte | CVfixaren" }

  const data = await loadData(slug)
  const title = `${landing.heading} | CVfixaren`
  const description = describe(landing)
  const url = `${BASE_URL}${landing.path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    // Too few ads, or no answer from the API for this render: keep the page out
    // of the index until a later rebuild has enough to show.
    ...(isLandingIndexable(data ? data.total : null) ? {} : { robots: { index: false, follow: true } }),
  }
}

export default async function JobLandingPage({ params }: Props) {
  const { slug } = await params
  const landing = getLanding(slug)
  if (!landing) notFound()

  const data = await loadData(slug)
  const isProfession = landing.kind === "profession"
  // "som undersköterska" or "i Västerås": what the ads on this page have in common.
  const scope = isProfession ? `som ${landing.occupation.label}` : `i ${landing.municipality.name}`
  const rendered = new Date().toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Stockholm",
  })

  const cvBlock = (
    <LandingCvBlock profession={isProfession ? landing.occupation.label : undefined} {...exampleLinks(landing)} />
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-subtle py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <Breadcrumbs
                items={[
                  { label: "Lediga jobb", href: JOBS_BASE_PATH },
                  { label: landing.label, href: landing.path },
                ]}
              />
              <h1 className="mt-6 text-3xl font-bold md:text-4xl">{landing.heading}</h1>
              <p className="mt-3 max-w-2xl text-ink-600">
                {isProfession
                  ? "Aktuella annonser från Arbetsförmedlingens Platsbanken, tillsammans med exempel som hjälper dig med ansökan."
                  : "Aktuella annonser från Arbetsförmedlingens Platsbanken för arbetsplatser i kommunen."}
              </p>
              {data && data.total > 0 && (
                <p className="mt-5 text-lg text-ink">
                  <strong className="font-semibold">{formatJobCount(data.total)}</strong> {scope}
                  {isProfession ? " i hela Sverige" : ""}.{" "}
                  <span className="text-sm text-ink-500">Uppdaterad {rendered}.</span>
                </p>
              )}
            </div>
          </div>
        </section>

        <Section background="white" className="!py-10 md:!py-14">
          <div className="mx-auto max-w-4xl space-y-10">
            {!data && (
              <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-6">
                <h2 className="text-lg font-semibold text-ink">Vi kan inte visa annonserna just nu</h2>
                <p className="mt-2 text-ink-600">
                  Annonserna hämtas från Arbetsförmedlingen och tjänsten svarar inte för tillfället. Försök igen om en
                  stund.
                </p>
              </div>
            )}

            {data && data.total === 0 && (
              <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-6">
                <h2 className="text-lg font-semibold text-ink">Inga lediga jobb {scope} just nu</h2>
                <p className="mt-2 text-ink-600">
                  Platsbanken har inga annonser för den här sökningen i dag.{" "}
                  <Link href={JOBS_BASE_PATH} prefetch={false} className={linkClass}>
                    Sök bland alla lediga jobb
                  </Link>
                </p>
              </div>
            )}

            {data && data.facts.length > 0 && (
              <div>
                <h2 className="sr-only">Annonserna i siffror</h2>
                <LandingFacts facts={data.facts} />
              </div>
            )}

            {/* On a profession page the examples are the reason to be here rather than on any job site. */}
            {isProfession && cvBlock}

            {data && data.total > 0 && (
              <div>
                {data.jobs.length > 0 && (
                  <>
                    <h2 className="mb-5 text-xl font-semibold text-ink md:text-2xl">Senaste annonserna</h2>
                    <JobList jobs={data.jobs} />
                  </>
                )}
                {data.total > data.jobs.length && (
                  <p className="mt-5">
                    <Link href={data.allHref} prefetch={false} className={linkClass}>
                      Visa alla {formatJobCount(data.total)} {scope}
                    </Link>
                  </p>
                )}
              </div>
            )}

            {data && data.rows.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-semibold text-ink md:text-2xl">
                  {isProfession
                    ? `Orter med flest lediga jobb ${scope}`
                    : `Vanligaste yrkesområdena ${scope}`}
                </h2>
                <LandingCountList rows={data.rows} />
              </div>
            )}

            {!isProfession && cvBlock}

            <LandingLinks currentSlug={landing.slug} />
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
