import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FAQ } from "@/components/faq"
import type { Metadata } from "next"
import { getCvTheme } from "@/lib/cv-templates/themes"

export const metadata: Metadata = {
  title: "CV-mallar – 15 snygga CV-mallar att prova gratis | CVfixaren",
  description:
    "Välj bland 15 professionella CV-mallar – klassiska, moderna och enkla. Alla är ATS-anpassade. Fyll i mallen online och ladda ner ditt CV som PDF.",
  alternates: {
    canonical: "https://www.cvfixaren.se/cv-mallar",
  },
  openGraph: {
    title: "CV-mallar – 15 snygga CV-mallar att prova gratis | CVfixaren",
    description:
      "Välj bland 15 professionella CV-mallar – klassiska, moderna och enkla. Fyll i mallen online och ladda ner ditt CV som PDF.",
    url: "https://www.cvfixaren.se/cv-mallar",
  },
}

interface TemplateInfo {
  id: string
  name: string
  description: string
  bestFor: string
  image: string
}

// The five original templates have their own generators; the rest are CSS
// themes (lib/cv-templates/themes.ts), so their copy is read from there.
const original: Record<string, Omit<TemplateInfo, "id" | "bestFor">> = {
  default: {
    name: "Standard",
    description: "En klassisk och professionell CV-mall med en tidlös design.",
    image: "/images/templates/cv-mall-standard.png",
  },
  minimalist: {
    name: "Minimalistisk",
    description: "Ren och elegant med centrerad rubrik och gott om luft.",
    image: "/images/templates/cv-mall-minimalistisk.png",
  },
  modern: {
    name: "Modern",
    description: "Tvåspaltig mall med en mörk sidopanel för kontakt och kompetenser.",
    image: "/images/templates/cv-mall-modern.png",
  },
  timeline: {
    name: "Timeline",
    description: "En tidslinje som tydligt visar hur din karriär har utvecklats.",
    image: "/images/templates/cv-mall-timeline.png",
  },
  executive: {
    name: "Executive",
    description: "Exklusiv typografi med serif och diskreta accenter.",
    image: "/images/templates/cv-mall-executive.png",
  },
}

function template(id: string, bestFor: string): TemplateInfo {
  const base = original[id]
  if (base) return { id, bestFor, ...base }
  const theme = getCvTheme(id)
  if (!theme) throw new Error(`Unknown CV template: ${id}`)
  return {
    id,
    bestFor,
    name: theme.name,
    description: `${theme.description}.`,
    image: `/images/templates/cv-mall-${theme.id}.png`,
  }
}

const groups = [
  {
    id: "klassiska",
    title: "Klassiska CV-mallar",
    intro:
      "Tidlösa CV-mallar med tydlig struktur. Ett säkert val i traditionella branscher och när du söker via rekryteringssystem.",
    templates: [
      template("default", "De flesta jobb – särskilt ekonomi, administration och offentlig sektor."),
      template("executive", "Chefs- och seniora roller där du vill signalera erfarenhet."),
      template("affar", "Bank, finans, konsultbolag och andra företagsmiljöer."),
      template("akademisk", "Forskning, utbildning och akademiska tjänster."),
    ],
  },
  {
    id: "moderna",
    title: "Moderna CV-mallar",
    intro:
      "CV-mallar med färg och personlighet som fortfarande är lätta att läsa. Passar när du vill sticka ut lite mer.",
    templates: [
      template("modern", "Kreativa och digitala yrken där en sidopanel med kompetenser passar."),
      template("timeline", "Dig som har en tydlig karriärutveckling att visa upp."),
      template("oslo", "Service, marknad och kommunikation."),
      template("accent", "Dig som vill ha färg utan att tumma på läsbarheten."),
      template("varm", "Yrken där personligheten räknas, till exempel skola, vård och omsorg."),
      template("teknisk", "Utvecklare och andra roller inom IT och data."),
    ],
  },
  {
    id: "enkla",
    title: "Enkla CV-mallar",
    intro:
      "Avskalade CV-mallar där innehållet står i centrum. Bra för första jobbet, sommarjobb och när du vill ha ett stilrent CV.",
    templates: [
      template("minimalist", "Nästan alla branscher – låter innehållet tala."),
      template("nordisk", "Kontor, IT och offentlig sektor."),
      template("slate", "Juridik, ekonomi och branscher där återhållsamhet uppskattas."),
      template("kontrast", "Försäljning, marknad och media – namnet syns direkt."),
      template("kompakt", "Dig med lång erfarenhet som vill få plats med mycket på få sidor."),
    ],
  },
]

