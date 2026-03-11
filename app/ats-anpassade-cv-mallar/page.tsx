import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Section } from "@/components/section"
import { CheckCircle, Shield, Zap } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ATS-anpassade CV-mallar: Rekryterar-vänligt format (2026) | CVfixaren",
  description: "Förbättra ditt jobbsökande med våra ATS-anpassade CV-mallar. Designade för att passera Applicant Tracking Systems och imponera på rekryterare. Gratis att komma igång.",
  alternates: {
    canonical: "https://www.cvfixaren.se/ats-anpassade-cv-mallar",
  },
  openGraph: {
    title: "ATS-anpassade CV-mallar: Rekryterar-vänligt format (2026) | CVfixaren",
    description: "Förbättra ditt jobbsökande med våra ATS-anpassade CV-mallar. Designade för att passera Applicant Tracking Systems.",
    url: "https://www.cvfixaren.se/ats-anpassade-cv-mallar",
  },
}

const templates = [
  {
    id: "standard",
    name: "Standard CV Mall",
    description:
      "En klassisk och professionell CV-mall optimerad för ATS-system. Tydlig struktur som garanterar att din information läses korrekt.",
    image: "/images/templates/cv-mall-standard.png",
  },
  {
    id: "elegant",
    name: "Minimalistisk CV Mall",
    description:
      "En ren och elegant mall med centrerad layout. ATS-vänlig design som ändå sticker ut visuellt hos rekryteraren.",
    image: "/images/templates/cv-mall-minimalistisk.png",
  },
  {
    id: "lyxig",
    name: "Modern CV Mall",
    description:
      "En modern tvåkolumns CV-mall som balanserar visuell design med ATS-kompatibilitet. Perfekt för kreativa branscher.",
    image: "/images/templates/cv-mall-modern.png",
  },
  {
    id: "timeline",
    name: "Timeline CV Mall",
    description:
      "Tidslinjebaserad layout som tydligt visar karriärutveckling. ATS-optimerad med klar hierarki som gör det enkelt för systemet att tolka.",
    image: "/images/templates/cv-mall-timeline.png",
  },
  {
    id: "executive",
    name: "Executive CV Mall",
    description:
      "Exklusiv mall designad för senior-roller. Kombinerar professionell elegans med full ATS-kompatibilitet.",
    image: "/images/templates/cv-mall-executive.png",
  },
]

export default function ATSCVTemplatesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <Breadcrumbs items={[{ label: "ATS-anpassade CV-mallar", href: "/ats-anpassade-cv-mallar" }]} />
          <div className="max-w-3xl mx-auto text-center mb-12 mt-8">
            <h1 className="text-4xl font-bold mb-4">ATS-anpassade CV-mallar</h1>
            <p className="text-xl text-gray-600">
              Förbättra ditt jobbsökande med våra ATS-anpassade CV-mallar. Designade för att passera Applicant Tracking Systems och imponera på rekryterare.
            </p>
          </div>

          <Section background="gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Vad är ett ATS-system?</h2>
              <p className="text-gray-600 text-center mb-8">
                ATS (Applicant Tracking System) är ett digitalt system som arbetsgivare använder för att filtrera och sortera inkommande jobbansökningar. Upp till 75% av alla CV:n avvisas av ATS-system innan en människa ens ser dem. Våra mallar är specifikt designade för att ta sig förbi dessa filter.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-[#00bf63]" />
                  </div>
                  <h3 className="font-semibold mb-2">Korrekt formatering</h3>
                  <p className="text-sm text-gray-600">Standardiserade rubriker och sektioner som ATS-system förstår och kan tolka korrekt.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-[#00bf63]" />
                  </div>
                  <h3 className="font-semibold mb-2">Ren kod</h3>
                  <p className="text-sm text-gray-600">PDF-exporten genererar ren, maskinläsbar text utan dolda tecken eller komplicerad formatering.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-[#00bf63]" />
                  </div>
                  <h3 className="font-semibold mb-2">Nyckelordsoptimerat</h3>
                  <p className="text-sm text-gray-600">Strukturen gör det enkelt att inkludera relevanta nyckelord som matchar jobbeskrivningen.</p>
                </div>
              </div>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105"
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={template.image}
                    alt={`${template.name} — ATS-anpassad CV-mall förhandsvisning`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-2">{template.name}</h2>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <Link href={`/profil/skapa-cv?template=${template.id}`}>
                    <Button className="w-full bg-[#00bf63] hover:bg-[#00a857] text-white">Använd denna mall</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Section background="white">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6">Tips för att passera ATS-system</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00bf63] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600"><strong>Använd standardrubriker</strong> som &quot;Arbetslivserfarenhet&quot;, &quot;Utbildning&quot; och &quot;Färdigheter&quot; — ATS-system letar efter dessa specifika termer.</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00bf63] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600"><strong>Inkludera nyckelord</strong> från jobbeskrivningen i ditt CV. ATS-system matchar dina kvalifikationer mot specifika krav.</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00bf63] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600"><strong>Undvik bilder och grafik</strong> i själva texten — ATS-system kan inte tolka visuellt innehåll. Håll designen enkel.</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00bf63] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600"><strong>Skicka som PDF</strong> för att bevara formateringen. Våra mallar genererar ATS-kompatibla PDF-filer.</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-[#00bf63] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600"><strong>Håll det enkelt</strong> — undvik tabeller, textrutor och ovanliga teckensnitt som kan förvirra ATS-parsern.</p>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
