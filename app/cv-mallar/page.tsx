import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Professionella CV-mallar — Välj din design | CVfixaren",
  description: "Utforska våra professionella CV-mallar och skapa ditt perfekta CV med CVfixaren. ATS-optimerade mallar för alla branscher och yrken.",
  alternates: {
    canonical: "https://www.cvfixaren.se/cv-mallar",
  },
  openGraph: {
    title: "Professionella CV-mallar — Välj din design | CVfixaren",
    description: "Utforska våra professionella CV-mallar och skapa ditt perfekta CV med CVfixaren.",
    url: "https://www.cvfixaren.se/cv-mallar",
  },
}

const templates = [
  {
    id: "standard",
    name: "Standard CV Mall",
    description:
      "En klassisk och professionell CV-mall med en tidlös design. Passar perfekt för traditionella branscher och företag.",
    image: "/images/templates/cv-mall-standard.png",
  },
  {
    id: "elegant",
    name: "Minimalistisk CV Mall",
    description:
      "En ren och elegant CV-mall med centrerad layout. Perfekt för dig som vill ha en modern och stilren presentation.",
    image: "/images/templates/cv-mall-minimalistisk.png",
  },
  {
    id: "lyxig",
    name: "Modern CV Mall",
    description:
      "En modern tvåkolumns CV-mall med en stilfull sidopanel. Idealisk för att sticka ut och visa din kreativitet.",
    image: "/images/templates/cv-mall-modern.png",
  },
  {
    id: "timeline",
    name: "Timeline CV Mall",
    description:
      "En professionell CV-mall med tidslinje-layout som tydligt visar din karriärutveckling. Perfekt för erfarna kandidater.",
    image: "/images/templates/cv-mall-timeline.png",
  },
  {
    id: "executive",
    name: "Executive CV Mall",
    description:
      "En exklusiv CV-mall med elegant typografi och subtila accenter. Idealisk för chefspositioner och senior-roller.",
    image: "/images/templates/cv-mall-executive.png",
  },
]

export default function CVTemplatesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <Breadcrumbs items={[{ label: "CV-mallar", href: "/cv-mallar" }]} />
          <div className="max-w-3xl mx-auto text-center mb-12 mt-8">
            <h1 className="text-4xl font-bold mb-4">Professionella CV-mallar</h1>
            <p className="text-xl text-gray-600">
              Välj bland våra professionellt designade CV-mallar för att skapa ett CV som sticker ut från mängden. Alla mallar är ATS-optimerade och redo att användas direkt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105"
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={template.image}
                    alt={`${template.name} — professionell CV-mall förhandsvisning`}
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
        </div>
      </main>
      <Footer />
    </div>
  )
}
