import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/breadcrumbs"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CV-tips & karriärråd — Blogg | CVfixaren",
  description:
    "Tips och råd för att skapa det perfekta CV:t, karriärutveckling och jobbsökande från CVfixaren.se experter.",
  alternates: {
    canonical: "https://www.cvfixaren.se/blogg",
  },
  openGraph: {
    title: "CV-tips & karriärråd — Blogg | CVfixaren",
    description: "Tips och råd för att skapa det perfekta CV:t, karriärutveckling och jobbsökande.",
    url: "https://www.cvfixaren.se/blogg",
  },
}

export default function BlogPage() {
  const blogPosts = [
    {
      title: "Söka jobb i en annan stad? Så ökar du dina chanser att lyckas",
      description: "Att söka jobb i en annan stad kan öppna helt nya möjligheter. Lär dig anpassa din ansökan, hantera flytten och övertyga arbetsgivare på distans.",
      date: "2026-03-11",
      slug: "soka-jobb-annan-stad",
      category: "Karriärtips",
    },
    {
      title: "Hur man skriver ett personligt brev utan erfarenhet",
      description: "Saknar du arbetslivserfarenhet? Lär dig skriva ett övertygande personligt brev som visar din potential, motivation och vilja att lära.",
      date: "2026-02-10",
      slug: "personligt-brev-utan-erfarenhet",
      category: "Personligt brev",
    },
    {
      title: "Varför vill du jobba här? Bra och dåliga svar",
      description: "Undvik de vanligaste misstagen och lär dig fem vinnande strategier för att svara på intervjuns klurigaste fråga.",
      date: "2026-02-10",
      slug: "varfor-vill-du-jobba-har",
      category: "Intervjutips",
    },
    {
      title: "Hur man presenterar sig själv (med exempel): En komplett guide",
      description: "Lär dig presentera dig själv på ett roligt och professionellt sätt i intervjuer, mejl och telefonsamtal.",
      date: "2026-02-10",
      slug: "presentera-dig-sjalv",
      category: "Intervjutips",
    },
    {
      title: "Styrkor och svagheter på jobbintervjun: Så svarar du som ett proffs",
      description: "Lär dig identifiera dina styrkor och svagheter, ge konkreta exempel och undvika klichéer på jobbintervjun.",
      date: "2026-02-10",
      slug: "styrkor-och-svagheter-jobbintervjun",
      category: "Intervjutips",
    },
    {
      title: "Rekryterarens 5 oväntade CV-tips som landar dig intervjun",
      description: "Fem överraskande och effektiva tips direkt från en rekryterare som ökar dina chanser att landa drömjobbet.",
      date: "2025-01-28",
      slug: "rekryterarens-5-ovantade-cv-tips",
      category: "CV-tips",
    },
    {
      title: "Så skriver du ett CV som sticker ut",
      description: "Tips och tricks för att skapa ett CV som får rekryterare att höja på ögonbrynen",
      date: "2024-02-14",
      slug: "sa-skriver-du-ett-cv-som-sticker-ut",
      category: "CV-tips",
    },
    {
      title: "5 vanliga misstag att undvika i ditt CV",
      description: "Lär dig vilka misstag som kan kosta dig drömjobbet",
      date: "2024-02-10",
      slug: "5-vanliga-misstag-att-undvika",
      category: "CV-tips",
    },
    {
      title: "Personligt brev - En komplett guide",
      description: "Allt du behöver veta för att skriva ett övertygande personligt brev",
      date: "2024-02-05",
      slug: "personligt-brev-guide",
      category: "Personligt brev",
    },
    {
      title: "LinkedIn-profil som kompletterar ditt CV",
      description: "Maximera dina chanser att bli upptäckt av rekryterare genom att optimera din LinkedIn-profil",
      date: "2024-02-03",
      slug: "linkedin-profil-optimering",
      category: "Karriärtips",
    },
    {
      title: "Arbetsintervju: Vanliga frågor och bästa svaren",
      description: "Förbered dig för din nästa arbetsintervju med våra expertråd",
      date: "2024-01-28",
      slug: "arbetsintervju-fragor-och-svar",
      category: "Intervjutips",
    },
    {
      title: "AI och framtidens CV-skrivande",
      description: "Hur artificiell intelligens förändrar hur vi skapar och anpassar våra CV:n",
      date: "2024-01-25",
      slug: "ai-och-framtidens-cv",
      category: "Trender",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[{ label: "Blogg", href: "/blogg" }]} />
          <div className="max-w-4xl mx-auto mt-8">
            <h1 className="text-4xl font-bold mb-8">Karriärblogg</h1>
            <div className="grid gap-6">
              {blogPosts.map((post) => (
                <Card key={post.slug}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          <Link href={`/blogg/${post.slug}`} className="hover:text-[#00bf63] transition-colors">
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>{post.date}</CardDescription>
                      </div>
                      <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                        {post.category}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{post.description}</p>
                    <Link href={`/blogg/${post.slug}`}>
                      <Button variant="link" className="mt-4 p-0 text-[#00bf63] hover:text-[#00a857]">
                        Läs mer →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
