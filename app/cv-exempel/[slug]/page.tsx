import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/section"
import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { sanitizeHTML } from "@/lib/sanitize"

const cvExamples: Record<string, {
  title: string
  role: string
  metaTitle: string
  metaDescription: string
  intro: string
  cvText: string
  howToWrite: string
  sections: { heading: string; body: string }[]
}> = {
  student: {
    title: "Student CV-exempel & skrivtips",
    role: "Student",
    metaTitle: "Student CV-exempel & skrivtips (2026) | CVfixaren",
    metaDescription:
      "Se ett komplett CV-exempel för studenter med profiltips, färdigheter och utbildning. Skapa ditt student-CV gratis med CVfixaren.",
    intro:
      "Här hittar du ett beprövat CV-exempel för studenter. Använd det som inspiration och skapa ditt eget professionella CV på bara några minuter med vårt gratis verktyg.",
    cvText: `
      <div class="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-1">Liam Persson</h3>
        <p class="text-sm text-gray-500 mb-4">Student</p>
        <p class="text-sm text-gray-500 mb-6">liam.persson98@live.se | 08-57720800 | Stockholm, Sverige</p>
        <h4 class="font-semibold mb-2">Profil</h4>
        <p class="text-sm text-gray-700 mb-4">Ambitiös, nyfiken och hårt arbetande student söker arbete. Redo att använda nyförvärvade kunskaper inom media och kommunikation, samt utnyttja praktiska erfarenheter. Har en passion för mediavärlden, är duktig på att kommunicera och samarbeta. Skicklig på olika aspekter av sociala medier, behärskar programvara för kontorsadministration och övriga standard datorkunskaper. Har en positiv attityd, är entusiastisk och driven.</p>
        <h4 class="font-semibold mb-2">Arbetserfarenhet</h4>
        <p class="text-sm font-medium">09/2015 – 06/2018, Försäljare, Annas Bokhandel, Stockholm</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-4"><li>Välkomnade kunder och hjälpte dem att hitta böcker.</li><li>Erbjöd lästips baserade på kundens behov och smak.</li><li>Sorterade böcker och följde bokhandelns riktlinjer och företagsmål.</li></ul>
        <h4 class="font-semibold mb-2">Utbildning</h4>
        <p class="text-sm text-gray-700 mb-1">08/2017 – 01/2024, Kandidatexamen i Medie- och kommunikationsvetenskap, Stockholms Universitet</p>
        <p class="text-sm text-gray-700 mb-4">09/2014 – 06/2017, Samhällsvetenskapsprogrammet, Solna Gymnasium</p>
        <h4 class="font-semibold mb-2">Färdigheter</h4>
        <ul class="text-sm text-gray-700 list-disc ml-5"><li>Avancerade kommunikationsfärdigheter</li><li>Sociala medieplattformer</li><li>Bokbranschen</li><li>Gitarr</li></ul>
      </div>`,
    howToWrite:
      "Ett CV för en student bör tydligt visa upp personens intresse för att lära sig nya saker. Förmodligen har du inte så många traditionella anställningar att presentera. Då gäller det istället att fokusera på eftergymnasiala utbildningar, praktikplatser och andra uppdrag. Visa upp vilka ambitioner du har och förankra dem i de utbildningar du presenterar. Har du möjlighet att framhäva hur utbildningarna är relevanta för det specifika jobbet du söker, blir du garanterat mer intressant i arbetsgivarens ögon.",
    sections: [
      {
        heading: "Exempel på profil",
        body: "Fokusera på dina största prestationer och bästa egenskaper. Använd kraftfulla handlingsverb och branschspecifika uppgifter. En framgångsrik student är passionerad och fokuserad – nämn dina viktigaste erfarenheter och talanger här.",
      },
      {
        heading: "Exempel på tidigare anställningar",
        body: "Om du inte har relevant arbetserfarenhet kan du istället lista akademiska prestationer, fritidsaktiviteter, praktikplatser eller andra erfarenheter. Använd kraftfulla handlingsverb och nämn specifika prestationer som visar att du är en utmärkt kandidat.",
      },
      {
        heading: "Exempel på utbildning",
        body: "Lista dina viktigaste utbildningar, kurser och certifieringar. Om du har en högre examen än kandidatexamen behöver du inte ta med din gymnasieutbildning.",
      },
      {
        heading: "Exempel på färdigheter",
        body: "Läs noggrant igenom arbetsbeskrivningen för tjänsten du söker och ta med alla relevanta färdigheter i ditt CV. Se till att du har en bra blandning av mjuka och hårda färdigheter.",
      },
    ],
  },
  sjukskoterska: {
    title: "Sjuksköterska CV-exempel & skrivtips",
    role: "Sjuksköterska",
    metaTitle: "Sjuksköterska CV-exempel & skrivtips (2026) | CVfixaren",
    metaDescription:
      "Se ett komplett CV-exempel för sjuksköterskor. Lär dig lyfta fram dina vårdkunskaper och din erfarenhet. Skapa ditt CV gratis med CVfixaren.",
    intro:
      "Här hittar du ett beprövat CV-exempel för sjuksköterskor. Använd det som inspiration för att visa upp din yrkeskännedom och erfarenhet inom vårdsektorn.",
    cvText: `
      <div class="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-1">Markus Eriksson</h3>
        <p class="text-sm text-gray-500 mb-4">Sjuksköterska</p>
        <p class="text-sm text-gray-500 mb-6">markuseriksson@gmail.com | 073-5502505 | Umeå, Sverige</p>
        <h4 class="font-semibold mb-2">Profil</h4>
        <p class="text-sm text-gray-700 mb-4">Empatisk och hängiven legitimerad sjuksköterska med nio års erfarenhet inom åldringsvården. Började som undersköterska, men är nu legitimerad sjuksköterska, med de allra sista vetenskapliga rönen i bagaget. Driven och gillar utmaningar. Strävar alltid efter att se människan bakom patienten. Noggrann, pålitlig och stresstålig.</p>
        <h4 class="font-semibold mb-2">Arbetserfarenhet</h4>
        <p class="text-sm font-medium">01/2023 – 03/2024, Sjuksköterska, Ersboda Vård- och Omsorgsboende, Umeå</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-3"><li>Ansvarade för patienter som var multisjuka; ledde omvårdnadsarbetet.</li><li>Arbetade både självständigt och i team med annan vårdpersonal.</li><li>Assisterade läkare och annan personal när så behövdes.</li><li>Informerade patienter och närstående om hur man kan främja hälsan.</li></ul>
        <p class="text-sm font-medium">09/2019 – 12/2020, Undersköterska, Äldreboende Ekedal, Skövde</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-4"><li>Arbetade nära människor med fokus på personlig omvårdnad och medicinska insatser.</li><li>Gav individuell vård och omsorg till de äldre.</li><li>Medicinska uppgifter: ge medicin, lägga om sår, kontrollera puls, temp och blodtryck.</li></ul>
        <h4 class="font-semibold mb-2">Utbildning</h4>
        <p class="text-sm text-gray-700 mb-1">08/2020 – 06/2023, Sjuksköterskeprogrammet 180 hp, Umeå universitet</p>
        <p class="text-sm text-gray-700 mb-4">08/2012 – 06/2015, Vård- och omsorgsprogrammet, Västerhöjdsskolan, Skövde</p>
        <h4 class="font-semibold mb-2">Färdigheter</h4>
        <ul class="text-sm text-gray-700 list-disc ml-5"><li>Sätter patienten i första rummet</li><li>Öppen och tydlig kommunikation</li><li>Bra på att samarbeta</li><li>Behärskar första hjälpen och lungräddning</li><li>Erfarenhet av att handleda praktikanter</li></ul>
      </div>`,
    howToWrite:
      "Ett CV för en sjuksköterska bör tydligt förmedla din yrkeskännedom och erfarenhet inom vårdsektorn. Det ska innehålla ett övertygande personligt avsnitt som sammanfattar dina färdigheter och insatser. Avsnittet om arbetslivserfarenhet bör fokusera på tjänster inom det medicinska området. Använd kraftfulla handlingsverb och ha en proffsig översikt av utbildningar och certifieringar.",
    sections: [
      {
        heading: "Exempel på profil",
        body: "Fokusera på dina största bedrifter och bästa egenskaper i din roll som sjuksköterska. Lyft fram dina viktigaste bedrifter i denna korta men övertygande sammanfattning.",
      },
      {
        heading: "Exempel på tidigare anställningar",
        body: "Lista alla tjänster som är relevanta för sjuksköterskerollen. Om du inte har många jobb att lista, ta med praktikplatser och annan relevant erfarenhet inom vården. Använd handlingsverb och ta med jobbspecifika bedrifter.",
      },
      {
        heading: "Exempel på utbildning",
        body: "Lista viktiga utbildningar, kurser och certifieringar. Du kan ha ett separat avsnitt för certifikat, licenser och utmärkelser, eller ta med dem i utbildningsavsnittet.",
      },
      {
        heading: "Exempel på färdigheter",
        body: "Inkludera en stark blandning av mjuka och hårda färdigheter som relaterar till vårdarbetet. Se till att du får med alla dina vårdspecifika färdigheter.",
      },
    ],
  },
  underskoterska: {
    title: "Undersköterska CV-exempel & skrivtips",
    role: "Undersköterska",
    metaTitle: "Undersköterska CV-exempel & skrivtips (2026) | CVfixaren",
    metaDescription:
      "Se ett komplett CV-exempel för undersköterskor. Visa din omvårdnadskompetens och erfarenhet på bästa sätt. Skapa ditt CV gratis med CVfixaren.",
    intro:
      "Här hittar du ett beprövat CV-exempel för undersköterskor. Använd det som inspiration för att lyfta fram din vårdkompetens och praktiska erfarenhet.",
    cvText: `
      <div class="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-1">Håkan Ström</h3>
        <p class="text-sm text-gray-500 mb-4">Undersköterska</p>
        <p class="text-sm text-gray-500 mb-6">hakan_strom@gmail.com | 074-3242521 | Malmö, Sverige</p>
        <h4 class="font-semibold mb-2">Profil</h4>
        <p class="text-sm text-gray-700 mb-4">Entusiastisk, hängiven och noggrann undersköterska med 10 års erfarenhet av en vårdavdelning på ett storstadssjukhus samt inom hemtjänsten. Kunnig och pålitlig, kan utföra alla arbetsuppgifter självständigt. Stor vana att vårda och kontrollera patienter. Bra på administrativt arbete.</p>
        <h4 class="font-semibold mb-2">Arbetserfarenhet</h4>
        <p class="text-sm font-medium">10/2020 – 01/2022, Undersköterska, Skånes Universitetssjukhus, Malmö</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-3"><li>Utförde alla dagliga arbetsuppgifter på avdelningen; vårdade patienter, tog emot nya patienter.</li><li>Ansvarade för avdelningens förråd.</li><li>Informerade patienter och familjemedlemmar om behandling och mediciner.</li></ul>
        <p class="text-sm font-medium">08/2011 – 06/2020, Undersköterska, Malmö hemtjänst</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-4"><li>Gav stöd och hjälp åt klienterna med att klara av det vardagliga i hemmet.</li><li>Skötte sårvård och såg till att klienterna tog sina mediciner.</li><li>Kommunicerade väl med klienter och anhöriga.</li></ul>
        <h4 class="font-semibold mb-2">Utbildning</h4>
        <p class="text-sm text-gray-700 mb-1">06/2015 – pågående, Fortbildning Specialistundersköterska, Yrkeshögskolan, Borlänge</p>
        <p class="text-sm text-gray-700 mb-4">08/2008 – 06/2011, Vård- och omsorgsprogrammet, Falu frigymnasium</p>
        <h4 class="font-semibold mb-2">Färdigheter</h4>
        <ul class="text-sm text-gray-700 list-disc ml-5"><li>Stresstålig</li><li>Serviceinriktad och vänlig</li><li>Noggrann och pålitlig</li><li>God organisationsförmåga</li></ul>
      </div>`,
    howToWrite:
      "Ett CV för en undersköterska bör framhäva din praktiska vårdkompetens och din förmåga att arbeta både självständigt och i team. Lyft fram dina erfarenheter inom omvårdnad, medicinska insatser och kommunikation med patienter och anhöriga. Avsnittet om arbetslivserfarenhet bör detaljerat beskriva dina arbetsuppgifter och använda kraftfulla handlingsverb.",
    sections: [
      {
        heading: "Exempel på profil",
        body: "Sammanfatta dina viktigaste egenskaper och din erfarenhet inom vården. Betona din pålitlighet, noggrannhet och förmåga att arbeta självständigt.",
      },
      {
        heading: "Exempel på tidigare anställningar",
        body: "Lista alla relevanta tjänster och beskriv dina arbetsuppgifter i detalj. Lyft fram specifika vårduppgifter du utfört och hur du har bidragit till patienternas välbefinnande.",
      },
      {
        heading: "Exempel på utbildning",
        body: "Lista din vård- och omsorgsutbildning, eventuella fortbildningar och certifieringar. Eventuella specialistutbildningar är extra värdefulla att ha med.",
      },
      {
        heading: "Exempel på färdigheter",
        body: "Inkludera både mjuka färdigheter (empati, stresstålig) och hårda färdigheter (medicinska insatser, dokumentation). Anpassa efter den specifika tjänsten du söker.",
      },
    ],
  },
  lagerarbetare: {
    title: "Lagerarbetare CV-exempel & skrivtips",
    role: "Lagerarbetare",
    metaTitle: "Lagerarbetare CV-exempel & skrivtips (2026) | CVfixaren",
    metaDescription:
      "Se ett komplett CV-exempel för lagerarbetare. Visa dina praktiska färdigheter och din lagererfarenhet. Skapa ditt CV gratis med CVfixaren.",
    intro:
      "Här hittar du ett beprövat CV-exempel för lagerarbetare. Använd det som inspiration för att framhäva dina praktiska färdigheter och din erfarenhet inom lagerdrift.",
    cvText: `
      <div class="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-1">Henrik Wahlström</h3>
        <p class="text-sm text-gray-500 mb-4">Lagerarbetare</p>
        <p class="text-sm text-gray-500 mb-6">henrikwahlstrom89@gmail.com | +46 73 123456 | Västerås, Sverige</p>
        <h4 class="font-semibold mb-2">Profil</h4>
        <p class="text-sm text-gray-700 mb-4">Erfaren och entusiastisk lagerarbetare med över sex års erfarenhet inom branschen. Ansvarar för alla processer på lagret så att alla varor hamnar på rätt plats vid rätt tidpunkt. Skicklig gaffeltrucksförare. Tar initiativ till lösningar för att underlätta arbetsflödet. Konstruktiv och driven med fokus på hälsa och säkerhet.</p>
        <h4 class="font-semibold mb-2">Arbetserfarenhet</h4>
        <p class="text-sm font-medium">10/2015 – 09/2020, Lagerarbetare, Byggmax, Västerås</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-3"><li>Fullbordade produktionsorder inom strikta deadlines.</li><li>Assisterade andra lagerarbetare och förbättrade produktiviteten.</li><li>Uppfyllde alla säkerhetsnormer och garanterade produktkvalitet.</li><li>Handledde nya produktionsarbetare enligt säkerhetsriktlinjer.</li></ul>
        <p class="text-sm font-medium">06/2012 – 09/2015, Lagerarbetare, Byggmax, Eskilstuna</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-4"><li>Utförde dagliga arbetsuppgifter enligt gällande säkerhetsnormer.</li><li>Tog emot varor och övervakade produktionslinjer.</li><li>Samarbetade väl med andra lagerarbetare.</li></ul>
        <h4 class="font-semibold mb-2">Utbildning</h4>
        <p class="text-sm text-gray-700 mb-4">09/2009 – 05/2012, Fordons- och transportprogrammet, Edströmska Gymnasiet, Västerås</p>
        <h4 class="font-semibold mb-2">Färdigheter</h4>
        <ul class="text-sm text-gray-700 list-disc ml-5"><li>Full koll på lagerdrift</li><li>Organisationsförmåga</li><li>Behärskar alla säkerhetsregler</li><li>Fysiskt stark med god fingerfärdighet</li><li>B-körkort och truckkort</li><li>Motiverad och driven</li></ul>
      </div>`,
    howToWrite:
      "Ett CV för en lagerarbetare ska förmedla din förmåga att effektivt utföra de olika arbetsmomenten på lagret. Lyft fram de färdigheter och förmågor som är viktiga: säkerhet, organisation, fysisk uthållighet och truckkompetens. Var detaljerad i beskrivningen av din arbetslivserfarenhet och inkludera en bra blandning av mjuka och hårda färdigheter.",
    sections: [
      {
        heading: "Exempel på profil",
        body: "Fokusera på dina viktigaste bedrifter och egenskaper. Lyft fram tjänster du är stolt över och dina mest imponerande talanger och färdigheter inom lagerdrift.",
      },
      {
        heading: "Exempel på tidigare anställningar",
        body: "Lista tidigare jobb som relaterar till lagertjänsten. Läs annonsen noggrant, använd kärnfulla handlingsverb och ta med specifika bedrifter som bevisar att du är rätt kandidat.",
      },
      {
        heading: "Exempel på utbildning",
        body: "Lista alla betyg och certifieringar. Truckkort och andra yrkescertifieringar är särskilt viktiga att ha med.",
      },
      {
        heading: "Exempel på färdigheter",
        body: "Inkludera en blandning av mjuka och hårda färdigheter: säkerhetskunskap, fysisk kapacitet, körkort och truckkort, samt förmåga att samarbeta.",
      },
    ],
  },
  gymnasieelev: {
    title: "Gymnasieelev CV-exempel & skrivtips",
    role: "Gymnasieelev",
    metaTitle: "Gymnasieelev CV-exempel & skrivtips (2026) | CVfixaren",
    metaDescription:
      "Se ett komplett CV-exempel för gymnasieelever. Visa din potential trots begränsad arbetslivserfarenhet. Skapa ditt CV gratis med CVfixaren.",
    intro:
      "Här hittar du ett beprövat CV-exempel för gymnasieelever. Även utan lång arbetslivserfarenhet kan du skapa ett övertygande CV som visar din potential.",
    cvText: `
      <div class="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-1">Mario Pausini</h3>
        <p class="text-sm text-gray-500 mb-4">Gymnasieelev</p>
        <p class="text-sm text-gray-500 mb-6">mario.pausini@telia.se | 073-5050522 | Helsingborg, Sverige</p>
        <h4 class="font-semibold mb-2">Profil</h4>
        <p class="text-sm text-gray-700 mb-4">Handlingskraftig och entusiastisk person. Utmärkta analytiska färdigheter och ett starkt engagemang för många olika frågor och ämnen. Stort intresse för idrott samt fysisk och mental hälsa. Van att ta ansvar, både i skolan (elevrådet), på arbetet (Pressbyrån) samt på idrottsplatsen (ungdomstränare).</p>
        <h4 class="font-semibold mb-2">Arbetserfarenhet</h4>
        <p class="text-sm font-medium">08/2021 – 07/2023, Barntränare i friidrott, Helsingborg IK</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-3"><li>Planerade träningen tillsammans med ledarteamet.</li><li>Hjälpte till med närvarorapportering och kontakt med föräldrar.</li><li>Ansvarade för uppvärmning och inledande lekar.</li></ul>
        <p class="text-sm font-medium">09/2020 – 06/2021, Medarbetare, Pressbyrån, Helsingborg</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-4"><li>Ansvar för försäljning, kassaarbete, bakning, varuhantering och städning.</li><li>Gav god och omtänksam service till alla kunder.</li></ul>
        <h4 class="font-semibold mb-2">Utbildning</h4>
        <p class="text-sm text-gray-700 mb-4">08/2021 – pågående, Samhällsvetenskapsprogrammet, Helsingborgs sportgymnasium</p>
        <h4 class="font-semibold mb-2">Färdigheter</h4>
        <ul class="text-sm text-gray-700 list-disc ml-5"><li>Entusiastisk och empatisk</li><li>Ansvarstagande</li><li>Påhittig</li><li>Stark och uthållig</li></ul>
      </div>`,
    howToWrite:
      "Som gymnasieelev har du kanske inte lång arbetslivserfarenhet, men det finns mycket du kan lyfta fram. Fokusera på fritidsaktiviteter, volontärarbete, ideella uppdrag och de personliga egenskaper som gör dig till en värdefull medarbetare. Var noga med att framhäva ansvar du tagit, exempelvis i elevrådet eller som tränare.",
    sections: [
      {
        heading: "Exempel på profil",
        body: "Beskriv din personlighet och dina styrkor. Som gymnasieelev är det extra viktigt att visa engagemang, ansvar och vilja att lära. Koppla gärna till den tjänst du söker.",
      },
      {
        heading: "Exempel på tidigare anställningar",
        body: "Lista sommarjobb, deltidsjobb, volontärarbete och föreningsengagemang. Använd handlingsverb och visa vad du faktiskt bidrog med i varje roll.",
      },
      {
        heading: "Exempel på utbildning",
        body: "Beskriv ditt gymnasieprogram och eventuella inriktningar eller profiler. Nämn om du har höga betyg eller deltagit i särskilda projekt.",
      },
      {
        heading: "Exempel på färdigheter",
        body: "Fokusera på personliga egenskaper och överförbara färdigheter som visar att du passar för jobbet, exempelvis ansvar, samarbetsförmåga och entusiasm.",
      },
    ],
  },
  konsult: {
    title: "Konsult CV-exempel & skrivtips",
    role: "Konsult",
    metaTitle: "Konsult CV-exempel & skrivtips (2026) | CVfixaren",
    metaDescription:
      "Se ett komplett CV-exempel för konsulter. Lyft fram din strategiska kompetens och dina prestationer. Skapa ditt CV gratis med CVfixaren.",
    intro:
      "Här hittar du ett beprövat CV-exempel för konsulter. Använd det som inspiration för att visa upp din förmåga att leverera resultat och hjälpa kunder uppnå sina mål.",
    cvText: `
      <div class="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-1">Axel Johansson</h3>
        <p class="text-sm text-gray-500 mb-4">Konsult</p>
        <p class="text-sm text-gray-500 mb-6">axel.johansson86@gmail.com | 08-97877110 | Stockholm, Sverige</p>
        <h4 class="font-semibold mb-2">Profil</h4>
        <p class="text-sm text-gray-700 mb-4">Erfaren och entusiastisk konsult med över 10 års erfarenhet av att hjälpa kunder att uppnå och överträffa sina affärsmål. Dokumenterade kompetenser: ledning, strategi och lönsamhet. Erfaren inom marknadsföring, reklam och varumärkesförbättring. Antar gärna utmaningar gällande komplexa problem.</p>
        <h4 class="font-semibold mb-2">Arbetserfarenhet</h4>
        <p class="text-sm font-medium">10/2016 – 08/2024, Konsult, Äventyr-X, Stockholm</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-3"><li>Ansvarade för handledning och affärsplanering.</li><li>Utvecklade specifika finansiella mål och strategier.</li><li>Definierade problemområden och kom med konstruktiva lösningar.</li><li>Förberedde detaljerade rapporter, förslag och rekommendationer.</li></ul>
        <p class="text-sm font-medium">04/2013 – pågående, Konsult, PrivKap, Stockholm</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-4"><li>Arbetade med klienter för att bedöma framsteg och identifiera problem.</li><li>Höll i handledning gällande marknadsföring och produktutveckling.</li><li>Skapade mätbara förbättringar för företaget.</li><li>Förbättrade marknadsföringsstrategier med märkbara resultat.</li></ul>
        <h4 class="font-semibold mb-2">Utbildning</h4>
        <p class="text-sm text-gray-700 mb-4">08/2003 – 05/2007, Kandidatexamen i Ekonomi, Stockholms Universitet</p>
        <h4 class="font-semibold mb-2">Färdigheter</h4>
        <ul class="text-sm text-gray-700 list-disc ml-5"><li>Affärsutveckling</li><li>Affärsstrategier</li><li>Problemlösning</li><li>Analytiskt tänkande</li><li>Kommunikation</li><li>Kreativitet</li><li>Digital prestandamätning</li></ul>
      </div>`,
    howToWrite:
      "Ett CV för en konsult bör lyfta fram din förmåga att hjälpa klienter nå sina mål med effektiva strategier och handlingsplaner. Fokusera på ledarskapstjänster, organisations- och planeringsförmåga samt konkreta bedrifter. Konsulter bör vara mycket duktiga på att kommunicera och visa intresse för andra människor.",
    sections: [
      {
        heading: "Exempel på profil",
        body: "Fokusera på dina viktigaste prestationer och egenskaper. Använd övertygande handlingsverb och arbetsspecifik information. En skicklig konsult är organiserad och presterar bra under press.",
      },
      {
        heading: "Exempel på tidigare anställningar",
        body: "Lista din arbetslivserfarenhet med fokus på det mest relevanta. Nämn branschspecifika prestationer, kraftfulla handlingsverb och konkreta resultat du levererat.",
      },
      {
        heading: "Exempel på utbildning",
        body: "Lista dina viktigaste utbildningar, kurser och certifieringar. Branschspecifika certifikat och fortbildningar ger extra styrka åt din ansökan.",
      },
      {
        heading: "Exempel på färdigheter",
        body: "Inkludera färdigheter inom affärsutveckling, strategi, kommunikation och analys. Läs arbetsbeskrivningen noggrant och anpassa färdighetslistan efter tjänsten.",
      },
    ],
  },
  barnskotare: {
    title: "Barnskötare CV-exempel & skrivtips",
    role: "Barnskötare",
    metaTitle: "Barnskötare CV-exempel & skrivtips (2026) | CVfixaren",
    metaDescription:
      "Se ett komplett CV-exempel för barnskötare. Visa din omvårdnadskompetens och pedagogiska erfarenhet. Skapa ditt CV gratis med CVfixaren.",
    intro:
      "Här hittar du ett beprövat CV-exempel för barnskötare. Använd det som inspiration för att lyfta fram din omtanke, ditt tålamod och din erfarenhet av att arbeta med barn.",
    cvText: `
      <div class="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-1">Anna Karlgren</h3>
        <p class="text-sm text-gray-500 mb-4">Barnvakt / Barnskötare</p>
        <p class="text-sm text-gray-500 mb-6">anna.karlgren@telia.se | 073-5679876 | Örebro, Sverige</p>
        <h4 class="font-semibold mb-2">Profil</h4>
        <p class="text-sm text-gray-700 mb-4">Rutinerad och pålitlig, entusiastisk och engagerad barnskötare med över fem års erfarenhet. Har arbetat med riktigt små barn (spädbarn på 2 månader) och är van att ta hand om flera barn samtidigt. Gedigen meritlista av nöjda kunder. Arbetar gärna nära familjerna för att ge skräddarsydd hjälp.</p>
        <h4 class="font-semibold mb-2">Arbetserfarenhet</h4>
        <p class="text-sm font-medium">09/2017 – 01/2022, Barnvakt, NannyNow, Örebro</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-3"><li>Tog hand om fyra barn mellan 0 och 6 år.</li><li>Lämnade och hämtade barnen i skolan och på fritidsaktiviteter.</li><li>Skötte grundläggande hushållssysslor, handlade mat och lagade middag.</li><li>Rapporterade om barnens aktiviteter och bekymmer till föräldrarna.</li></ul>
        <p class="text-sm font-medium">08/2015 – 08/2017, Barnskötare, Ur &amp; Skur, Örebro</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-4"><li>Ansvarade för tjugo barn på två avdelningar tillsammans med förskolläraren.</li><li>Arbetade i första hand med de yngsta barnen (1–2 år).</li><li>Vistades utomhus stora delar av dagen.</li><li>Följde alla regler gällande säkerhet och hälsa.</li></ul>
        <h4 class="font-semibold mb-2">Utbildning</h4>
        <p class="text-sm text-gray-700 mb-1">08/2017 – pågående, Intern pedagogisk utbildning, Friluftsfrämjandet, Örebro</p>
        <p class="text-sm text-gray-700 mb-4">08/2012 – 06/2015, Barn- och fritidsprogrammet, Alléskolan, Örebro</p>
        <h4 class="font-semibold mb-2">Färdigheter</h4>
        <ul class="text-sm text-gray-700 list-disc ml-5"><li>Organisationsförmåga</li><li>Medkännande</li><li>Multitasking</li><li>Tålamod</li></ul>
      </div>`,
    howToWrite:
      "Ett CV för en barnskötare bör framhäva din förmåga att ta hand om barn på ett tryggt och kärleksfullt sätt. Lyft fram din pedagogiska bakgrund, ditt tålamod och din erfarenhet av att arbeta med olika åldersgrupper. Konkreta exempel på hur du hanterat situationer med barn ger extra trovärdighet.",
    sections: [
      {
        heading: "Exempel på profil",
        body: "Beskriv din erfarenhet och dina viktigaste egenskaper som barnskötare. Betona pålitlighet, engagemang och förmåga att bygga trygga relationer med barn och familjer.",
      },
      {
        heading: "Exempel på tidigare anställningar",
        body: "Lista alla relevanta tjänster, inklusive barnpassning, förskolearbete och volontärarbete med barn. Beskriv dina uppgifter och visa hur du bidragit till barnens utveckling.",
      },
      {
        heading: "Exempel på utbildning",
        body: "Lista barn- och fritidsprogrammet, pedagogiska utbildningar och eventuella specialkurser. Certifikat inom första hjälpen för barn är ett värdefullt tillägg.",
      },
      {
        heading: "Exempel på färdigheter",
        body: "Fokusera på mjuka färdigheter som tålamod, empati och organisationsförmåga, kombinerat med praktiska färdigheter som pedagogik och säkerhetskunskap.",
      },
    ],
  },
  "servitor-servitris": {
    title: "Servitör/servitris CV-exempel & skrivtips",
    role: "Servitör/servitris",
    metaTitle: "Servitör/servitris CV-exempel & skrivtips (2026) | CVfixaren",
    metaDescription:
      "Se ett komplett CV-exempel för servitörer och servitriser. Visa din serviceförmåga och restaurangerfarenhet. Skapa ditt CV gratis med CVfixaren.",
    intro:
      "Här hittar du ett beprövat CV-exempel för servitörer och servitriser. Använd det som inspiration för att framhäva din serviceanda och din erfarenhet inom restaurangbranschen.",
    cvText: `
      <div class="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-1">Linda Lagrange</h3>
        <p class="text-sm text-gray-500 mb-4">Servitris</p>
        <p class="text-sm text-gray-500 mb-6">lindalagrange@gmail.com | +46 73 550250 | Stockholm, Sverige</p>
        <h4 class="font-semibold mb-2">Profil</h4>
        <p class="text-sm text-gray-700 mb-4">Professionell och entusiastisk servitris med över tre års erfarenhet av att ta upp beställningar och servera mat i välbesökta restauranger. Skicklig på att leverera förstklassig service. Driven person med mycket energi, förmågan att multitaska och arbeta väl under press. Extremt kundfokuserad.</p>
        <h4 class="font-semibold mb-2">Arbetserfarenhet</h4>
        <p class="text-sm font-medium">02/2018 – 01/2024, Servitris, Restaurang Himlen, Stockholm</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-3"><li>Tog emot beställningar och gav råd vid val av maträtter och dryck.</li><li>Full koll på menyn och speciella säsongserbjudanden.</li><li>Kom med förslag baserade på allergier eller specifika önskemål.</li><li>Samarbetade med serverings- och kökspersonal för nöjda kunder.</li></ul>
        <p class="text-sm font-medium">03/2018 – pågående, Servitris, Café Blåbär, Stockholm</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-3"><li>Hälsade alla gäster välkomna och såg till positiva upplevelser.</li><li>Dukade bord och plockade disk.</li><li>Hjälpte chefen instruera ny personal.</li></ul>
        <p class="text-sm font-medium">07/2012 – 06/2014, Barista, Espresso House, Solna</p>
        <ul class="text-sm text-gray-700 list-disc ml-5 mb-4"><li>Serverade drycker och smörgåsar samt skötte kassan.</li><li>Erbjöd gästerna en kaffeupplevelse utöver det vanliga.</li></ul>
        <h4 class="font-semibold mb-2">Utbildning</h4>
        <p class="text-sm text-gray-700 mb-1">08/2019 – 01/2024, Fotografprogrammet, Göteborgs universitet</p>
        <p class="text-sm text-gray-700 mb-4">08/2015 – 05/2018, Humanistiska programmet, Schillerska gymnasiet, Göteborg</p>
        <h4 class="font-semibold mb-2">Färdigheter</h4>
        <ul class="text-sm text-gray-700 list-disc ml-5"><li>Exceptionellt serviceinriktad</li><li>Kunskap om livsmedelssäkerhet</li><li>Kommunikationsförmåga</li><li>Vänlig och social attityd</li><li>Multitasking</li></ul>
      </div>`,
    howToWrite:
      "Ett CV för en servitör/servitris ska visa din förmåga att servera mat på ett professionellt och tilltalande sätt. Du är restaurangens ansikte utåt. Lyft fram din positiva och gästvänliga attityd, din stresstålig, organisatoriska förmåga och serviceinriktning. Lista referenser som kan ge utmärkta rekommendationer.",
    sections: [
      {
        heading: "Exempel på profil",
        body: "Fokusera på dina största bedrifter och bästa egenskaper. Var kort och koncis men personlig. Betona din serviceanda och förmåga att hantera stressiga situationer.",
      },
      {
        heading: "Exempel på tidigare anställningar",
        body: "Lista alla tjänster inom restaurang- och livsmedelsbranschen. Använd kraftfulla handlingsverb och nämn specifika bedrifter som visar din service och kundorientering.",
      },
      {
        heading: "Exempel på utbildning",
        body: "Lista utbildningar och eventuella restaurang- eller livsmedelsrelaterade kurser. Certifikat inom hygien och livsmedelssäkerhet är extra värdefulla.",
      },
      {
        heading: "Exempel på färdigheter",
        body: "Inkludera servicefärdigheter, livsmedelssäkerhet, kommunikation och multitasking. Anpassa efter den specifika restaurangens eller caféets behov.",
      },
    ],
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const example = cvExamples[resolvedParams.slug]

  if (!example) {
    return { title: "CV-exempel hittades inte | CVfixaren" }
  }

  return {
    title: example.metaTitle,
    description: example.metaDescription,
    alternates: {
      canonical: `https://www.cvfixaren.se/cv-exempel/${resolvedParams.slug}`,
    },
    openGraph: {
      title: example.metaTitle,
      description: example.metaDescription,
    },
  }
}

export default async function CVExamplePage({ params }: Props) {
  const resolvedParams = await params
  const example = cvExamples[resolvedParams.slug]

  if (!example) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-subtle py-16 md:py-20">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { label: "CV-exempel", href: "/cv-exempel" },
                { label: example.role, href: `/cv-exempel/${resolvedParams.slug}` },
              ]}
            />
            <div className="max-w-4xl mx-auto mt-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{example.title}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {example.intro}
              </p>
              <Link href="/profil/skapa-cv">
                <Button size="lg" className="bg-[#00bf63] hover:bg-[#00a857] text-white px-8">
                  Skapa ditt CV nu
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CV Example */}
        <Section background="white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">CV-exempel i textformat</h2>
            <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(example.cvText) }} />
          </div>
        </Section>

        {/* How to write */}
        <Section background="gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Hur man skriver ett CV för en {example.role.toLowerCase()}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{example.howToWrite}</p>
          </div>
        </Section>

        {/* Section breakdowns */}
        <Section background="white">
          <div className="max-w-3xl mx-auto space-y-8">
            {example.sections.map((section, i) => (
              <div key={section.heading} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#00bf63] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{section.heading}</h3>
                    <p className="text-sm text-muted-foreground">{section.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section background="gray">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Redo att skapa ditt {example.role}-CV?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Använd detta CV-exempel som inspiration och skapa ett professionellt CV på bara några minuter.
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
              <Link href="/cv-exempel">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#00bf63] text-[#00bf63] hover:bg-[#00bf63] hover:text-white"
                >
                  Alla CV-exempel
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
