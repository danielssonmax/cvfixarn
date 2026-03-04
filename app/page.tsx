import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { Poppins } from "next/font/google"
import { Header } from "@/components/header"
import Image from "next/image"
import { FAQ } from "@/components/faq"
import { Section } from "@/components/section"
import { CVTemplateCard } from "@/components/cv-template-card"
import Script from "next/script"
import { FileText, Layout, Shield, Zap, Download, CheckCircle, Star, Users, BarChart3, Sparkles, Target, Clock, ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CVfixaren - Skapa ett CV gratis",
  description: "Skapa ett professionellt och ATS-anpassat CV gratis med CVfixaren. Välj bland professionella mallar, fyll i din information och ladda ner ditt CV som PDF på bara några minuter.",
  alternates: {
    canonical: "https://www.cvfixaren.se",
  },
}

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
})

const faqItems = [
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
    id: "elegant",
    name: "Elegant",
    imageSrc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/elegant%20preview%20lila-4oQxxFwA3ufQe4fOQ41tZnZdnSPPmt.png",
    alt: "Elegant CV mall"
  },
  {
    id: "lyxig",
    name: "Lyxig",
    imageSrc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lyxig%20preview%20svart-QDhvZHVFvTYWMCJcPak5CTCCcfSRyK.png",
    alt: "Lyxig CV mall"
  },
  {
    id: "standard",
    name: "Standard",
    imageSrc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/standard%20preview-VSOYHTSzrlcj4bav3G6uSO8mLKamNL.png",
    alt: "Standard CV mall"
  }
]

