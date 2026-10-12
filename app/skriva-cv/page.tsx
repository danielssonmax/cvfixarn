import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { ArrowRight, Check, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FAQ } from "@/components/faq"

const PAGE_URL = "https://www.cvfixaren.se/skriva-cv"
const PUBLISHED = "2026-10-12"
const UPDATED = "2026-10-12"

export const metadata: Metadata = {
  title: "Skriva CV: Så skriver du ett bra CV steg för steg | CVfixaren",
  description:
    "Lär dig skriva ett CV som leder till intervju: vad ett CV ska innehålla, hur du skriver profiltext och erfarenhet, vanliga misstag och en checklista.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Skriva CV: Så skriver du ett bra CV steg för steg",
    description:
      "Vad ett CV ska innehålla, hur du skriver profiltext och erfarenhet, vanliga misstag och en checklista innan du skickar.",
    url: PAGE_URL,
    type: "article",
  },
}

const toc = [
  { id: "vad-ar-ett-cv", label: "Vad är ett CV?" },
  { id: "vad-ska-ett-cv-innehalla", label: "Vad ska ett CV innehålla?" },
  { id: "steg-for-steg", label: "Så skriver du ett CV steg för steg" },
  { id: "profiltext-exempel", label: "Exempel på profiltext" },
  { id: "hur-langt", label: "Hur långt ska ett CV vara?" },
  { id: "bild", label: "Ska man ha bild i CV:t?" },
  { id: "utan-erfarenhet", label: "Skriva CV utan erfarenhet" },
  { id: "ats", label: "Så läser rekryteringssystem ditt CV" },
  { id: "misstag", label: "Vanliga misstag" },
  { id: "checklista", label: "Checklista innan du skickar" },
  { id: "fragor", label: "Vanliga frågor" },
]

const faqItems = [
  {
    question: "Ska man skriva ålder eller personnummer i CV:t?",
    answer:
      "Nej, det behövs inte. Arbetsgivaren får inte välja bort dig på grund av ålder, och personnumret behövs först när du blir anställd. Skriv aldrig ditt personnummer i ett CV som du skickar till flera arbetsgivare.",
  },
  {
    question: "Ska man ha med referenser i CV:t?",
    answer:
      "Du kan antingen skriva ut en eller två referenser med namn, roll och telefonnummer, eller skriva ”Referenser lämnas på begäran”. Fråga alltid dina referenser om lov innan du anger dem.",
  },
  {
    question: "Ska jag skriva i jag-form?",
    answer:
      "Båda fungerar. Många skriver profiltexten utan ”jag” (”Driven ekonom med fem års erfarenhet …”) för att hålla den kort, men det viktiga är att du är konsekvent genom hela CV:t.",
  },
  {
    question: "Vad ska man inte skriva i ett CV?",
    answer:
      "Hoppa över personnummer, civilstånd, religion, lön och skälet till att du slutade på tidigare jobb. Undvik också klyschor som ”social och flexibel” utan exempel som visar att det stämmer.",
  },
  {
    question: "Kan jag skriva mitt CV i mobilen?",
    answer:
      "Ja. I CVfixarens CV-byggare kan du skriva, förhandsgranska och byta mall direkt i mobilen, och ladda ner ditt CV som PDF när det är klart.",
  },
  {
    question: "Hur ofta ska jag uppdatera mitt CV?",
    answer:
      "Uppdatera grunden när du byter jobb, går en utbildning eller får nya ansvarsområden. Anpassa sedan profiltexten och vilka erfarenheter du lyfter fram inför varje ansökan.",
  },
]

const linkClass = "font-semibold text-ink underline decoration-brand/60 underline-offset-4 hover:text-brand-700"

function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-20 pt-8 text-[1.7rem] font-bold leading-tight tracking-tight text-ink sm:text-3xl">
      {children}
    </h2>
  )
}

function Example({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="rounded-xl border-l-4 border-brand bg-brand-50/60 px-5 py-4">
      <figcaption className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-800">{label}</figcaption>
      <blockquote className="mt-2 leading-relaxed text-ink-700">{children}</blockquote>
    </figure>
  )
}

