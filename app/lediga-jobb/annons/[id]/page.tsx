import { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { JobCvCta } from "@/components/jobs/job-cv-cta"
import { JobDescription } from "@/components/jobs/job-description"
import { Section } from "@/components/section"
import { Button } from "@/components/ui/button"
import { getJobAd } from "@/lib/jobs/client"
import { JOBS_BASE_PATH, JOBS_SOURCE_LABEL, buildJobsSearchHref, formatJobDate } from "@/lib/jobs/format"
import { getMunicipalityById, getRegionById } from "@/lib/jobs/locations"
import type { JobAdDetail } from "@/lib/jobs/types"

interface Props {
  params: Promise<{ id: string }>
}

// The client passes a timeout signal to fetch, which turns off React's own
// de-duplication. Without this the metadata and the page would each ask for the ad.
const loadAd = cache((id: string) => getJobAd(id))

const ROBOTS = { index: false, follow: true }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const ad = await loadAd(id)
  if (!ad) {
    return { title: "Annonsen hittades inte | CVfixaren", robots: ROBOTS }
  }

  const where = [ad.employer, ad.municipality].filter(Boolean).join(", ")
  return {
    title: `${ad.headline} | Lediga jobb | CVfixaren`,
    description: `${ad.headline}${where ? ` (${where})` : ""}. Läs annonsen och ansök. ${JOBS_SOURCE_LABEL}.`,
    alternates: { canonical: `https://www.cvfixaren.se${ad.path}` },
    robots: ROBOTS,
  }
}

/** Where "Ansök" goes: the employer's link, else their email, else the ad on Platsbanken. */
function applyTarget(ad: JobAdDetail): { href: string; label: string; external: boolean } {
  if (ad.applicationUrl) return { href: ad.applicationUrl, label: "Ansök", external: true }
  if (ad.applicationEmail) {
    const subject = encodeURIComponent(`Ansökan: ${ad.headline}`)
    return { href: `mailto:${ad.applicationEmail}?subject=${subject}`, label: "Ansök via e-post", external: false }
  }
  return { href: ad.platsbankenUrl, label: "Ansök via Platsbanken", external: true }
}

function ApplyButton({ ad, className }: { ad: JobAdDetail; className?: string }) {
  const target = applyTarget(ad)
  // A mail link opens the mail program; a new tab for it would only be an empty tab.
  const newTab = target.external ? { target: "_blank" } : {}
  return (
    <Button asChild size="lg" className={className}>
      <a href={target.href} rel="noopener nofollow" {...newTab}>
        {target.label}
      </a>
    </Button>
  )
}

function facts(ad: JobAdDetail): { label: string; value: string }[] {
  const experience =
    ad.experienceRequired === true ? "Krävs" : ad.experienceRequired === false ? "Inget krav" : null
  return [
    { label: "Sista ansökningsdag", value: formatJobDate(ad.deadline) },
    { label: "Anställningsform", value: ad.employmentType },
    { label: "Omfattning", value: ad.workingHours },
    { label: "Varaktighet", value: ad.duration },
    { label: "Lön", value: ad.salaryDescription },
    { label: "Erfarenhet", value: experience },
    { label: "Yrke", value: ad.occupationLabel },
    { label: "Publicerad", value: formatJobDate(ad.publishedAt) },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value))
}

export default async function JobAdPage({ params }: Props) {
  const { id } = await params
  const ad = await loadAd(id)
  if (!ad) notFound()

  const municipality = ad.municipalityId ? getMunicipalityById(ad.municipalityId) : undefined
  const region = ad.regionId ? getRegionById(ad.regionId) : undefined
  const place = [ad.municipality, ad.region].filter(Boolean).join(", ")
  const morePlace = municipality || region
  const moreHref = morePlace
    ? buildJobsSearchHref(morePlace.kind === "municipality" ? { ort: morePlace.slug } : { lan: morePlace.slug })
    : JOBS_BASE_PATH
  // Breadcrumbs writes the label into a JSON-LD script as it is, and the headline
  // is the employer's text: keep angle brackets out of it.
  const headline = ad.headline.replace(/[<>]/g, "")
  const crumb = headline.length > 60 ? `${headline.slice(0, 57).trimEnd()}...` : headline

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-subtle py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <Breadcrumbs
                items={[
                  { label: "Lediga jobb", href: JOBS_BASE_PATH },
                  { label: crumb, href: ad.path },
                ]}
              />
              <h1 className="mt-6 break-words text-3xl font-bold md:text-4xl">{ad.headline}</h1>
              {(ad.employer || place) && (
                <p className="mt-3 text-lg text-ink-600">{[ad.employer, place].filter(Boolean).join(" · ")}</p>
              )}
            </div>
          </div>
        </section>

        <Section background="white" className="!py-10 md:!py-14">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
            {/* First in the markup so the facts and the apply button come before the long text on a phone. */}
            <aside className="lg:order-2">
              <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-soft lg:sticky lg:top-24">
                <dl className="space-y-3 text-sm">
                  {facts(ad).map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-ink-500">{fact.label}</dt>
                      <dd className="break-words font-medium text-ink">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 flex flex-col gap-3">
                  <ApplyButton ad={ad} className="w-full" />
                  <JobCvCta jobId={ad.id} className="w-full" />
                </div>
                <p className="mt-4 text-sm">
                  <a
                    href={ad.platsbankenUrl}
                    target="_blank"
                    rel="noopener nofollow"
                    className="font-medium text-brand-700 underline-offset-4 hover:underline"
                  >
                    Visa annonsen hos Platsbanken
                  </a>
                </p>
                <p className="mt-3 text-xs text-ink-500">{JOBS_SOURCE_LABEL}</p>
              </div>
            </aside>

            <div className="min-w-0 lg:order-1">
              <h2 className="mb-4 text-xl font-semibold text-ink">Om jobbet</h2>
              <JobDescription html={ad.descriptionHtml} text={ad.descriptionText} />

              {ad.applicationInfo && (
                <>
                  <h2 className="mb-3 mt-8 text-xl font-semibold text-ink">Så ansöker du</h2>
                  <p className="whitespace-pre-line break-words leading-relaxed text-ink-700">{ad.applicationInfo}</p>
                </>
              )}

              {/* On a phone the first apply button is far above by now; on desktop the box follows the scroll. */}
              <div className="mt-8 lg:hidden">
                <ApplyButton ad={ad} className="w-full sm:w-auto" />
              </div>

              <p className="mt-10 border-t border-ink-100 pt-6 text-sm">
                <Link
                  href={moreHref}
                  prefetch={false}
                  className="font-semibold text-brand-700 underline-offset-4 hover:underline"
                >
                  {morePlace ? `Fler lediga jobb i ${morePlace.name}` : "Fler lediga jobb"}
                </Link>
              </p>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