const allTemplates = groups.flatMap((group) => group.templates)

const faqItems = [
  {
    question: "Är CV-mallarna gratis?",
    answer:
      "Du kan prova alla CV-mallar gratis: fyll i dina uppgifter, byt mall och se resultatet utan att skapa konto. När du vill ladda ner ditt CV som PDF startar du en provperiod: 0 kr i 7 dagar, därefter 69 kr/vecka utan bindningstid. Du kan avsluta när du vill.",
  },
  {
    question: "Kan jag ladda ner CV-mallen i Word?",
    answer:
      "Nej. Du fyller i mallen direkt i vår CV-byggare och laddar ner det färdiga CV:t som PDF. Det är också formatet Arbetsförmedlingen rekommenderar när du skickar en ansökan, eftersom layouten ser likadan ut för alla som öppnar filen.",
  },
  {
    question: "Vilken CV-mall är bäst?",
    answer:
      "Den som passar branschen du söker jobb i. En klassisk mall som Standard är ett säkert val för de flesta tjänster. I kreativa yrken kan en modern mall ge ett bättre intryck, och har du mycket erfarenhet får du plats med mer i Kompakt.",
  },
  {
    question: "Är CV-mallarna ATS-anpassade?",
    answer:
      "Ja. Alla mallar använder riktig, sökbar text och tydliga rubriker, så att rekryteringssystem (ATS) kan läsa ditt CV. Söker du via ett system och vill vara på den säkra sidan är en enspaltig mall som Standard, Nordisk eller Minimalistisk det bästa valet.",
  },
  {
    question: "Kan jag byta CV-mall efteråt?",
    answer:
      "Ja. Det du har skrivit sparas när du byter mall, så du kan prova olika CV-mallar och välja den som ser bäst ut med just ditt innehåll.",
  },
  {
    question: "Ska jag ha foto i mitt CV?",
    answer:
      "Det är inget krav i Sverige. Du kan lägga till ett foto under personuppgifterna om det är vanligt i din bransch eller om arbetsgivaren ber om det. Annars är det ofta bättre att låta erfarenheterna tala.",
  },
]