function TocList() {
  return (
    <ol className="space-y-0.5 text-sm">
      {toc.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className="block rounded-md px-2 py-1.5 text-ink-500 hover:bg-ink-50 hover:text-ink">
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  )
}

function BuilderCta() {
  return (
    <aside className="!mt-10 flex flex-col gap-5 overflow-hidden rounded-2xl bg-ink p-6 text-white sm:flex-row sm:items-center sm:p-8">
      <div className="flex-1">
        <p className="text-lg font-bold">Slipp krånglet med formateringen</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-200">
          Fyll i dina uppgifter i vår CV-byggare så får du ett färdigt, ATS-anpassat CV med rubriker och layout på plats.
        </p>
      </div>
      <Button asChild size="lg" className="btn-sweep-glow shrink-0">
        <Link href="/profil/skapa-cv">
          <span className="inline-flex items-center gap-2">
            Skapa ditt CV <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </Button>
    </aside>
  )
}

export default function SkrivaCvPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Script
        id="skriva-cv-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Skriva CV – så skriver du ett bra CV steg för steg",
            description:
              "Vad ett CV ska innehålla, hur du skriver profiltext och erfarenhet, vanliga misstag och en checklista innan du skickar.",
            mainEntityOfPage: PAGE_URL,
            datePublished: PUBLISHED,
            dateModified: UPDATED,
            inLanguage: "sv-SE",
            image: "https://www.cvfixaren.se/images/templates/cv-mall-standard.png",
            author: { "@type": "Organization", name: "CVfixaren", url: "https://www.cvfixaren.se" },
            publisher: {
              "@type": "Organization",
              name: "CVfixaren",
              url: "https://www.cvfixaren.se",
            },
          }),
        }}
      />
      <Script
        id="skriva-cv-faq-schema"
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
        {/* ── Title ─────────────────────────────────────────────── */}
        <header className="border-b border-ink-100 bg-ink-50/60">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-14">
            <Breadcrumbs items={[{ label: "Skriva CV", href: "/skriva-cv" }]} />
            <div className="mt-10 max-w-3xl">
              <p className="text-sm font-semibold text-brand-700">Guide</p>
              <h1 className="mt-3 text-[2.3rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink sm:text-5xl">
                Skriva CV – så skriver du ett bra CV steg för steg
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-500">
                Allt du behöver för att skriva ett CV som leder till intervju: vad det ska innehålla, hur du formulerar
                dig, exempel du kan utgå från och en checklista innan du skickar.
              </p>
              <p className="mt-6 text-sm text-ink-400">
                Av CVfixarens redaktion · Uppdaterad{" "}
                <time dateTime={UPDATED}>
                  {new Date(UPDATED).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
                </time>{" "}
                · 9 min läsning
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-16">
          {/* ── Sidebar: contents + CTA ────────────────────────────── */}
          <aside className="lg:order-2 lg:col-span-4">
            <div className="no-scrollbar lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
              <details className="group rounded-2xl bg-white ring-1 ring-ink-100 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  Innehåll
                  <ChevronDown aria-hidden className="h-4 w-4 text-ink-400 transition-transform group-open:rotate-180" />
                </summary>
                <nav aria-label="Innehåll" className="border-t border-ink-100 px-3 py-3">
                  <TocList />
                </nav>
              </details>
              <nav aria-label="Innehåll" className="hidden rounded-2xl bg-white p-3 ring-1 ring-ink-100 lg:block">
                <p className="px-2 pb-2 pt-1 text-sm font-semibold text-ink">Innehåll</p>
                <TocList />
              </nav>

              <div className="mt-6 hidden overflow-hidden rounded-2xl bg-ink-50 ring-1 ring-ink-100 lg:block">
                <div className="h-44 overflow-hidden px-8 pt-6">
                  <div className="relative aspect-[794/1123] overflow-hidden rounded-t-md bg-white shadow-page">
                    <Image
                      src="/images/templates/cv-mall-nordisk.png"
                      alt="Exempel på ett färdigt CV i CV-mallen Nordisk"
                      fill
                      sizes="300px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <div className="border-t border-ink-100 bg-white p-5">
                  <p className="font-semibold text-ink">Skriv ditt CV direkt i en mall</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">15 ATS-anpassade CV-mallar. Ladda ner som PDF.</p>
                  <Button asChild className="mt-4 w-full">
                    <Link href="/profil/skapa-cv">Skapa CV</Link>
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Article ──────────────────────────────────────────── */}
          <article className="min-w-0 lg:order-1 lg:col-span-8">
            <div className="max-w-[68ch] space-y-5 text-[17px] leading-[1.75] text-ink-600 [&_h3]:text-ink [&_li]:pl-1 [&_strong]:text-ink">
              {/* Short answer */}
              <div className="rounded-2xl bg-white p-6 ring-1 ring-ink-100">
                <p className="text-sm font-semibold text-brand-700">Kort svar</p>
                <p className="mt-2 text-ink-700">
                  Ett bra CV är en till två sidor långt, anpassat efter jobbet du söker och skrivet med den senaste
                  erfarenheten först. Det innehåller kontaktuppgifter, en kort profiltext, arbetslivserfarenhet,
                  utbildning och kompetenser – och beskriver vad du har <em>åstadkommit</em>, inte bara vad du har
                  haft för arbetsuppgifter.
                </p>
              </div>

              <SectionHeading id="vad-ar-ett-cv">Vad är ett CV?</SectionHeading>
              <p>
                CV står för <em>curriculum vitae</em>, latin för ”levnadslopp”. Det är en kort sammanfattning av din
                utbildning, dina erfarenheter och dina kompetenser som du skickar när du söker jobb. Målet med ett CV är
                inte att få jobbet direkt, utan att bli kallad till intervju.
              </p>
              <p>
                CV:t och det personliga brevet kompletterar varandra. CV:t visar <strong>vad</strong> du har gjort, i
                punktform och i tidsordning. Det{" "}
                <Link href="/blogg/personligt-brev-guide" className={linkClass}>
                  personliga brevet
                </Link>{" "}
                förklarar <strong>varför</strong> du söker just det här jobbet och hur din bakgrund passar.
              </p>
              <p>
                Rekryterare läser snabbt. I en ofta citerad studie från jobbsajten Ladders (2018) ägnade rekryterare i
                snitt drygt sju sekunder åt en första genomläsning av ett CV. Därför är struktur lika viktig som innehåll.
              </p>

              <SectionHeading id="vad-ska-ett-cv-innehalla">Vad ska ett CV innehålla?</SectionHeading>
              <p>Ett svenskt CV brukar ha de här delarna, i ungefär den här ordningen:</p>
              <h3 className="pt-2 text-xl font-semibold">Kontaktuppgifter</h3>
              <p>
                Namn, telefonnummer, e-postadress och ort. Lägg gärna till en länk till din LinkedIn-profil. Använd en
                neutral e-postadress, gärna med ditt namn. Gatuadress och personnummer behövs inte.
              </p>
              <h3 className="pt-2 text-xl font-semibold">Profiltext</h3>
              <p>
                Tre till fem meningar högst upp som sammanfattar vem du är yrkesmässigt, vad du är bra på och vad du
                söker. Det är det första rekryteraren läser, så skriv om den för varje ansökan.{" "}
                <a href="#profiltext-exempel" className={linkClass}>Se exempel längre ner.</a>
              </p>
              <h3 className="pt-2 text-xl font-semibold">Arbetslivserfarenhet</h3>
              <p>
                Lista dina jobb i omvänd kronologisk ordning, alltså det senaste först. Ange titel, arbetsgivare, ort och
                period, följt av två till fyra punkter om vad du gjorde och vad det ledde till.
              </p>
              <h3 className="pt-2 text-xl font-semibold">Utbildning</h3>
              <p>
                Högsta eller mest relevanta utbildningen först, med skola, program och år. Har du en högskoleexamen behöver
                du sällan ta med grundskolan.
              </p>
              <h3 className="pt-2 text-xl font-semibold">Kompetenser och språk</h3>
              <p>
                Konkreta färdigheter som är relevanta för tjänsten – system, verktyg, certifikat – och vilka språk du talar
                och på vilken nivå. Körkort är värt att nämna om jobbet kräver resor.
              </p>
              <h3 className="pt-2 text-xl font-semibold">Övrigt och referenser</h3>
              <p>
                Kurser, ideellt engagemang och förtroendeuppdrag kan visa sådant som jobben inte gör. Referenser kan du ange
                med namn och kontaktuppgifter, eller skriva att de lämnas på begäran.
              </p>

              <SectionHeading id="steg-for-steg">Så skriver du ett CV steg för steg</SectionHeading>
              <ol className="list-none space-y-7 pl-0">
                {[
                  {
                    title: "Läs jobbannonsen och plocka ut nyckelorden",
                    body: (
                      <>
                        Stryk under de krav, verktyg och egenskaper som annonsen nämner. Använd sedan samma ord i ditt CV där
                        det stämmer. Det hjälper både rekryteraren och de rekryteringssystem som sorterar ansökningar.
                      </>
                    ),
                  },
                  {
                    title: "Välj en tydlig CV-mall",
                    body: (
                      <>
                        En bra mall gör att du kan fokusera på innehållet. Välj en klassisk mall för traditionella branscher
                        och en lite modernare i kreativa yrken. Se{" "}
                        <Link href="/cv-mallar" className={linkClass}>
                          alla våra CV-mallar
                        </Link>
                        .
                      </>
                    ),
                  },
                  {
                    title: "Skriv kontaktuppgifterna rätt",
                    body: <>Dubbelkolla telefonnummer och e-post. Ett stavfel här kan göra att arbetsgivaren inte når dig alls.</>,
                  },
                  {
                    title: "Skriv en profiltext som matchar tjänsten",
                    body: (
                      <>
                        Börja med din yrkesroll eller din bakgrund, nämn två eller tre styrkor som annonsen efterfrågar och
                        avsluta med vad du vill bidra med. Håll den under 60 ord.
                      </>
                    ),
                  },
                  {
                    title: "Beskriv erfarenhet med resultat",
                    body: (
                      <>
                        Skriv vad du åstadkom, inte bara vad du ansvarade för. Siffror gör det konkret: hur många, hur mycket,
                        hur ofta.
                      </>
                    ),
                  },
                  {
                    title: "Lägg till utbildning och kompetenser",
                    body: (
                      <>
                        Ta med det som är relevant för jobbet. Ett kortare CV med rätt saker slår ett långt med allt du någonsin
                        gjort.
                      </>
                    ),
                  },
                  {
                    title: "Korrekturläs och spara som PDF",
                    body: (
                      <>
                        Läs högt, låt någon annan läsa och spara som PDF med ett tydligt filnamn, till exempel
                        <em> CV-Anna-Lindqvist.pdf</em>. PDF ser likadan ut för alla som öppnar den.
                      </>
                    ),
                  },
                ].map((step, i) => (
                  <li key={step.title} className="flex gap-4 pl-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white tabular">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold leading-snug">{step.title}</h3>
                      <p className="mt-1.5">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="pt-2">Så här kan skillnaden mellan arbetsuppgift och resultat se ut:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-5 ring-1 ring-ink-100">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
                    <X className="h-4 w-4" /> Svagare
                  </p>
                  <p className="mt-2 text-ink-700">Ansvarade för kundtjänst och hanterade ärenden via telefon och mejl.</p>
                </div>
                <div className="rounded-xl bg-white p-5 ring-1 ring-brand-200">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                    <Check className="h-4 w-4" /> Starkare
                  </p>
                  <p className="mt-2 text-ink-700">
                    Hanterade 40–50 kundärenden per dag och kortade svarstiden i mejl från två dagar till en.
                  </p>
                </div>
              </div>

              <BuilderCta />

              <SectionHeading id="profiltext-exempel">Exempel på profiltext i ett CV</SectionHeading>
              <p>
                Profiltexten är den del av CV:t som är svårast att skriva. Här är tre exempel för olika lägen som du kan
                anpassa efter dig själv.
              </p>
              <div className="space-y-4">
                <Example label="Med erfarenhet">
                  Ekonom med sex års erfarenhet av redovisning och bokslut i medelstora bolag. Van att ta helhetsansvar för
                  månadsbokslut och att förbättra rutiner – senast genom att halvera tiden för leverantörsreskontran.
                  Söker en roll där jag får kombinera noggrannhet med förbättringsarbete.
                </Example>
                <Example label="Nyexaminerad">
                  Nyexaminerad sjuksköterska från Karolinska Institutet med VFU inom akutsjukvård och geriatrik. Lugn under
                  press, strukturerad och trygg i mötet med patienter och anhöriga. Vill utvecklas inom akutsjukvården.
                </Example>
                <Example label="Utan arbetslivserfarenhet">
                  Gymnasieelev på ekonomiprogrammet som är van att ta ansvar, både som lagkapten i fotboll och som
                  ideell ledare på sommarläger. Snabb på att lära mig nya saker och trivs med att ha kontakt med människor.
                  Söker sommarjobb inom handel eller service.
                </Example>
              </div>

              <SectionHeading id="hur-langt">Hur långt ska ett CV vara?</SectionHeading>
              <p>
                En till två A4-sidor räcker för nästan alla. Har du lite erfarenhet räcker en sida; har du många år i
                arbetslivet får du ta två. Det är också vad{" "}
                <a
                  href="https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-cv"
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Arbetsförmedlingen rekommenderar
                </a>
                . Blir det längre är det oftast för att äldre eller mindre relevanta jobb får för mycket plats – korta ner
                dem till en rad var.
              </p>

              <SectionHeading id="bild">Ska man ha bild i CV:t?</SectionHeading>
              <p>
                Det är inget krav i Sverige. En bild kan avslöja sådant som arbetsgivaren inte får ta hänsyn till, som
                ålder, kön eller etnisk tillhörighet, och därför väljer en del att låta bli. Många har ändå med en bild,
                särskilt i yrken med mycket kundkontakt.
              </p>
              <p>Om du har med en bild:</p>
              <ul className="list-disc space-y-1.5 pl-5 marker:text-brand-700">
                <li>Använd ett nytaget porträtt med neutral bakgrund och bra ljus.</li>
                <li>Välj en bild där du ser ut som du gör på jobbet – ingen semesterbild.</li>
                <li>Placera den diskret i sidhuvudet, inte så att den tar fokus från innehållet.</li>
              </ul>

              <SectionHeading id="utan-erfarenhet">Skriva CV utan erfarenhet</SectionHeading>
              <p>
                Ska du skriva ditt första CV, till exempel för ett sommarjobb, är tricket att visa vad du har gjort i
                stället för vad du saknar. Det mesta räknas, så länge det visar att du kan ta ansvar.
              </p>
              <ul className="list-disc space-y-1.5 pl-5 marker:text-brand-700">
                <li>
                  <strong>Skola:</strong> program, inriktning och projekt eller gymnasiearbete som är relevanta.
                </li>
                <li>
                  <strong>Extrajobb och praktik:</strong> barnvakt, tidningsutdelning, prao och feriejobb visar att du är
                  pålitlig.
                </li>
                <li>
                  <strong>Föreningsliv:</strong> tränare, lagkapten eller ideell ledare visar ansvar och samarbete.
                </li>
                <li>
                  <strong>Egenskaper med exempel:</strong> skriv inte bara ”ansvarstagande” – berätta när du visade det.
                </li>
              </ul>
              <p>
                Se våra{" "}
                <Link href="/cv-exempel/gymnasieelev" className={linkClass}>
                  CV-exempel för gymnasieelever
                </Link>{" "}
                och{" "}
                <Link href="/cv-exempel/student" className={linkClass}>
                  studenter
                </Link>{" "}
                för färdiga formuleringar.
              </p>

              <SectionHeading id="ats">Så läser rekryteringssystem ditt CV</SectionHeading>
              <p>
                Många arbetsgivare tar emot ansökningar i ett rekryteringssystem, ofta kallat ATS (applicant tracking
                system). Systemet läser in ditt CV och gör det sökbart för rekryteraren. Det fungerar bäst när CV:t är
                enkelt för en dator att tolka:
              </p>
              <ul className="list-disc space-y-1.5 pl-5 marker:text-brand-700">
                <li>Använd vanliga rubriker som ”Arbetslivserfarenhet” och ”Utbildning”.</li>
                <li>Skriv text som text – lägg inte viktig information i bilder eller ikoner.</li>
                <li>Välj en enspaltig layout om du är osäker.</li>
                <li>Använd orden från jobbannonsen där de stämmer in på dig.</li>
              </ul>
              <p>
                Alla våra{" "}
                <Link href="/ats-anpassade-cv-mallar" className={linkClass}>
                  ATS-anpassade CV-mallar
                </Link>{" "}
                följer de här principerna.
              </p>

              <SectionHeading id="misstag">Vanliga misstag när du skriver CV</SectionHeading>
              <ul className="space-y-3 pl-0">
                {[
                  ["Samma CV till alla jobb", "Anpassa åtminstone profiltexten och vilka erfarenheter du lyfter fram."],
                  ["Arbetsuppgifter i stället för resultat", "Visa vad som blev bättre tack vare dig."],
                  ["För långt", "Allt behöver inte vara med. Prioritera det som är relevant för tjänsten."],
                  ["Stavfel", "Ett enda stavfel kan räcka för att du sorteras bort. Låt någon annan korrekturläsa."],
                  ["Luckor utan förklaring", "Har du varit föräldraledig, studerat eller rest – skriv det kort."],
                ].map(([title, text]) => (
                  <li key={title} className="flex gap-3">
                    <X className="mt-1.5 h-4 w-4 shrink-0 text-red-600" />
                    <span>
                      <strong>{title}.</strong> {text}
                    </span>
                  </li>
                ))}
              </ul>
              <p>
                Läs mer i{" "}
                <Link href="/blogg/5-vanliga-misstag-att-undvika" className={linkClass}>
                  5 vanliga misstag att undvika i ditt CV
                </Link>
                .
              </p>

              <SectionHeading id="checklista">Checklista innan du skickar ditt CV</SectionHeading>
              <ul className="space-y-2.5 rounded-2xl bg-white p-6 ring-1 ring-ink-100">
                {[
                  "Kontaktuppgifterna stämmer och telefonnumret går att ringa.",
                  "Profiltexten är anpassad efter just den här tjänsten.",
                  "Den senaste erfarenheten står först.",
                  "Varje jobb har minst ett konkret resultat.",
                  "CV:t är max två sidor.",
                  "Någon annan har korrekturläst.",
                  "Filen är en PDF med ditt namn i filnamnet.",
                  "Du skickar före sista ansökningsdag.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
                      <Check className="h-3 w-3 text-brand-700" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <SectionHeading id="fragor">Vanliga frågor om att skriva CV</SectionHeading>
            </div>
            <div className="mt-6 max-w-[68ch]">
              <FAQ items={faqItems} />
            </div>

            <div className="mt-14 max-w-[68ch] rounded-2xl bg-ink-50 p-8 text-center ring-1 ring-inset ring-ink-100">
              <h2 className="text-2xl font-bold text-ink">Redo att skriva ditt CV?</h2>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-500">
                Välj en mall, fyll i dina uppgifter och se ditt CV ta form medan du skriver.
              </p>
              <Button asChild size="lg" className="btn-sweep-glow mt-6 h-14 px-8 text-base">
                <Link href="/profil/skapa-cv">
                  <span>Skapa ditt CV nu</span>
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
