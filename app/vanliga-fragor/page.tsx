import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Script from "next/script"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vanliga frågor om CV-skapande | CVfixaren.se",
  description:
    "Hitta svar på de vanligaste frågorna om hur du skapar, redigerar och laddar ner ditt professionella CV med CVfixaren.se.",
  alternates: {
    canonical: "https://www.cvfixaren.se/vanliga-fragor",
  },
  openGraph: {
    title: "Vanliga frågor om CV-skapande | CVfixaren.se",
    description: "Svar på vanliga frågor om CV-skapande, mallar, ATS-optimering och mer.",
    url: "https://www.cvfixaren.se/vanliga-fragor",
  },
}

const faqs = [
  {
    question: "Hur skapar jag ett CV på CVfixaren.se?",
    answer:
      "För att skapa ett CV, börja med att klicka på 'Skapa CV' på startsidan. Välj en mall som passar dig, och följ sedan stegen för att fylla i din information. Du kan enkelt redigera och anpassa ditt CV efter dina behov.",
  },
  {
    question: "Är det gratis att använda CVfixaren.se?",
    answer:
      "Vi erbjuder både gratis och premium-funktioner. Du kan skapa ett grundläggande CV utan kostnad, men för tillgång till alla mallar och avancerade funktioner krävs ett premium-konto.",
  },
  {
    question: "Kan jag ladda ner mitt CV som PDF?",
    answer:
      "Ja, när du är klar med ditt CV kan du enkelt ladda ner det som en PDF-fil. Detta gör det enkelt att skicka ditt CV till potentiella arbetsgivare eller dela det online.",
  },
  {
    question: "Hur ofta kan jag uppdatera mitt CV?",
    answer:
      "Du kan uppdatera ditt CV så ofta du vill. Vi rekommenderar att du håller ditt CV uppdaterat med din senaste erfarenhet och kompetenser.",
  },
  {
    question: "Är mina personuppgifter säkra på CVfixaren.se?",
    answer:
      "Vi tar datasäkerhet på största allvar. All information du anger krypteras och lagras säkert. Vi delar aldrig dina personuppgifter med tredje part utan ditt samtycke. För mer information, se vår integritetspolicy.",
  },
  {
    question: "Vad är ett ATS-system och varför är det viktigt?",
    answer:
      "ATS (Applicant Tracking System) är ett digitalt system som arbetsgivare använder för att automatiskt filtrera och sortera inkommande jobbansökningar. Upp till 75% av alla CV:n avvisas av ATS innan en människa ens ser dem. Våra CV-mallar är optimerade för att passera dessa system.",
  },
  {
    question: "Vilken CV-mall ska jag välja?",
    answer:
      "Det beror på din bransch och erfarenhetsnivå. För traditionella branscher som finans och juridik passar en klassisk Standard-mall bäst. För kreativa branscher kan en Modern mall vara effektiv. Alla våra mallar är ATS-optimerade, så du kan inte välja fel ur den aspekten.",
  },
  {
    question: "Hur långt bör mitt CV vara?",
    answer:
      "Ett CV bör vanligtvis vara 1–2 sidor långt. För nyutexaminerade eller de med mindre erfarenhet räcker ofta en sida, medan mer erfarna kandidater kan behöva två sidor. Undvik att göra det längre än två sidor — rekryterare lägger i snitt 6–7 sekunder på att skanna ett CV.",
  },
  {
    question: "Ska jag inkludera ett foto på mitt CV?",
    answer:
      "I Sverige är det inte standard att inkludera ett foto, men det blir allt vanligare. Om du väljer att ha med ett foto, se till att det är professionellt. Våra mallar har stöd för profilbilder som kan läggas till eller tas bort valfritt.",
  },
  {
    question: "Kan jag ha flera CV:n sparade samtidigt?",
    answer:
      "Ja, med ett konto på CVfixaren.se kan du skapa och spara flera CV:n. Detta är praktiskt om du söker jobb inom olika branscher och vill anpassa ditt CV för varje typ av tjänst.",
  },
  {
    question: "Hur anpassar jag mitt CV för ett specifikt jobb?",
    answer:
      "Läs jobbannonsen noggrant och identifiera nyckelord och krav. Anpassa sedan ditt CV genom att lyfta fram de färdigheter och erfarenheter som matchar bäst. Använd liknande formuleringar som i annonsen — detta hjälper både ATS-system och rekryterare att se att du matchar tjänsten.",
  },
  {
    question: "Behöver jag ett personligt brev också?",
    answer:
      "Många arbetsgivare förväntar sig fortfarande ett personligt brev tillsammans med CV:t. Det ger dig möjlighet att visa din motivation och personlighet på ett djupare sätt. Vi erbjuder även mallar och exempel för personliga brev på CVfixaren.se.",
  },
  {
    question: "I vilken ordning ska jag lista min arbetslivserfarenhet?",
    answer:
      "Det vanligaste är omvänd kronologisk ordning, med den senaste erfarenheten först. Detta ger arbetsgivaren en tydlig bild av din aktuella kompetens och senaste roller.",
  },
  {
    question: "Hur kontaktar jag support om jag har problem?",
    answer:
      "Du kan nå oss via vår kontaktsida på cvfixaren.se/kontakt. Vi svarar vanligtvis inom 24 timmar på vardagar.",
  },
  {
    question: "Kan jag avbryta mitt premium-abonnemang?",
    answer:
      "Ja, du kan avbryta ditt premium-abonnemang när som helst. Du behåller tillgång till premium-funktionerna tills din nuvarande betalningsperiod löper ut.",
  },
]

export default function VanligaFragorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Script
        id="faq-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Vanliga frågor", href: "/vanliga-fragor" }]} />
        <div className="max-w-3xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-4">Vanliga frågor</h1>
          <p className="text-gray-600 mb-8">Här hittar du svar på de vanligaste frågorna om CVfixaren.se, våra CV-mallar och hur du skapar ett professionellt CV.</p>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  )
}
