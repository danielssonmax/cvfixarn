import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Section } from "@/components/section"
import { FileText, CheckCircle, Pen, Mail, Sparkles } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Exempel på personliga brev per bransch och yrke (2026) | CVfixaren",
  description:
    "Hitta gratis exempel på personliga brev för över 100 yrken och branscher. Använd våra mallar som inspiration och skriv ett övertygande personligt brev som kompletterar ditt CV.",
  alternates: {
    canonical: "https://www.cvfixaren.se/exempel-personliga-brev",
  },
}

const categories = [
  {
    name: "Hälsa och medicin",
    icon: "🏥",
    description:
      "Exempel på personliga brev för sjukvårdspersonal. Visa din omtanke, kompetens och erfarenhet inom vården.",
    examples: [
      "Sjuksköterska",
      "Läkare",
      "Undersköterska",
      "Apotekare",
      "Fysioterapeut",
      "Psykolog",
      "Hemtjänst",
      "Veterinär",
      "Socialarbetare",
    ],
  },
  {
    name: "Skola och utbildning",
    icon: "🎓",
    description:
      "Personliga brev för lärare, akademiker och pedagoger. Lyft fram din passion för undervisning och din pedagogiska förmåga.",
    examples: [
      "Lärare",
      "Förskollärare",
      "Lärarassistent",
      "Akademiker",
      "Vikarie",
      "Studenter",
      "Praktik",
      "Lärling",
      "Universitetslärare",
      "Stipendium",
      "Master",
      "Svensklärare",
    ],
  },
  {
    name: "Informationsteknologi (IT)",
    icon: "💻",
    description:
      "Personliga brev för IT-branschen. Visa dina tekniska färdigheter och din passion för innovation och problemlösning.",
    examples: [
      "Mjukvaruingenjör",
      "Webbutvecklare",
      "Full stack-utvecklare",
      "Programmerare",
    ],
  },
  {
    name: "Försäljning",
    icon: "📊",
    description:
      "Exempel på personliga brev för säljare och försäljningschefer. Lyft fram dina resultat och kundrelationer.",
    examples: ["Försäljningschef", "Säljare"],
  },
  {
    name: "Marknadsföring",
    icon: "📣",
    description:
      "Personliga brev för marknadsförare, journalister och kommunikatörer. Visa din kreativitet och strategiska tänkande.",
    examples: [
      "Digital marknadsförare",
      "Journalist",
      "Marknadsföring",
      "Översättare",
    ],
  },
  {
    name: "Redovisning och ekonomi",
    icon: "💰",
    description:
      "Exempel för ekonomer, revisorer och bankanställda. Presentera din analytiska förmåga och noggrannhet.",
    examples: [
      "Redovisningsekonom",
      "Banktjänsteman",
      "Bankmedarbetare",
      "Kundtjänst",
      "Revisor",
    ],
  },
  {
    name: "Detaljhandel",
    icon: "🛍️",
    description:
      "Personliga brev för detaljhandelns alla roller. Visa din serviceanda och kundorientering.",
    examples: [
      "Butikschef",
      "Butiksbiträde",
      "IKEA-medarbetare",
      "Mataffär",
      "Detaljhandeln",
    ],
  },
  {
    name: "Administration",
    icon: "📋",
    description:
      "Personliga brev för administrativ personal. Lyft fram dina organisatoriska färdigheter och din struktur.",
    examples: [
      "Administratör",
      "Receptionist",
      "Sekreterare",
      "Handläggare",
      "Kontorist",
      "Hotellreceptionist",
      "Administrativ assistent",
      "Bibliotekarie",
      "Biblioteksassistent",
      "Chef",
    ],
  },
  {
    name: "Hotell och restaurang",
    icon: "🍽️",
    description:
      "Exempel för restaurang- och hotellbranschen. Visa din serviceerfarenhet och gästorientering.",
    examples: [
      "Kock",
      "Servitris",
      "Barista",
      "Restaurangmedarbetare",
      "Restaurang",
      "McDonalds",
      "Resebyrå",
    ],
  },
  {
    name: "Transport och logistik",
    icon: "🚛",
    description:
      "Personliga brev för transport- och logistikbranschen. Visa dina kvalifikationer och erfarenhet av att leverera resultat.",
    examples: ["Lastbilschaufför", "Chaufför", "Pilot", "Lagerarbetare"],
  },
  {
    name: "Ingenjörsvetenskap",
    icon: "⚙️",
    description:
      "Exempel för ingenjörer inom alla discipliner. Lyft fram dina tekniska kunskaper och projektresultat.",
    examples: [
      "Ingenjör",
      "Civilingenjör",
      "Maskiningenjör",
      "Systemingenjör",
      "Mekaniker",
    ],
  },
  {
    name: "Hantverk",
    icon: "🔨",
    description:
      "Personliga brev för hantverkare. Visa dina praktiska färdigheter och yrkesstolthet.",
    examples: [
      "Elektriker",
      "Snickare",
      "Lokalvårdare",
      "Jordbruksarbetare",
      "Underhåll och reparation",
    ],
  },
  {
    name: "Kreativa yrken",
    icon: "🎨",
    description:
      "Exempel för kreativa yrkesutövare. Visa din originalitet och dina projekt på ett övertygande sätt.",
    examples: ["Grafisk formgivare", "Teater"],
  },
  {
    name: "Affärsverksamhet och ledning",
    icon: "👔",
    description:
      "Personliga brev för chefer, konsulter och HR-personal. Visa ledarskap och strategiskt tänkande.",
    examples: [
      "Chef",
      "Projektledare",
      "Konsult",
      "HR-medarbetare",
      "Junior HR-medarbetare",
      "Chefsassistent",
    ],
  },
  {
    name: "Säkerhet och skyddstjänster",
    icon: "🛡️",
    description:
      "Personliga brev för säkerhetsbranschen. Visa ditt engagemang för trygghet och samhällsnytta.",
    examples: ["Polis", "Brandman", "Kriminalvårdare"],
  },
  {
    name: "Juridik",
    icon: "⚖️",
    description:
      "Personliga brev för jurister och advokater. Visa din juridiska kompetens och analytiska förmåga.",
    examples: ["Advokat"],
  },
  {
    name: "Övrigt",
    icon: "📝",
    description:
      "Exempel för karriärbytare, frilansare, volontärer och alla som söker sitt första jobb.",
    examples: [
      "Karriärbyte",
      "Frilans",
      "Volontär",
      "Första jobb",
      "Hemmamamma/hemmapappa",
      "Barnskötare",
      "Vårdare",
    ],
  },
]

