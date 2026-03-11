import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Section } from "@/components/section"
import { FileText, CheckCircle } from "lucide-react"
import type { Metadata } from "next"

const exampleSlugs: Record<string, string> = {
  Student: "student",
  Sjuksköterska: "sjukskoterska",
  Undersköterska: "underskoterska",
  Lagerarbetare: "lagerarbetare",
  Gymnasieelev: "gymnasieelev",
  Konsult: "konsult",
  Barnskötare: "barnskotare",
  "Servitör/servitris": "servitor-servitris",
}

export const metadata: Metadata = {
  title: "CV-exempel för olika yrken och branscher (2026) | CVfixaren",
  description:
    "Utforska professionella CV-exempel för över 50 yrken och branscher. Hitta inspiration och skapa ditt eget CV med våra ATS-optimerade mallar. Gratis att komma igång.",
  alternates: {
    canonical: "https://www.cvfixaren.se/cv-exempel",
  },
  openGraph: {
    title: "CV-exempel för olika yrken och branscher (2026) | CVfixaren",
    description: "Professionella CV-exempel för över 50 yrken och branscher. Hitta inspiration för ditt CV.",
    url: "https://www.cvfixaren.se/cv-exempel",
  },
}

const categories = [
  {
    name: "Hälsa och medicin",
    description:
      "Professionella CV-exempel för sjukvårdspersonal. Visa din kompetens och erfarenhet inom vården på bästa sätt.",
    examples: [
      "Läkare",
      "Sjuksköterska",
      "Undersköterska",
      "Tandläkare",
      "Sjukgymnast",
      "Psykolog",
      "Apotekare",
      "Medicinsk sekreterare",
    ],
    count: 8,
  },
  {
    name: "IT och teknik",
    description:
      "CV-exempel anpassade för techbranschen. Lyft fram dina tekniska färdigheter och projekt på ett sätt som imponerar.",
    examples: [
      "Webbutvecklare",
      "Full-stack-utvecklare",
      "IT-specialist",
      "Programmerare",
      "Mjukvaruutvecklare",
      "Frontendutvecklare",
      "Dataingenjör",
      "Cybersäkerhetsexpert",
    ],
    count: 8,
  },
  {
    name: "Skola och utbildning",
    description:
      "CV-exempel för lärare, akademiker och utbildningspersonal. Visa din pedagogiska erfarenhet och kompetens.",
    examples: [
      "Lärare",
      "Grundskollärare",
      "Lärarassistent",
      "Akademiker",
      "Förskolepedagog",
      "Universitetslektor",
    ],
    count: 6,
  },
  {
    name: "Försäljning och marknadsföring",
    description:
      "CV-exempel som hjälper dig visa dina resultat inom försäljning och marknadsföring. Lyft fram dina prestationer med siffror.",
    examples: [
      "Säljare",
      "Marknadsförare",
      "Digital marknadsförare",
      "Social Media Manager",
      "Innehållsskribent",
      "Marknadsföringschef",
      "Försäljningschef",
    ],
    count: 7,
  },
  {
    name: "Ekonomi och redovisning",
    description:
      "CV-exempel för ekonomer, revisorer och finansproffs. Presentera din analytiska förmåga och ekonomiska kompetens.",
    examples: [
      "Ekonomiassistent",
      "Revisor",
      "Finansanalytiker",
      "Banktjänsteman",
      "Konsult",
      "Controller",
    ],
    count: 6,
  },
  {
    name: "Administration",
    description:
      "CV-exempel för administrativ personal. Visa dina organisatoriska färdigheter och din förmåga att hålla verksamheten igång.",
    examples: [
      "Administratör",
      "Kontorschef",
      "Receptionist",
      "Chefsassistent",
      "Kundtjänstrepresentant",
      "Kontorssekreterare",
      "Virtuell assistent",
    ],
    count: 7,
  },
  {
    name: "Ingenjörsvetenskap",
    description:
      "CV-exempel för ingenjörer inom alla specialiseringar. Lyft fram dina tekniska kunskaper och projektresultat.",
    examples: [
      "Civilingenjör",
      "Maskiningenjör",
      "Elektroingenjör",
      "Programvaruingenjör",
      "Byggnadsingenjör",
      "Processingenjör",
    ],
    count: 6,
  },
  {
    name: "Kreativa yrken",
    description:
      "CV-exempel för kreativa yrkesutövare. Visa din kreativitet och dina projekt på ett professionellt sätt.",
    examples: [
      "Grafisk formgivare",
      "UX-designer",
      "Art Director",
      "Fotograf",
      "Copywriter",
      "Skådespelare",
    ],
    count: 6,
  },
  {
    name: "Hotell och restaurang",
    description:
      "CV-exempel för restaurang- och hotellbranschen. Visa din serviceerfarenhet och dina kundrelationsfärdigheter.",
    examples: [
      "Kock",
      "Servitör/servitris",
      "Bartender",
      "Hotellchef",
      "Restaurangchef",
      "Barista",
      "Konditor",
    ],
    count: 7,
  },
  {
    name: "Transport och logistik",
    description:
      "CV-exempel för transportbranschen. Presentera dina kvalifikationer och erfarenhet inom logistik och transport.",
    examples: [
      "Lastbilschaufför",
      "Lagerarbetare",
      "Bussförare",
      "Pilot",
      "Flygvärdinna",
      "Sjöman",
    ],
    count: 6,
  },
  {
    name: "Hantverk och bygg",
    description:
      "CV-exempel för hantverkare och byggbranschen. Lyft fram dina praktiska färdigheter och certifieringar.",
    examples: [
      "Elektriker",
      "Rörmokare",
      "Snickare",
      "Mekaniker",
      "Byggnadsarbetare",
      "Underhållstekniker",
    ],
    count: 6,
  },
  {
    name: "Student och nyutexaminerad",
    description:
      "CV-exempel speciellt anpassade för studenter och nyutexaminerade. Visa din potential även utan lång arbetslivserfarenhet.",
    examples: [
      "Student",
      "Praktikant",
      "Sommarjobb",
      "Gymnasieelev",
      "Nyutexaminerad",
    ],
    count: 5,
  },
]

