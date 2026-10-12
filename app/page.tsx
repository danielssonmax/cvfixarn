import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import Image from "next/image"
import { FAQ } from "@/components/faq"
import { Section } from "@/components/section"
import { CVTemplateCard } from "@/components/cv-template-card"
import Script from "next/script"
import { FileText, Layout, Shield, Zap, Download, CheckCircle, Star, BarChart3, Sparkles, Target, Clock, ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Skapa CV gratis online – 15 proffsiga CV-mallar | CVfixaren",
  description: "Skapa ett professionellt, ATS-anpassat CV på några minuter med vår CV-byggare. Välj bland 15 CV-mallar, fyll i dina uppgifter och ladda ner som PDF.",
  alternates: {
    canonical: "https://www.cvfixaren.se",
  },
  openGraph: {
    title: "Skapa ett gratis CV – Var en av de 2% som går vidare | CVfixaren",
    description: "Skapa ett professionellt, ATS-anpassat CV på några minuter med vår CV-byggare. Välj bland 15 CV-mallar, fyll i dina uppgifter och ladda ner som PDF.",
    url: "https://www.cvfixaren.se",
    type: "website",
  },
}

const faqItems = [
  {
    question: "Hur skapar jag ett CV?",
    answer: "Välj en CV-mall, fyll i dina uppgifter i vår CV-byggare och se ditt CV växa fram i förhandsgranskningen medan du skriver. Du kan byta mall, typsnitt och färg när som helst utan att börja om. När du är nöjd laddar du ner ditt CV som PDF."
  },
  {
    question: "Är det gratis att skapa ett CV hos CVfixaren?",
    answer: "Det är gratis att skapa och redigera ditt CV, och du behöver inget konto för att komma igång. När du vill ladda ner ditt CV som PDF startar du en provperiod: 0 kr i 7 dagar, därefter 69 kr/vecka utan bindningstid. Du kan avsluta när du vill."
  },
  {
    question: "Kan jag göra mitt CV i mobilen?",
    answer: "Ja. CV-verktyget fungerar i mobilen, på surfplattan och på datorn. I mobilen kan du förhandsgranska ditt CV och byta mall, typsnitt och färg medan du ser resultatet direkt."
  },
  {
    question: "Kan jag utgå från mitt gamla CV?",
    answer: "Ja. Ladda upp ditt befintliga CV som PDF eller Word så fyller vi i fälten åt dig. Sedan kan du uppdatera innehållet och välja en ny CV-mall."
  },
  {
    question: "Är CV-mallarna ATS-anpassade?",
    answer: "Ja. Alla våra CV-mallar använder riktig, sökbar text och tydliga rubriker, så att de rekryteringssystem (ATS) som många arbetsgivare använder kan läsa ditt CV korrekt."
  },
  {
    question: "Hur långt bör mitt CV vara?",
    answer: "Ett CV bör vanligtvis vara 1-2 sidor långt. För nyutexaminerade eller de med mindre erfarenhet räcker ofta en sida, medan mer erfarna kandidater kan behöva två sidor för att presentera all relevant information."
  },
  {
    question: "Ska jag inkludera ett foto på mitt CV?",
    answer: "I Sverige är det inte standard att inkludera ett foto på CV:t. Det är oftast bättre att fokusera på dina kvalifikationer och erfarenheter. Om en arbetsgivare specifikt ber om ett foto kan du inkludera det."
  },
  {
    question: "I vilken ordning ska jag lista min arbetslivserfarenhet?",
    answer: "Det är vanligast att lista arbetslivserfarenhet i omvänd kronologisk ordning, med den senaste erfarenheten först. Detta ger arbetsgivaren en tydlig bild av din senaste och mest relevanta erfarenhet."
  },
  {
    question: "Hur anpassar jag mitt CV för olika jobb?",
    answer: "Anpassa ditt CV genom att lyfta fram de färdigheter och erfarenheter som är mest relevanta för den specifika tjänsten. Läs jobbannonsen noga och använd liknande nyckelord i ditt CV för att visa hur du matchar kraven."
  },
  {
    question: "Bör jag inkludera referenser i mitt CV?",
    answer: "Det är inte nödvändigt att inkludera referenser direkt i CV:t. Istället kan du skriva 'Referenser lämnas på begäran' i slutet av ditt CV. Ha dock en separat lista med referenser redo om arbetsgivaren ber om den."
  }
]

