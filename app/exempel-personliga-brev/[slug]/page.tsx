import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"
import { notFound } from "next/navigation"
import { ArrowRight, Check, X } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Section } from "@/components/section"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { CopyLetterButton } from "@/components/copy-letter-button"
import {
  COVER_LETTERS_UPDATED,
  coverLetterExamples,
  cvSlugForLetter,
  getCoverLetterExample,
  letterAsPlainText,
} from "@/lib/cover-letter-examples"
import { cvExamples } from "@/lib/cv-examples"

const BASE_URL = "https://www.cvfixaren.se"

const LETTER_GUIDES = [
  {
    href: "/blogg/personligt-brev-guide",
    title: "Vad ska brevet innehålla?",
    description: "Brevets delar, rätt längd och en mall att kopiera.",
  },
  {
    href: "/blogg/med-vanliga-halsningar",
    title: "Så avslutar du brevet",
    description: "Med vänliga hälsningar, sista stycket och vanliga fel.",
  },
  {
    href: "/blogg/personligt-brev-pa-engelska",
    title: "Personligt brev på engelska",
    description: "Ett komplett exempel och språkfällorna att undvika.",
  },
]

interface Props {
  params: Promise<{ slug: string }>
}

// Every page is known at build time; anything else is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return coverLetterExamples.map((example) => ({ slug: example.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const example = getCoverLetterExample(slug)
  if (!example) return { title: "Exempel hittades inte | CVfixaren" }

  const url = `${BASE_URL}/exempel-personliga-brev/${slug}`
  return {
    title: example.metaTitle,
    description: example.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: example.metaTitle, description: example.metaDescription, url, type: "article" },
  }
}