const cvSections = [
  {
    title: "Rubrik och kontaktuppgifter",
    description:
      "Rubriken finns högst upp på CV:t. Huvudsyftet är att ditt namn och din kontaktinformation finns lättillgänglig så att arbetsgivaren enkelt kan kontakta dig för att bjuda in dig på intervju.",
  },
  {
    title: "Personlig sammanfattning (profil)",
    description:
      "Den inledande personliga sammanfattningen består av 3–4 meningar som presenterar dina bästa färdigheter, erfarenheter och bedrifter. Målet är att fånga rekryterarens uppmärksamhet.",
  },
  {
    title: "Arbetslivserfarenhet",
    description:
      "I det här avsnittet listar du dina tidigare tjänster med punktlistor som beskriver dina arbetsuppgifter, prestationer och de färdigheter som behövs för varje jobb.",
  },
  {
    title: "Utbildning",
    description:
      "I utbildningsavsnittet listar du dina examina och beskriver andra utbildningar du gått - gymnasium, akademisk utbildning, distanskurser med mera.",
  },
  {
    title: "Färdigheter",
    description:
      "I avsnittet om färdigheter ska du lyfta fram dina unika egenskaper och expertis. Fokusera både på hårda färdigheter (teknisk kunskap) och mjuka färdigheter (personlighetsdrag).",
  },
]

