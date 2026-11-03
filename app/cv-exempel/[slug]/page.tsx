import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/section"
import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Check } from "lucide-react"
import { sanitizeHTML } from "@/lib/sanitize"
import { cvExamples } from "@/lib/cv-examples"
import { coverLetterExamples, cvSlugForLetter } from "@/lib/cover-letter-examples"

interface Props {
  params: Promise<{ slug: string }>
}

// Every page is known at build time; anything else is a 404.
export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(cvExamples).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const example = cvExamples[resolvedParams.slug]

  if (!example) {
    return { title: "CV-exempel hittades inte | CVfixaren" }
  }

  return {
    title: example.metaTitle,
    description: example.metaDescription,
    alternates: {
      canonical: `https://www.cvfixaren.se/cv-exempel/${resolvedParams.slug}`,
    },
    openGraph: {
      title: example.metaTitle,
      description: example.metaDescription,
    },
  }
}

export default async function CVExamplePage({ params }: Props) {
  const resolvedParams = await params
  const example = cvExamples[resolvedParams.slug]

  if (!example) {
    notFound()
  }

  const letter = coverLetterExamples.find((candidate) => cvSlugForLetter(candidate.slug) === resolvedParams.slug)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-subtle py-16 md:py-20">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { label: "CV-exempel", href: "/cv-exempel" },
                { label: example.role, href: `/cv-exempel/${resolvedParams.slug}` },
              ]}
            />
            <div className="max-w-4xl mx-auto mt-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{example.title}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {example.intro}
              </p>
              <Link href="/profil/skapa-cv">
                <Button size="lg" className="px-8">
                  Skapa ditt CV nu
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CV Example */}
        <Section background="white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">CV-exempel i textformat</h2>
            <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(example.cvText) }} />
          </div>
        </Section>

        {/* How to write */}
        <Section background="gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Hur man skriver ett CV för en {example.role.toLowerCase()}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{example.howToWrite}</p>
          </div>
        </Section>

        {/* Section breakdowns */}
        <Section background="white">
          <div className="max-w-3xl mx-auto space-y-8">
            {example.sections.map((section, i) => (
              <div key={section.heading} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#00bf63] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{section.heading}</h3>
                    <p className="text-sm text-muted-foreground">{section.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typical tasks, phrased for reuse in a CV */}
        {example.tasks && example.tasks.length > 0 && (
          <Section background="gray-50">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-3">Typiska arbetsuppgifter som {example.role.toLowerCase()}</h2>
              <p className="text-muted-foreground mb-6">
                Välj de uppgifter som stämmer för dig och lägg till en siffra eller ett resultat där du kan.
              </p>
              <ul className="space-y-3">
                {example.tasks.map((task) => (
                  <li key={task} className="flex gap-3 text-ink-600">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" strokeWidth={2.5} />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {/* FAQ */}
        {example.faq && example.faq.length > 0 && (
          <Section background="white">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Vanliga frågor</h2>
              <div className="divide-y divide-ink-100">
                {example.faq.map((item) => (
                  <div key={item.q} className="py-5">
                    <h3 className="font-semibold text-ink">{item.q}</h3>
                    <p className="mt-2 leading-relaxed text-ink-500">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* CTA */}
        <Section background="gray">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Redo att skapa ditt {example.role}-CV?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Använd detta CV-exempel som inspiration och skapa ett professionellt CV på bara några minuter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profil/skapa-cv">
                <Button
                  size="lg"
                  className="btn-sweep-glow px-8"
                >
                  Skapa ditt CV nu
                </Button>
              </Link>
              <Link href="/cv-exempel">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63] hover:text-white"
                >
                  Alla CV-exempel
                </Button>
              </Link>
            </div>
            {letter && (
              <p className="mt-8">
                <Link href={`/exempel-personliga-brev/${letter.slug}`} className="font-semibold text-brand-700 hover:underline">
                  Se ett exempel på personligt brev som {letter.roleLower}
                </Link>
              </p>
            )}
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