export default async function CoverLetterExamplePage({ params }: Props) {
  const { slug } = await params
  const example = getCoverLetterExample(slug)
  if (!example) notFound()

  const { letter } = example
  const cvSlug = cvSlugForLetter(slug)
  const cvExample = cvExamples[cvSlug]
  const related = [
    ...coverLetterExamples.filter((other) => other.slug !== slug && other.category === example.category),
    ...coverLetterExamples.filter((other) => other.slug !== slug && other.category !== example.category),
  ].slice(0, 6)

  return (
    <div className="flex min-h-screen flex-col">
      <Script
        id={`article-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: example.h1,
            description: example.metaDescription,
            dateModified: COVER_LETTERS_UPDATED,
            inLanguage: "sv-SE",
            author: { "@type": "Organization", name: "CVfixaren.se", url: BASE_URL },
            publisher: { "@type": "Organization", name: "CVfixaren.se", url: BASE_URL },
            mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/exempel-personliga-brev/${slug}` },
          }),
        }}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-subtle">
          <div className="mx-auto max-w-4xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
            <Breadcrumbs
              items={[
                { label: "Exempel på personliga brev", href: "/exempel-personliga-brev" },
                { label: example.role, href: `/exempel-personliga-brev/${slug}` },
              ]}
            />
            <h1 className="mt-8 text-[2.1rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink [text-wrap:balance] sm:text-[2.75rem]">
              {example.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-500">{example.intro}</p>
          </div>
        </section>

        {/* The letter */}
        <section className="pb-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl font-bold text-ink">Exempel på personligt brev som {example.roleLower}</h2>
              <CopyLetterButton text={letterAsPlainText(example)} />
            </div>
            <article
              id="exempelbrev"
              className="mt-4 rounded-2xl bg-white p-6 text-[0.975rem] leading-relaxed text-ink-700 shadow-page ring-1 ring-ink-100 sm:p-10 md:p-12"
            >
              <p className="font-semibold text-ink">{letter.senderName}</p>
              <p className="text-sm text-ink-500">{letter.senderContact}</p>
              <p className="mt-8 font-semibold text-ink">{letter.subject}</p>
              <p className="mt-6">{letter.greeting}</p>
              {letter.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-4">
                  {paragraph}
                </p>
              ))}
              <p className="mt-6">{letter.closing}</p>
              <p className="font-semibold text-ink">{letter.signature}</p>
            </article>
            <p className="mt-3 text-sm text-ink-500">
              Personer och företag i exemplet är påhittade. Byt ut detaljerna mot dina egna erfarenheter.
            </p>
          </div>
        </section>

        {/* Why it works */}
        <Section background="gray">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-ink">Därför fungerar brevet</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {example.whyItWorks.map((item) => (
                <div key={item.point} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
                  <h3 className="font-semibold text-ink">{item.point}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* What to highlight + openings */}
        <Section>
          <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-ink">Det här ska du lyfta fram som {example.roleLower}</h2>
              <ul className="mt-6 space-y-3">
                {example.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-ink-600">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" strokeWidth={2.5} />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-ink">Tre sätt att inleda brevet</h2>
              <div className="mt-6 space-y-4">
                {example.openings.map((opening) => (
                  <blockquote
                    key={opening}
                    className="rounded-xl border-l-4 border-brand bg-brand-50/60 px-5 py-4 text-ink-700"
                  >
                    {opening}
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Mistakes */}
        <Section background="gray">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-ink">Vanliga misstag i personliga brev som {example.roleLower}</h2>
            <div className="mt-8 space-y-4">
              {example.mistakes.map((item) => (
                <div key={item.mistake} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
                  <h3 className="flex items-start gap-2 font-semibold text-ink">
                    <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" strokeWidth={2.5} />
                    {item.mistake}
                  </h3>
                  <p className="mt-2 pl-7 text-sm leading-relaxed text-ink-500">{item.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-ink">Vanliga frågor</h2>
            <div className="mt-8 divide-y divide-ink-100">
              {example.faq.map((item) => (
                <div key={item.q} className="py-5">
                  <h3 className="font-semibold text-ink">{item.q}</h3>
                  <p className="mt-2 leading-relaxed text-ink-500">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* CV for the same role + CTA */}
        <Section background="gray">
          <div className="mx-auto max-w-4xl rounded-3xl bg-ink px-6 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Brevet och CV:t hör ihop</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-200">
              Rekryteraren läser oftast CV:t först. Skapa ett CV som matchar brevet, i samma stil och med samma
              exempel.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="btn-sweep-glow h-14 px-8 text-base">
                <Link href="/profil/skapa-cv">
                  <span>Skapa ditt CV</span>
                </Link>
              </Button>
              {cvExample && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 border-white/20 bg-transparent px-8 text-base text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <Link href={`/cv-exempel/${cvSlug}`}>Se CV-exempel för {example.roleLower}</Link>
                </Button>
              )}
            </div>
          </div>
        </Section>

        {/* Related letters */}
        {related.length > 0 && (
          <Section>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-bold text-ink">Fler exempel på personliga brev</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/exempel-personliga-brev/${other.slug}`}
                      className="group flex items-center justify-between rounded-xl bg-white px-4 py-3 text-ink ring-1 ring-ink-100 transition-colors hover:ring-ink-300"
                    >
                      <span className="font-medium">Personligt brev {other.roleLower}</span>
                      <ArrowRight className="h-4 w-4 text-ink-400 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6">
                <Link href="/exempel-personliga-brev" className="font-semibold text-brand-700 hover:underline">
                  Alla exempel på personliga brev
                </Link>
              </p>
            </div>
          </Section>
        )}

        {/* Guides that apply to every letter */}
        <Section background="gray-50">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-ink">Guider för ditt personliga brev</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {LETTER_GUIDES.map((guide) => (
                <li key={guide.href}>
                  <Link
                    href={guide.href}
                    className="group flex h-full flex-col rounded-xl bg-white px-4 py-4 ring-1 ring-ink-100 transition-colors hover:ring-ink-300"
                  >
                    <span className="font-semibold text-ink">{guide.title}</span>
                    <span className="mt-1 text-sm text-ink-500">{guide.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