const cvTemplates = [
  {
    id: "default",
    name: "Standard",
    imageSrc: "/images/templates/cv-mall-standard.png",
    alt: "Standard CV-mall med professionell layout"
  },
  {
    id: "minimalist",
    name: "Minimalistisk",
    imageSrc: "/images/templates/cv-mall-minimalistisk.png",
    alt: "Minimalistisk CV-mall med centrerad design"
  },
  {
    id: "modern",
    name: "Modern",
    imageSrc: "/images/templates/cv-mall-modern.png",
    alt: "Modern CV-mall med sidopanel"
  }
]

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
    description: "Tips och tricks för att skapa ett CV som får rekryterare att höja på ögonbrynen.",
    date: "2024-02-14",
    slug: "sa-skriver-du-ett-cv-som-sticker-ut",
    category: "CV-tips",
  },
  {
    title: "5 vanliga misstag att undvika i ditt CV",
    description: "Lär dig vilka misstag som kan kosta dig drömjobbet och hur du undviker dem.",
    date: "2024-02-10",
    slug: "5-vanliga-misstag-att-undvika",
    category: "CV-tips",
  },
  {
    title: "Personligt brev - En komplett guide",
    description: "Allt du behöver veta för att skriva ett övertygande personligt brev.",
    date: "2024-02-05",
    slug: "personligt-brev-guide",
    category: "Personligt brev",
  },
  {
    title: "LinkedIn-profil som kompletterar ditt CV",
    description: "Maximera dina chanser att bli upptäckt av rekryterare genom att optimera din LinkedIn-profil.",
    date: "2024-02-03",
    slug: "linkedin-profil-optimering",
    category: "Karriärtips",
  },
  {
    title: "Arbetsintervju: Vanliga frågor och bästa svaren",
    description: "Förbered dig för din nästa arbetsintervju med våra expertråd.",
    date: "2024-01-28",
    slug: "arbetsintervju-fragor-och-svar",
    category: "Intervjutips",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CVfixaren.se",
            "url": "https://www.cvfixaren.se",
            "logo": "https://www.cvfixaren.se/images/cv-hero-section.png",
            "description": "CVfixaren.se hjälper dig att skapa ett professionellt och ATS-anpassat CV gratis. Välj bland professionella mallar, fyll i din information och ladda ner som PDF.",
            "foundingDate": "2024",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "url": "https://www.cvfixaren.se/kontakt",
              "availableLanguage": "Swedish"
            }
          })
        }}
      />
      <Script
        id="software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "CVfixaren",
            "url": "https://www.cvfixaren.se",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "SEK"
            },
            "description": "Gratis CV-byggare med professionella, ATS-optimerade mallar. Skapa och ladda ner ditt CV som PDF på minuter."
          })
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          })
        }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Så skapar du ett CV med CVfixaren",
            "description": "Skapa ditt CV online i fyra enkla steg – klart på bara några minuter.",
            "step": [
              {
                "@type": "HowToStep",
                "position": 1,
                "name": "Välj en CV-mall",
                "text": "Bläddra bland våra professionella CV-mallar och välj den som passar dig och branschen du söker jobb i."
              },
              {
                "@type": "HowToStep",
                "position": 2,
                "name": "Fyll i dina uppgifter",
                "text": "Lägg till personuppgifter, arbetslivserfarenhet, utbildning och färdigheter – eller ladda upp ditt gamla CV så fyller vi i fälten åt dig."
              },
              {
                "@type": "HowToStep",
                "position": 3,
                "name": "Anpassa designen",
                "text": "Justera färger, typsnitt och layout för att göra ditt CV unikt."
              },
              {
                "@type": "HowToStep",
                "position": 4,
                "name": "Ladda ner som PDF",
                "text": "Ladda ner ditt färdiga CV som PDF och börja söka jobb direkt."
              }
            ]
          })
        }}
      />
      <Header />
      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_40%,black,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 top-10 h-[560px] w-[560px] rounded-full bg-brand/10 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="text-center lg:col-span-6 lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-3 py-1 text-xs font-medium text-ink-600 shadow-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Svensk CV-byggare · ATS-anpassade mallar
              </p>
              <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[1.06] tracking-[-0.035em] text-ink sm:text-5xl lg:text-[3.6rem]">
                Skapa ett gratis CV -{" "}
                <span className="text-ink-600">
                  Var en av de{" "}
                  <span className="relative whitespace-nowrap text-brand-700">
                    2%
                    <svg
                      aria-hidden
                      viewBox="0 0 120 12"
                      preserveAspectRatio="none"
                      className="absolute -bottom-1.5 left-0 h-2.5 w-full text-brand"
                    >
                      <path d="M2 9C30 3 85 2 118 7" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </span>{" "}
                  som går vidare
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-500 lg:mx-0">
                Med vår CV-byggare skapar du ett professionellt CV online på några minuter. Välj bland 15
                expertgranskade CV-mallar, fyll i dina uppgifter och ladda ner ditt CV som PDF. Börja gratis idag!
              </p>
              <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="btn-sweep-glow h-14 w-full px-8 text-base shadow-[0_1px_2px_rgb(0_80_40/0.2),0_10px_24px_-8px_rgb(0_191_99/0.6)] sm:w-auto"
                >
                  <Link href="/profil/skapa-cv">
                    <span className="inline-flex items-center gap-2">
                      Skapa ditt CV nu <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
                <Link href="/cv-mallar" className="link-underline py-2 text-sm font-semibold text-ink-700 hover:text-ink">
                  Se alla CV-mallar
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-500 lg:justify-start">
                {["ATS-optimerat", "PDF-export", "Klart på minuter"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-brand-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Template stack */}
            <div className="relative mx-auto h-[310px] w-full max-w-[520px] sm:h-[460px] lg:col-span-6 lg:h-[540px] lg:max-w-none">
              <div className="absolute left-[4%] top-[12%] w-[44%] -rotate-[7deg] overflow-hidden rounded-md bg-white shadow-lift ring-1 ring-ink-100 sm:left-[8%]">
                <div className="relative aspect-[794/1123]">
                  <Image src="/images/templates/cv-mall-modern.png" alt="Modern CV-mall med sidopanel" fill className="object-cover" sizes="240px" />
                </div>
              </div>
              <div className="absolute right-[4%] top-[8%] w-[44%] rotate-[6deg] overflow-hidden rounded-md bg-white shadow-lift ring-1 ring-ink-100 sm:right-[8%]">
                <div className="relative aspect-[794/1123]">
                  <Image src="/images/templates/cv-mall-nordisk.png" alt="Nordisk CV-mall" fill className="object-cover" sizes="240px" />
                </div>
              </div>
              <div className="absolute left-1/2 top-0 w-[54%] -translate-x-1/2 overflow-hidden rounded-md bg-white shadow-float ring-1 ring-ink-100">
                <div className="relative aspect-[794/1123]">
                  <Image
                    src="/images/templates/cv-mall-standard.png"
                    alt="CV skapat med CVfixarens Standard-mall"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 60vw, 300px"
                    priority
                  />
                </div>
              </div>

              {/* Floating product chips */}
              <div className="absolute bottom-[2%] left-0 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lift ring-1 ring-ink-100 sm:bottom-[14%] sm:left-[2%]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                  <Target className="h-[18px] w-[18px] text-brand-700" />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-ink">ATS-anpassad</span>
                  <span className="block text-xs text-ink-500">Läses rätt av rekryteringssystem</span>
                </span>
              </div>
              <div className="absolute bottom-[30%] right-0 hidden items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lift ring-1 ring-ink-100 sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50">
                  <Download className="h-[18px] w-[18px] text-ink" />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-ink">PDF med ett klick</span>
                  <span className="block text-xs text-ink-500">Redo att skicka</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────── */}
        <section className="border-y border-ink-100 bg-white">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
              { value: "10 000+", label: "CV:n skapade" },
              { value: "15", label: "Professionella mallar" },
              { value: "98%", label: "Nöjda användare" },
              { value: "PDF", label: "Exportformat" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col-reverse py-8 text-center md:py-10 ${i % 2 === 1 ? "border-l border-ink-100" : ""} ${i === 2 ? "md:border-l" : ""} ${i >= 2 ? "border-t border-ink-100 md:border-t-0" : ""}`}
              >
                <dt className="mt-1 text-sm text-ink-500">{stat.label}</dt>
                <dd className="text-3xl font-extrabold tracking-tight text-ink tabular md:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Why CVfixaren ────────────────────────────────────── */}
        <Section>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="text-sm font-semibold text-brand-700">Varför CVfixaren</p>
              <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">Varför välja CVfixaren som CV-byggare?</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-500">
                CVfixaren är en svensk CV-byggare: du fyller i dina uppgifter och vi sköter formateringen. Resultatet är ett professionellt, ATS-anpassat CV som imponerar på rekryterare.
              </p>
            </div>
            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-8">
              {[
                { icon: Layout, title: "Professionella CV-mallar", text: "Våra CV-mallar är designade av experter och testade av rekryterare för att hjälpa dig sticka ut från mängden." },
                { icon: Zap, title: "Enkelt att använda", text: "Vår CV-skapare guidar dig genom varje del, så att du kan göra ett imponerande CV på några minuter – även i mobilen." },
                { icon: Target, title: "ATS-anpassat CV", text: "Alla CV-mallar är byggda för att läsas rätt av de rekryteringssystem (ATS) som många arbetsgivare använder." },
                { icon: Download, title: "Ladda ner som PDF", text: "Ladda ner ditt färdiga CV som PDF med ett klick – redo att skicka till arbetsgivare direkt." },
                { icon: Shield, title: "Säker hantering", text: "Dina uppgifter hanteras säkert och skyddas. Vi tar din integritet på allvar." },
                { icon: Sparkles, title: "Anpassa designen", text: "Välj typsnitt, färger och layout för att göra ditt CV personligt och unikt." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="border-t border-ink-100 pt-6">
                  <Icon className="h-6 w-6 text-brand-700" strokeWidth={1.75} />
                  <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── How it works ─────────────────────────────────────── */}
        <Section background="gray">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-3xl font-bold text-ink md:text-4xl">Så skapar du ett CV i fyra steg</h2>
            <p className="max-w-md text-lg leading-relaxed text-ink-500">
              Skapa ditt CV online i fyra enkla steg – klart på bara några minuter.
            </p>
          </div>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Välj en CV-mall", text: "Bläddra bland våra professionella CV-mallar och välj den som passar dig och branschen du söker jobb i." },
              { title: "Fyll i dina uppgifter", text: "Lägg till personuppgifter, arbetslivserfarenhet, utbildning och färdigheter – eller ladda upp ditt gamla CV så fyller vi i fälten åt dig." },
              { title: "Anpassa designen", text: "Justera färger, typsnitt och layout för att göra ditt CV unikt." },
              { title: "Ladda ner som PDF", text: "Ladda ner ditt färdiga CV som PDF och börja söka jobb direkt." },
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
        </Section>

        {/* ── Detailed features ────────────────────────────────── */}
        <Section>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <h2 className="text-3xl font-bold text-ink md:text-4xl">Allt du behöver för att göra ett proffsigt CV</h2>
                <p className="mt-4 text-lg leading-relaxed text-ink-500">
                  Vårt verktyg kombinerar enkelhet med kraftfulla funktioner för att ge dig det bästa resultatet.
                </p>
                <Button asChild size="lg" className="mt-8">
                  <Link href="/profil/skapa-cv">
                    <span className="inline-flex items-center gap-2">
                      Skapa ditt CV nu <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
            <div className="divide-y divide-ink-100 border-y border-ink-100 lg:col-span-7">
              {[
                { icon: BarChart3, title: "Optimerade för ATS-system", text: "Både format och layout har optimerats för de algoritmer som filtrerar CV:n. Se till att din ansökan blir läst av en riktig människa." },
                { icon: Clock, title: "Klart på minuter", text: "Sluta spendera timmar på formatering. Vårt verktyg skapar ett snyggt, professionellt CV åt dig på bara några minuter." },
                { icon: FileText, title: "Flexibla sektioner", text: "Lägg till arbetslivserfarenhet, utbildning, färdigheter, språk, certifikat, projekt och mycket mer. Ordna sektionerna precis som du vill." },
                { icon: Sparkles, title: "15 CV-mallar att välja mellan", text: "Välj mellan olika mallar, typsnitt, storlekar och färger. Gör ditt CV personligt utan att kompromissa med professionalismen." },
                { icon: Download, title: "PDF-export med ett klick", text: "Exportera ditt CV som en perfekt formaterad PDF. Redo att skickas direkt till arbetsgivare eller laddas upp på jobbsajter." },
                { icon: Shield, title: "Spara och redigera", text: "Ditt CV sparas automatiskt. Gå tillbaka och redigera det när som helst - perfekt när du vill anpassa det för olika tjänster." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-5 py-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                    <Icon className="h-5 w-5 text-brand-700" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{title}</h3>
                    <p className="mt-1.5 leading-relaxed text-ink-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Popular templates ────────────────────────────────── */}
        <Section background="gray">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-ink md:text-4xl">Våra populäraste CV-mallar</h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-500">
                Testade och godkända CV-mallar som hjälper dig att presentera din erfarenhet på bästa sätt. Välj en mall och skapa ditt CV direkt.
              </p>
            </div>
            <Link href="/cv-mallar" className="group hidden items-center gap-1.5 text-sm font-semibold text-ink hover:text-brand-700 md:inline-flex">
              Visa alla CV-mallar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {cvTemplates.map((template) => (
              <CVTemplateCard
                key={template.id}
                templateId={template.id}
                templateName={template.name}
                imageSrc={template.imageSrc}
                alt={template.alt}
              />
            ))}
          </div>
          <div className="mt-10 text-center md:hidden">
            <Button asChild variant="outline" size="lg">
              <Link href="/cv-mallar">Visa alla CV-mallar</Link>
            </Button>
          </div>
        </Section>

        {/* ── Testimonials ─────────────────────────────────────── */}
        <Section>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-ink md:text-4xl">Vad våra användare säger</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-500">
              Tusentals jobbsökare har redan skapat sina CV:n med CVfixaren.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { quote: "Snabbt, tydligt och professionellt. Behövde skriva ihop ett snyggt CV snabbt, den här lösningen var precis vad jag behövde!", name: "Tina V.", role: "Projektledare" },
              { quote: "Användarvänligt och enkelt att följa. Jag hade mitt nya CV klart på under 15 minuter. Rekommenderas varmt!", name: "Niklas S.", role: "Ekonom" },
              { quote: "Bra mallar och smidigt verktyg. Det bästa är att CV:t blev ATS-anpassat direkt. Fick flera intervjuer inom första veckan!", name: "Sara K.", role: "Marknadsförare" },
            ].map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl bg-ink-50 p-7 ring-1 ring-inset ring-ink-100">
                <div className="flex gap-0.5" role="img" aria-label="5 av 5 stjärnor">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-[17px] leading-relaxed text-ink-700">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-ink shadow-soft">
                    {t.name.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{t.name}</span>
                    <span className="block text-xs text-ink-500">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        {/* ── Persuasive CTA ───────────────────────────────────── */}
        <section className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-ink px-6 py-16 sm:px-12 md:py-20 lg:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_60%_80%_at_80%_50%,black,transparent)]"
            />
            <div aria-hidden className="pointer-events-none absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand/25 blur-3xl" />
            <div className="relative grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h2 className="text-3xl font-bold text-white md:text-[2.6rem]">Skapa ett proffsigt CV som leder dig till drömjobbet</h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-200">
                  En bra ansökan leder till en bra intervju. Ett professionellt CV gör allt möjligt. Börja med att övertyga rekryteraren redan vid första anblicken.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="btn-sweep-glow h-14 px-8 text-base">
                    <Link href="/profil/skapa-cv">
                      <span>Skapa ditt CV nu</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-14 border-white/20 bg-transparent px-8 text-base text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
                  >
                    <Link href="/cv-mallar">Se våra CV-mallar</Link>
                  </Button>
                </div>
                <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-200">
                  {["ATS-optimerat", "PDF-export", "Professionella mallar", "Klart på minuter"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-brand" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div aria-hidden className="relative hidden h-full min-h-[300px] lg:col-span-5 lg:block">
                <div className="absolute -bottom-32 left-[6%] w-[52%] -rotate-6 overflow-hidden rounded-md shadow-float">
                  <div className="relative aspect-[794/1123]">
                    <Image src="/images/templates/cv-mall-executive.png" alt="" fill className="object-cover" sizes="240px" loading="lazy" />
                  </div>
                </div>
                <div className="absolute -bottom-20 right-[4%] w-[52%] rotate-3 overflow-hidden rounded-md shadow-float">
                  <div className="relative aspect-[794/1123]">
                    <Image src="/images/templates/cv-mall-timeline.png" alt="" fill className="object-cover" sizes="240px" loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Blog ─────────────────────────────────────────────── */}
        <Section>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-ink md:text-4xl">Från vår blogg</h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-500">
                Tips, guider och expertråd för att maximera dina chanser att landa drömjobbet.
              </p>
            </div>
            <Link href="/blogg" className="group hidden items-center gap-1.5 text-sm font-semibold text-ink hover:text-brand-700 md:inline-flex">
              Visa alla artiklar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(0, 6).map((post) => (
              <Link
                key={post.slug}
                href={`/blogg/${post.slug}`}
                className="group flex flex-col rounded-2xl bg-white p-6 ring-1 ring-ink-100 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:ring-ink-200"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-800">{post.category}</span>
                  <time dateTime={post.date} className="text-ink-400">
                    {new Date(post.date).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
                  </time>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-ink group-hover:text-brand-800">{post.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{post.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  Läs mer <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center md:hidden">
            <Button asChild variant="outline" size="lg">
              <Link href="/blogg">Visa alla artiklar</Link>
            </Button>
          </div>
        </Section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <Section background="gray">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 className="text-3xl font-bold text-ink md:text-4xl">Vanliga frågor om att skapa CV</h2>
              <p className="mt-4 leading-relaxed text-ink-500">
                Hittar du inte svaret?{" "}
                <Link href="/vanliga-fragor" className="font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                  Se alla frågor
                </Link>{" "}
                eller{" "}
                <Link href="/kontakt" className="font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                  kontakta oss
                </Link>
                .
              </p>
              <p className="mt-4 leading-relaxed text-ink-500">
                Behöver du inspiration? Se våra{" "}
                <Link href="/cv-exempel" className="font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                  CV-exempel för olika yrken
                </Link>{" "}
                eller läs vår guide om{" "}
                <Link href="/skriva-cv" className="font-semibold text-ink underline underline-offset-4 hover:text-brand-700">
                  hur du skriver ett bra CV
                </Link>
                .
              </p>
            </div>
            <div className="lg:col-span-8">
              <FAQ items={faqItems} />
            </div>
          </div>
        </Section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <Section>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-ink md:text-4xl">Redo att ta nästa steg i din karriär?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-500">
              Anslut dig till tusentals jobbsökare som redan skapat sitt professionella CV med CVfixaren.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-9 h-auto min-h-14 whitespace-normal px-8 py-4 text-base shadow-[0_1px_2px_rgb(0_80_40/0.2),0_10px_24px_-8px_rgb(0_191_99/0.6)]"
            >
              <Link href="/profil/skapa-cv">Skapa ditt CV nu - det är gratis att börja</Link>
            </Button>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