function TemplateCard({ template: t }: { template: TemplateInfo }) {
  const href = `/profil/skapa-cv?template=${t.id}`
  return (
    <article className="group flex flex-col">
      <Link href={href} aria-label={`Använd CV-mallen ${t.name}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-ink-50 px-8 pt-8 ring-1 ring-inset ring-ink-100 transition-colors group-hover:bg-brand-50">
          <div className="relative aspect-[794/1123] w-full translate-y-3 overflow-hidden rounded-t-md bg-white shadow-page transition-transform duration-500 ease-out group-hover:translate-y-0">
            <Image
              src={t.image}
              alt={`${t.name} CV-mall – ${t.description.replace(/\.$/, "").toLowerCase()}`}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
              className="object-cover object-top"
              loading="lazy"
            />
          </div>
        </div>
      </Link>
      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-lg font-semibold text-ink">{t.name}</h3>
        <p className="mt-1.5 text-ink-500">{t.description}</p>
        <p className="mt-3 text-sm text-ink-500">
          <span className="font-semibold text-ink-700">Passar för: </span>
          {t.bestFor}
        </p>
        <div className="mt-auto pt-6">
          <Button asChild className="w-full sm:w-auto">
            <Link href={href}>
              <span className="inline-flex items-center gap-2">
                Använd mallen <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function CVTemplatesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Script
        id="cv-mallar-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "CV-mallar",
            url: "https://www.cvfixaren.se/cv-mallar",
            description: "15 professionella och ATS-anpassade CV-mallar att fylla i online.",
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: allTemplates.length,
              itemListElement: allTemplates.map((t, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: `${t.name} CV-mall`,
                image: `https://www.cvfixaren.se${t.image}`,
                url: `https://www.cvfixaren.se/profil/skapa-cv?template=${t.id}`,
              })),
            },
          }),
        }}
      />
      <Script
        id="cv-mallar-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }),
        }}
      />
      <Header />
      <main className="flex-1">
        {/* ── Intro ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-ink-100">
          <div
            aria-hidden
            className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,black,transparent)]"
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-16">
            <Breadcrumbs items={[{ label: "CV-mallar", href: "/cv-mallar" }]} />
            <div className="mt-10 max-w-3xl">
              <h1 className="text-[2.3rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink sm:text-5xl">
                CV-mallar – 15 snygga mallar att fylla i online
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-500">
                Här hittar du alla våra CV-mallar: klassiska, moderna och enkla. Välj en CV-mall, fyll i dina
                uppgifter direkt i webbläsaren och se ditt CV ta form medan du skriver. Alla mallar är
                ATS-anpassade, går att prova gratis och kan bytas när som helst utan att du behöver börja om.
              </p>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
                {["Prova alla mallar gratis", "ATS-anpassade", "Byt mall utan att börja om", "Ladda ner som PDF"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-brand-700" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
              <nav aria-label="Mallkategorier" className="mt-9 flex flex-wrap gap-2">
                {groups.map((group) => (
                  <a
                    key={group.id}
                    href={`#${group.id}`}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft ring-1 ring-ink-100 hover:ring-ink-300"
                  >
                    {group.title}
                    <span className="ml-1.5 font-medium text-ink-400">{group.templates.length}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </section>

        {/* ── Template groups ───────────────────────────────────── */}
        {groups.map((group, index) => (
          <section
            key={group.id}
            id={group.id}
            className={`scroll-mt-20 py-16 md:py-20 ${index % 2 === 1 ? "bg-ink-50/60" : "bg-white"}`}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-ink md:text-4xl">{group.title}</h2>
                <p className="mt-3 text-lg leading-relaxed text-ink-500">{group.intro}</p>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {group.templates.map((t) => (
                  <TemplateCard key={t.id} template={t} />
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ── Choosing a template ───────────────────────────────── */}
        <section className="border-t border-ink-100 py-20 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
            <div className="lg:col-span-5">
              <h2 className="text-3xl font-bold text-ink md:text-4xl">Så väljer du rätt CV-mall</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-500">
                Den bästa CV-mallen är den som gör det lätt för rekryteraren att se varför du passar för jobbet.
                Utgå från branschen, hur mycket du har att berätta och hur du skickar in ansökan.
              </p>
            </div>
            <div className="divide-y divide-ink-100 border-y border-ink-100 lg:col-span-7">
              {[
                {
                  title: "Matcha branschen",
                  text: "Bank, juridik och offentlig sektor uppskattar ofta en klassisk CV-mall. Inom design, marknad och tech kan en modern mall med lite färg ge ett starkare intryck.",
                },
                {
                  title: "Tänk på hur mycket du har att berätta",
                  text: "Har du lång erfarenhet hjälper en kompakt mall dig att hålla CV:t på två sidor. Är det ditt första jobb gör en enkel mall att det du har lyfts fram tydligt.",
                },
                {
                  title: "Välj enspaltigt om du söker via ett system",
                  text: "Många arbetsgivare använder rekryteringssystem (ATS) som läser CV:t automatiskt. En enspaltig mall med vanliga rubriker läses säkrast.",
                },
                {
                  title: "Låt innehållet styra",
                  text: "Prova två eller tre mallar med ditt eget innehåll. Det du har skrivit följer med när du byter, så du ser direkt vilken som fungerar bäst.",
                },
              ].map((tip) => (
                <div key={tip.title} className="py-6">
                  <h3 className="text-lg font-semibold text-ink">{tip.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-ink-500">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Summer jobs / students ────────────────────────────── */}
        <section className="bg-ink-50/60 py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <h2 className="text-3xl font-bold text-ink md:text-4xl">CV-mall för sommarjobb, student och första jobbet</h2>
                <p className="mt-4 text-lg leading-relaxed text-ink-500">
                  Saknar du lång arbetslivserfarenhet är en enkel CV-mall oftast bäst. Den ger plats åt det du faktiskt har:
                  skola, extrajobb, ideella uppdrag, språk och personliga egenskaper. Minimalistisk, Nordisk och Standard
                  fungerar bra för både sommarjobb och ditt första riktiga jobb.
                </p>
                <p className="mt-4 leading-relaxed text-ink-500">
                  Behöver du hjälp med vad du ska skriva? Se våra{" "}
                  <Link href="/cv-exempel/student" className="font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                    CV-exempel för studenter
                  </Link>{" "}
                  och{" "}
                  <Link href="/cv-exempel/gymnasieelev" className="font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                    gymnasieelever
                  </Link>
                  , eller läs vår guide om{" "}
                  <Link href="/skriva-cv#utan-erfarenhet" className="font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                    hur du skriver ett CV utan erfarenhet
                  </Link>
                  .
                </p>
              </div>
              <div className="lg:col-span-5">
                <div className="grid grid-cols-3 gap-3">
                  {["minimalist", "nordisk", "default"].map((id) => {
                    const t = allTemplates.find((x) => x.id === id)!
                    return (
                      <Link
                        key={id}
                        href={`/profil/skapa-cv?template=${id}`}
                        className="group block"
                        aria-label={`Använd CV-mallen ${t.name}`}
                      >
                        <div className="relative aspect-[794/1123] overflow-hidden rounded-md bg-white shadow-lift ring-1 ring-ink-100 transition-transform duration-300 group-hover:-translate-y-1">
                          <Image src={t.image} alt="" fill sizes="160px" className="object-cover object-top" loading="lazy" />
                        </div>
                        <p className="mt-2 text-center text-sm font-medium text-ink-600">{t.name}</p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How to fill in ────────────────────────────────────── */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="text-3xl font-bold text-ink md:text-4xl">Så fyller du i en CV-mall</h2>
              <p className="max-w-md text-lg leading-relaxed text-ink-500">
                Från tom mall till färdigt CV på några minuter.
              </p>
            </div>
            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Välj en mall",
                  text: "Klicka på Använd mallen. Du kan byta senare utan att förlora det du har skrivit.",
                },
                {
                  title: "Fyll i dina uppgifter",
                  text: "Skriv in erfarenhet, utbildning och kompetenser – eller ladda upp ditt gamla CV som PDF eller Word så fyller vi i fälten åt dig.",
                },
                {
                  title: "Ladda ner som PDF",
                  text: "Justera typsnitt och färg, och ladda ner ditt färdiga CV som PDF när du är nöjd.",
                },
              ].map((step, i) => (
                <li key={step.title} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-brand-700 tabular">{String(i + 1).padStart(2, "0")}</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-brand/40 to-transparent" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-500">{step.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-ink-500">
              Osäker på vad du ska skriva? Läs vår guide{" "}
              <Link href="/skriva-cv" className="font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                Skriva CV – så skriver du ett bra CV steg för steg
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section className="bg-ink-50/60 py-20 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
            <div className="lg:col-span-4">
              <h2 className="text-3xl font-bold text-ink md:text-4xl">Vanliga frågor om CV-mallar</h2>
              <p className="mt-4 leading-relaxed text-ink-500">
                Letar du efter en mall som är byggd för rekryteringssystem? Se våra{" "}
                <Link href="/ats-anpassade-cv-mallar" className="font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                  ATS-anpassade CV-mallar
                </Link>
                .
              </p>
            </div>
            <div className="lg:col-span-8">
              <FAQ items={faqItems} />
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-bold text-ink md:text-4xl">Redo att skapa ditt CV?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-500">
              Börja med Standard om du är osäker – du kan byta mall när som helst medan du skriver.
            </p>
            <Button asChild size="lg" className="btn-sweep-glow mt-9 h-14 px-8 text-base">
              <Link href="/profil/skapa-cv?template=default">
                <span>Skapa ditt CV nu</span>
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