const letterSections = [
  {
    title: "Rubrik och kontaktuppgifter",
    description:
      "Texten högst upp i ditt brev med ditt namn, e-post, telefonnummer och eventuella länkar. Ska matcha stilen på ditt CV för ett enhetligt intryck.",
  },
  {
    title: "Hälsningsfras",
    description:
      "Tilltala rekryteraren personligt om möjligt. Använd deras namn om du kan hitta det — det visar att du gjort din research.",
  },
  {
    title: "Inledning",
    description:
      "Fånga läsarens uppmärksamhet direkt. Nämn vilken tjänst du söker, var du hittade annonsen och visa entusiasm för företaget.",
  },
  {
    title: "Brödtext — varför du?",
    description:
      "Hjärtat av brevet. Koppla dina mest relevanta erfarenheter, färdigheter och prestationer till kraven i jobbannonsen. Använd konkreta exempel.",
  },
  {
    title: "Avslutning och uppmaning",
    description:
      "Sammanfatta ditt intresse, upprepa varför du är rätt person och uppmuntra rekryteraren att boka en intervju. Tacka för deras tid.",
  },
]

export default function ExempelPersonligaBrevPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-subtle py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-[#00bf63]/10 text-[#00bf63] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Mail className="h-4 w-4" />
              Över 100 gratis exempel
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Exempel på personliga brev för alla branscher
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Våra gratis exempel på personliga brev är fyllda med praktiska tips och råd om hur du skriver ett övertygande brev för just din bransch. Kombinera dem med ditt CV för en komplett ansökan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profil/skapa-cv">
                <Button size="lg" className="bg-[#00bf63] hover:bg-[#00a857] text-white px-8">
                  Skapa ditt CV nu
                </Button>
              </Link>
              <Link href="/cv-exempel">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63] hover:text-white"
                >
                  Se CV-exempel
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories grid */}
        <Section background="white">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Exempel per bransch
          </h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Välj din bransch nedan och hitta exempel på personliga brev som passar ditt yrke och din erfarenhet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.name}
                className="bg-white border border-gray-100 rounded-xl p-6 hover-lift shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {category.icon}
                    </span>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                  <span className="text-xs font-medium bg-[#00bf63]/10 text-[#00bf63] px-2.5 py-1 rounded-full">
                    {category.examples.length} exempel
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.examples.map((example) => (
                    <Link
                      key={example}
                      href="/profil/skapa-cv"
                      className="text-xs bg-gray-50 hover:bg-[#00bf63]/10 hover:text-[#00bf63] text-muted-foreground px-3 py-1.5 rounded-full transition-colors border border-gray-100"
                    >
                      {example}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* How to structure a cover letter */}
        <Section background="gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Hur delar man in ett personligt brev?
            </h2>
            <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
              Ett välskrivet personligt brev har en tydlig struktur som framhäver varför du är rätt kandidat. Följande delar bör ingå.
            </p>
            <div className="space-y-6">
              {letterSections.map((section, index) => (
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

        {/* What makes a good cover letter */}
        <Section background="white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Vad kännetecknar ett bra personligt brev?
            </h2>
            <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
              Flera faktorer samverkar för att presentera dig som den bästa kandidaten. Här är de viktigaste.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Anpassat efter tjänsten",
                  text: "Varje personligt brev ska vara skräddarsytt för den specifika rollen och företaget. Visa att du förstår vad de söker.",
                },
                {
                  title: "Rätt mall och layout",
                  text: "En attraktiv mall med bra balans mellan vitt utrymme och text gör ditt brev lättare att läsa och mer professionellt.",
                },
                {
                  title: "Personlig hälsningsfras",
                  text: "Använd rekryterarens namn om möjligt. Undvik opersonliga formuleringar som 'Till vem det berör'.",
                },
                {
                  title: "Konkreta exempel",
                  text: "Stöd dina påståenden med siffror och specifika prestationer. Visa vad du har åstadkommit, inte bara vad du gjort.",
                },
                {
                  title: "Professionell e-postadress",
                  text: "Din e-postadress ska vara en kombination av ditt för- och efternamn. En oprofessionell adress kan skapa ett dåligt intryck.",
                },
                {
                  title: "Rätt längd",
                  text: "Sikta på 250–400 ord, alltid inom en A4-sida. Var koncis men tillräckligt detaljerad för att fånga intresset.",
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

        {/* Do's and Don'ts */}
        <Section background="gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Gör och gör inte
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-[#00bf63] flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Gör så här
                </h3>
                <ul className="space-y-3">
                  {[
                    "Ha en bra balans mellan vitt utrymme och text",
                    "Använd styckesindelning och korrekt interpunktion",
                    "Skapa en attraktiv rubrik högst upp på sidan",
                    "Anpassa brevet för varje specifik tjänst",
                    "Korrekturläs noggrant flera gånger",
                    "Inkludera konkreta exempel på prestationer",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-[#00bf63] mt-0.5">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-red-500 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center text-xs">✕</span>
                  Gör inte så här
                </h3>
                <ul className="space-y-3">
                  {[
                    "Justera marginalerna bara för att få in mer text",
                    "Överdriv med pråliga färger (om det inte passar branschen)",
                    "Glöm att korrekturläsa",
                    "Upprepa information som redan finns i ditt CV",
                    "Fokusera för mycket på dig själv och för lite på företaget",
                    "Ljug eller överdriva dina kvalifikationer",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-red-500 mt-0.5">✕</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section background="white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Vanliga frågor om personliga brev
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "Vad ska man skriva i ett personligt brev?",
                  a: "Ditt personliga brev ger dig möjlighet att gå in på detaljer. Beskriv de färdigheter och erfarenheter från ditt CV mer ingående, och lägg till ny information och exempel som är relevanta för tjänsten. Undvik att bara upprepa det som redan står i CV:t.",
                },
                {
                  q: "Hur börjar man ett personligt brev?",
                  a: "Det finns flera sätt att inleda: med en anekdot, ett uttalande om dina kompetenser eller din koppling till företaget. Det viktigaste är att fånga rekryterarens uppmärksamhet direkt och nämna vilken tjänst du söker.",
                },
                {
                  q: "Hur långt ska ett personligt brev vara?",
                  a: "Sikta på 250–400 ord. Ett kort brev fångar kanske inte alla dina kompetenser, medan ett långt brev riskerar att trötta ut läsaren. Håll dig alltid inom en A4-sida.",
                },
                {
                  q: "Vilka tre saker ska alltid finnas med?",
                  a: "Tre saker som alltid bör ingå: (1) Ditt namn och din kontaktinformation, (2) rekryterarens eller personalchefens namn, och (3) företagets namn och tjänsten du söker.",
                },
                {
                  q: "Vad letar arbetsgivare efter i ett personligt brev?",
                  a: "Arbetsgivare vill se att du verkligen är intresserad av tjänsten och att du har förstått vilka krav som ställs. De letar efter konkreta exempel på hur dina erfarenheter matchar jobbets behov.",
                },
                {
                  q: "Vilka fraser bör undvikas?",
                  a: "Undvik 'Till vem det berör' — det låter opersonligt och föråldrat. Undvik också arrogant eller överlägset språk. Var professionell men personlig, och anpassa tonen efter branschen.",
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
              Redo att skriva ditt personliga brev?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Använd våra exempel som inspiration och skapa ett komplett CV med personligt brev på bara några minuter.
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
                  Se våra CV-mallar
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