const blogPosts = [
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
            "logo": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cvfixaren-ebeQXxOTCrb79kvOYjGEuecJeiitvr.png",
            "description": "CVfixaren.se hjälper dig att skriva ett optimalt CV som är anpassat för att ta sig förbi ATS systemen och landa dig drömjobbet. Våra CV-mallar är optimerade för att presentera dig professionellt utåt."
          })
        }}
      />
      <Header />
      <main className="flex-1">
        <section className="container px-4 py-16 md:py-24 pb-0">
          <div className="text-center space-y-4 mb-16">
            <h1 className={`${poppins.className} text-4xl font-bold tracking-tighter sm:text-4xl md:text-6xl`}>
              Bara 2% av alla CV:n går vidare. Var en av dem.
            </h1>
            <p className={`${poppins.className} text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto`}>
              Använd våra expertgranskade CV-mallar som följer arbetsgivarnas önskemål. Enkelt, snabbt och
              professionellt - skapa ditt CV på minuter. Börja gratis idag!
            </p>
            <Link href="/profil/skapa-cv">
              <Button size="lg" className="mt-8 bg-[#00bf63] hover:bg-[#00a857] text-white">
                Skapa ditt CV nu
              </Button>
            </Link>
          </div>
          <div className="relative w-full max-w-[1800px] mx-auto aspect-[4/1] mb-0 mt-16">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Namnl%C3%B6s%20%282000%20x%20500%20px%29-Yxqjp3R1HILswifDnCFBvutjvd2434.png"
              alt="CV mallar i olika stilar och färger"
              fill
              className="object-contain object-bottom"
              priority
            />
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-[#00bf63] py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold">10 000+</div>
                <div className="text-sm md:text-base opacity-90 mt-1">CV:n skapade</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">5+</div>
                <div className="text-sm md:text-base opacity-90 mt-1">Professionella mallar</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">98%</div>
                <div className="text-sm md:text-base opacity-90 mt-1">Nöjda användare</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">PDF</div>
                <div className="text-sm md:text-base opacity-90 mt-1">Exportformat</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why choose CVfixaren - enhanced with icons */}
        <Section background="gray">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Varför välja CVfixaren.se?</h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Vi har byggt ett verktyg som gör det enkelt att skapa professionella, ATS-optimerade CV:n som imponerar på rekryterare.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover-lift">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-5">
                <Layout className="h-6 w-6 text-[#00bf63]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Professionella mallar</h3>
              <p className="text-muted-foreground">Våra mallar är designade av experter och testade av rekryterare för att hjälpa dig sticka ut från mängden.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover-lift">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-5">
                <Zap className="h-6 w-6 text-[#00bf63]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Enkelt att använda</h3>
              <p className="text-muted-foreground">Vår användarvänliga plattform gör det enkelt att skapa ett imponerande CV på bara några minuter.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover-lift">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-5">
                <Target className="h-6 w-6 text-[#00bf63]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ATS-optimerat</h3>
              <p className="text-muted-foreground">Våra CV:n är optimerade för att passera Applicant Tracking Systems (ATS) som arbetsgivare använder.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover-lift">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-5">
                <Download className="h-6 w-6 text-[#00bf63]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Exportera till PDF</h3>
              <p className="text-muted-foreground">Ladda ner ditt färdiga CV i PDF-format med ett klick - redo att skicka till arbetsgivare direkt.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover-lift">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-5">
                <Shield className="h-6 w-6 text-[#00bf63]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Säker hantering</h3>
              <p className="text-muted-foreground">Dina uppgifter hanteras säkert och skyddas. Vi tar din integritet på allvar.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover-lift">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-5">
                <Sparkles className="h-6 w-6 text-[#00bf63]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Anpassa designen</h3>
              <p className="text-muted-foreground">Välj typsnitt, färger och layout för att göra ditt CV personligt och unikt.</p>
            </div>
          </div>
        </Section>

        {/* How it works - enhanced */}
        <Section>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Så här fungerar det</h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Skapa ditt professionella CV i fyra enkla steg - klart på bara några minuter.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="text-center relative">
                {step < 4 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#00bf63] to-[#00bf63]/20" />
                )}
                <div className="w-16 h-16 bg-[#00bf63] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 relative z-10 shadow-lg">
                  {step}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {step === 1 && "Välj en mall"}
                  {step === 2 && "Fyll i din information"}
                  {step === 3 && "Anpassa designen"}
                  {step === 4 && "Ladda ner och använd"}
                </h3>
                <p className="text-muted-foreground">
                  {step === 1 && "Bläddra igenom vårt urval av professionella mallar och välj den som passar dig bäst."}
                  {step === 2 && "Lägg till dina personuppgifter, arbetslivserfarenhet, utbildning och färdigheter."}
                  {step === 3 && "Justera färger, typsnitt och layout för att göra ditt CV unikt."}
                  {step === 4 && "Ladda ner ditt färdiga CV i PDF-format och börja söka jobb!"}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Detailed features - new section */}
        <Section background="gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Allt du behöver för ett proffsigt CV</h2>
            <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
              Vårt verktyg kombinerar enkelhet med kraftfulla funktioner för att ge dig det bästa resultatet.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#00bf63]/10 rounded-lg flex items-center justify-center mt-1">
                  <BarChart3 className="h-5 w-5 text-[#00bf63]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Optimerade för ATS-system</h3>
                  <p className="text-muted-foreground text-sm">Både format och layout har optimerats för de algoritmer som filtrerar CV:n. Se till att din ansökan blir läst av en riktig människa.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#00bf63]/10 rounded-lg flex items-center justify-center mt-1">
                  <Clock className="h-5 w-5 text-[#00bf63]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Klart på minuter</h3>
                  <p className="text-muted-foreground text-sm">Sluta spendera timmar på formatering. Vårt verktyg skapar ett snyggt, professionellt CV åt dig på bara några minuter.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#00bf63]/10 rounded-lg flex items-center justify-center mt-1">
                  <FileText className="h-5 w-5 text-[#00bf63]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Flexibla sektioner</h3>
                  <p className="text-muted-foreground text-sm">Lägg till arbetslivserfarenhet, utbildning, färdigheter, språk, certifikat, projekt och mycket mer. Ordna sektionerna precis som du vill.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#00bf63]/10 rounded-lg flex items-center justify-center mt-1">
                  <Sparkles className="h-5 w-5 text-[#00bf63]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Flera designalternativ</h3>
                  <p className="text-muted-foreground text-sm">Välj mellan olika typsnitt, storlekar, färger och mallar. Gör ditt CV personligt utan att kompromissa med professionalismen.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#00bf63]/10 rounded-lg flex items-center justify-center mt-1">
                  <Download className="h-5 w-5 text-[#00bf63]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">PDF-export med ett klick</h3>
                  <p className="text-muted-foreground text-sm">Exportera ditt CV som en perfekt formaterad PDF. Redo att skickas direkt till arbetsgivare eller laddas upp på jobbsajter.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#00bf63]/10 rounded-lg flex items-center justify-center mt-1">
                  <Shield className="h-5 w-5 text-[#00bf63]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Spara och redigera</h3>
                  <p className="text-muted-foreground text-sm">Ditt CV sparas automatiskt. Gå tillbaka och redigera det när som helst - perfekt när du vill anpassa det för olika tjänster.</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Popular templates */}
        <Section background="white">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Våra populäraste CV-mallar</h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Testade och godkända mallar som hjälper dig att presentera din erfarenhet på bästa sätt.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          <div className="text-center mt-10">
            <Link href="/cv-mallar">
              <Button variant="outline" size="lg" className="border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63] hover:text-white">
                Visa alla mallar
              </Button>
            </Link>
          </div>
        </Section>

        {/* Testimonials */}
        <Section background="gray">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Vad våra användare säger</h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Tusentals jobbsökare har redan skapat sina CV:n med CVfixaren.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">&quot;Snabbt, tydligt och professionellt. Behövde skriva ihop ett snyggt CV snabbt, den här lösningen var precis vad jag behövde!&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00bf63]/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#00bf63]" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Tina V.</div>
                  <div className="text-xs text-muted-foreground">Projektledare</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">&quot;Användarvänligt och enkelt att följa. Jag hade mitt nya CV klart på under 15 minuter. Rekommenderas varmt!&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00bf63]/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#00bf63]" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Niklas S.</div>
                  <div className="text-xs text-muted-foreground">Ekonom</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">&quot;Bra mallar och smidigt verktyg. Det bästa är att CV:t blev ATS-anpassat direkt. Fick flera intervjuer inom första veckan!&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00bf63]/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#00bf63]" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Sara K.</div>
                  <div className="text-xs text-muted-foreground">Marknadsförare</div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Persuasive CTA section */}
        <Section background="white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Skapa ett proffsigt CV som leder dig till drömjobbet</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              En bra ansökan leder till en bra intervju. Ett professionellt CV gör allt möjligt. Börja med att övertyga rekryteraren redan vid första anblicken.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <Link href="/profil/skapa-cv">
                <Button size="lg" className="btn-sweep-glow bg-[#00bf63] hover:bg-[#00a857] text-white px-8 py-3 text-lg">
                  Skapa ditt CV nu
                </Button>
              </Link>
              <Link href="/cv-mallar">
                <Button size="lg" variant="outline" className="border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63] hover:text-white px-8 py-3 text-lg">
                  Se våra mallar
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00bf63]" /> ATS-optimerat</span>
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00bf63]" /> PDF-export</span>
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00bf63]" /> Professionella mallar</span>
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00bf63]" /> Klart på minuter</span>
            </div>
          </div>
        </Section>

        {/* Blog posts */}
        <Section background="white">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Från vår blogg</h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Tips, guider och expertråd för att maximera dina chanser att landa drömjobbet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {blogPosts.slice(0, 6).map((post) => (
              <Link key={post.slug} href={`/blogg/${post.slug}`} className="group">
                <div className="bg-gray-50 rounded-xl p-6 h-full hover-lift border border-gray-100 group-hover:border-[#00bf63]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block bg-[#00bf63]/10 text-[#00bf63] px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#00bf63] transition-colors">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{post.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#00bf63]">
                    Läs mer <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/blogg">
              <Button variant="outline" size="lg" className="border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63] hover:text-white">
                Visa alla artiklar
              </Button>
            </Link>
          </div>
        </Section>

        {/* FAQ */}
        <Section background="gray-50">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Vanliga frågor</h2>
          <FAQ items={faqItems} />
        </Section>

        {/* Final CTA */}
        <Section background="gray">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Redo att ta nästa steg i din karriär?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Anslut dig till tusentals jobbsökare som redan skapat sitt professionella CV med CVfixaren.
            </p>
            <Link href="/profil/skapa-cv">
              <Button size="lg" className="bg-[#00bf63] hover:bg-[#00a857] text-white px-8 py-3 text-lg">
                Skapa ditt CV nu - det är gratis att börja
              </Button>
            </Link>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