export default function CVExempelPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-subtle py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Professionella CV-exempel för alla branscher
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Hitta inspiration bland våra CV-exempel för över 50 yrken. Använd dem som grund och skapa ditt eget professionella, ATS-optimerade CV med vårt verktyg.
            </p>
            <Link href="/profil/skapa-cv">
              <Button size="lg" className="bg-[#00bf63] hover:bg-[#00a857] text-white px-8">
                Skapa ditt CV nu
              </Button>
            </Link>
            <div className="relative w-full max-w-4xl mx-auto mt-12">
              <Image
                src="/images/cv-exempel-hero.png"
                alt="CV-exempel med professionell design från CVfixaren"
                width={1024}
                height={640}
                className="rounded-xl shadow-elevated"
                priority
              />
            </div>
          </div>
        </section>

        {/* Categories grid */}
        <Section background="white">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            CV-exempel per bransch
          </h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Välj din bransch nedan och hitta CV-exempel som matchar din yrkeserfarenhet och karriärmål.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.name}
                className="bg-white border border-gray-100 rounded-xl p-6 hover-lift shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <span className="text-xs font-medium bg-[#00bf63]/10 text-[#00bf63] px-2.5 py-1 rounded-full">
                    {category.count} exempel
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.examples.map((example) => {
                    const slug = exampleSlugs[example]
                    return (
                      <Link
                        key={example}
                        href={slug ? `/cv-exempel/${slug}` : "/profil/skapa-cv"}
                        className="text-xs bg-gray-50 hover:bg-[#00bf63]/10 hover:text-[#00bf63] text-muted-foreground px-3 py-1.5 rounded-full transition-colors border border-gray-100"
                      >
                        {example}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* What a CV should contain */}
        <Section background="gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Vad ska ett CV innehålla 2026?
            </h2>
            <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
              Om ditt CV saknar rätt avsnitt riskerar det att hamna i papperskorgen. Här är de viktigaste delarna som ska ingå.
            </p>
            <div className="space-y-6">
              {cvSections.map((section, index) => (
                <div
                  key={section.title}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-[#00bf63] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {section.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Choosing the right format */}
        <Section background="white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Välj rätt CV-format
            </h2>
            <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
              Rätt format beror på din erfarenhetsnivå, branschen du söker i och arbetsgivarens förväntningar.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-[#00bf63]/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-[#00bf63]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Kronologiskt CV</h3>
                <p className="text-sm text-muted-foreground">
                  Det vanligaste formatet. Listar dina jobb i omvänd ordning med det senaste först. Perfekt om du har en tydlig karriärväg och minst 2–3 tidigare tjänster att visa upp.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-[#00bf63]/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-[#00bf63]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Funktionellt CV</h3>
                <p className="text-sm text-muted-foreground">
                  Bäst för studenter och den som är ny på arbetsmarknaden. Fokuserar på färdigheter istället för arbetshistorik. Bra om du byter karriär eller har luckor i CV:t.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-[#00bf63]/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-[#00bf63]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Hybridformat</h3>
                <p className="text-sm text-muted-foreground">
                  En kombination av kronologiskt och funktionellt. Ger maximal flexibilitet och passar bra för frilansare och de med bred erfarenhet inom flera områden.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Benefits of using examples */}
        <Section background="gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Fördelar med att använda CV-exempel
            </h2>
            <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
              Våra CV-exempel är utformade för att hjälpa jobbsökare att skapa starkare ansökningar.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Expertutformade exempel",
                  text: "Varje exempel är skapat med insikt i vad rekryterare faktiskt letar efter i en ansökan inom respektive bransch.",
                },
                {
                  title: "Rekryterarvänlig layout",
                  text: "Våra layouter är designade i samarbete med HR-proffs för att ge kandidater ett försprång på arbetsmarknaden.",
                },
                {
                  title: "ATS-optimerade",
                  text: "Alla våra CV-mallar är kompatibla med moderna ATS-system som arbetsgivare använder för att filtrera ansökningar.",
                },
                {
                  title: "Snabbare att komma igång",
                  text: "Istället för att börja från noll kan du använda våra exempel som grund och anpassa efter dina egna erfarenheter.",
                },
                {
                  title: "Anpassningsbara mallar",
                  text: "Välj mellan flera professionella mallar med olika typsnitt, färger och layout. Gör CV:t helt till ditt eget.",
                },
                {
                  title: "PDF-export med ett klick",
                  text: "När du är nöjd laddar du ner ditt CV som PDF, redo att skickas direkt till arbetsgivare eller laddas upp på jobbsajter.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <CheckCircle className="h-5 w-5 text-[#00bf63] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section background="white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Vanliga frågor om CV-exempel
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "Kan jag anpassa CV-exemplet efter mina behov?",
                  a: "Ja, alla våra CV-exempel är utformade för att anpassas efter din egen arbetslivserfarenhet och dina färdigheter. Öppna verktyget, välj en mall och redigera text, rubriker, färger och layout.",
                },
                {
                  q: "Behöver jag skapa ett nytt CV för varje jobbansökan?",
                  a: "Vi rekommenderar att du anpassar ditt CV för varje specifik tjänst. Det behöver inte innebära att du börjar om från noll - ofta räcker det att justera sammanfattningen och lyfta fram de mest relevanta erfarenheterna.",
                },
                {
                  q: "Vad ska jag göra om mitt yrke inte finns med?",
                  a: "Vi lägger till nya yrkesexempel kontinuerligt. Under tiden kan du använda ett allmänt CV-exempel som grund och anpassa det efter din specifika roll. Principerna för ett bra CV är desamma oavsett bransch.",
                },
                {
                  q: "Vad förväntar sig rekryterare av ett CV 2026?",
                  a: "Rekryterare vill se ett rent, överskådligt CV med tydlig disposition och inga stavfel. De vill snabbt hitta relevant information. Välj en professionell mall och lyft fram dina mest imponerande prestationer.",
                },
                {
                  q: "Är CV-exemplen gratis?",
                  a: "Ja, du kan se alla våra CV-exempel helt gratis som inspiration. Du kan sedan skapa ditt eget CV med vår CV-byggare och ladda ner det som PDF.",
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                >
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <Section background="gray">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Redo att skapa ditt professionella CV?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Använd våra CV-exempel som inspiration och skapa ett imponerande CV på bara några minuter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profil/skapa-cv">
                <Button
                  size="lg"
                  className="btn-sweep-glow bg-[#00bf63] hover:bg-[#00a857] text-white px-8"
                >
                  Skapa ditt CV nu
                </Button>
              </Link>
              <Link href="/cv-mallar">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63] hover:text-white"
                >
                  Se våra mallar
                </Button>
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
