import extraExamples from "@/data/cv-examples.json"

/**
 * CV examples per profession, rendered by app/cv-exempel/[slug]/page.tsx.
 * The original hand-written examples live below; newer ones are plain JSON in
 * data/cv-examples.json so content batches can be added without touching code.
 */
export type CvExample = {
  title: string
  role: string
  metaTitle: string
  metaDescription: string
  intro: string
  cvText: string
  howToWrite: string
  sections: { heading: string; body: string }[]
  /** Typical tasks for the role, phrased so they can be reused in a CV. */
  tasks?: string[]
  faq?: { q: string; a: string }[]
}

const handWrittenExamples: Record<string, CvExample> = {
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
    tasks: [
      "Sommarvikariat i hemtjänsten: hjälpte brukare med inköp, städning och personlig omvårdnad",
      "Extrajobb på konserter och mässor: skötte biljettkontroll, garderob och vägvisning för besökare",
      "Läxhjälp till högstadieelever i matematik och engelska två kvällar i veckan",
      "Timvikarie i grundskolan: genomförde lektioner utifrån lärarens planering och lämnade en kort rapport efteråt",
      "Styrelseledamot i studentföreningen: planerade mottagningen av nya studenter och höll i föreningens budget",
      "Studentambassadör: tog emot gymnasieklasser på campus och berättade om utbildningen",
      "Praktik på en kommunikationsavdelning: skrev nyheter till intranätet och planerade inlägg i sociala medier",
      "Kandidatuppsats: genomförde och analyserade intervjuer och presenterade resultatet på ett seminarium",
    ],
    faq: [
      {
        q: "Hur skriver jag en utbildning som inte är klar än?",
        a: "Skriv programmet med startdatum, ”pågående” och när du räknar med att ta examen, till exempel ”08/2023 – pågående, Kandidatprogram i medie- och kommunikationsvetenskap, beräknad examen 06/2026”. Lägg gärna till hur många högskolepoäng du har klarat, som ”120 av 180 hp”, och ett par kurser som passar jobbet. Då ser arbetsgivaren både var du står och när du kan börja jobba heltid.",
      },
      {
        q: "Ska jag ta med extrajobb som inte har med min utbildning att göra?",
        a: "Ja. Ett extrajobb i butik, lager eller restaurang visar att du klarar att kombinera studier med arbete och att du passar tider. Skriv dem kortare än det som rör utbildningen, med en eller två punkter om sådant som går att använda i jobbet du söker, till exempel kundkontakt, kassaansvar eller att du lärde upp nya kollegor.",
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
    tasks: [
      "Gör omvårdnadsbedömningar vid inskrivning och upprättar vårdplaner",
      "Iordningställer och administrerar läkemedel och följer upp effekt och biverkningar",
      "Sätter PVK och KAD, tar blodprover och sköter sår- och stomivård",
      "Bedömer vitalparametrar enligt NEWS2 och kontaktar läkare när patientens tillstånd försämras",
      "Delegerar läkemedelsgivning och insulin till undersköterskor och följer upp delegeringarna",
      "Gör riskbedömningar för fall, trycksår och undernäring och sätter in förebyggande åtgärder",
      "Dokumenterar omvårdnaden strukturerat i patientjournalen, till exempel enligt VIPS",
      "Planerar vården i livets slutskede och deltar i brytpunktssamtal med patient, närstående och läkare",
    ],
    faq: [
      {
        q: "Ska jag ta med min legitimation i CV:t?",
        a: "Ja, och placera den där den syns direkt. Skriv ”Legitimerad sjuksköterska” under ditt namn och lägg till en rad med datum, till exempel ”Legitimation som sjuksköterska, Socialstyrelsen, 09/2023”. Du behöver inte bifoga någon kopia, eftersom arbetsgivaren själv kan kontrollera legitimationen hos Socialstyrelsen. Har du ansökt men ännu inte fått beslut, skriv ”Legitimation ansökt” följt av månad och år.",
      },
      {
        q: "Ska jag ha kvar åren som undersköterska nu när jag är sjuksköterska?",
        a: "Ja, de visar att du kan omvårdnaden från grunden. Lägg sjuksköterskejobben överst och korta ner undersköterskeåren till ett par punkter om det du tar med dig, till exempel demensvård, förflyttningar eller läkemedelsgivning på delegering. Har du jobbat extra som undersköterska under utbildningen kan du samla det på en rad. Bakgrunden gör det också lättare att berätta på intervjun hur du delegerar och leder arbetet.",
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
    tasks: [
      "Mätte blodtryck, puls, saturation och blodsocker och larmade sjuksköterskan vid avvikande värden",
      "Tog EKG och venösa blodprover på vårdavdelningen",
      "Mobiliserade nyopererade patienter och hjälpte till med hygien och förflyttningar",
      "Förebyggde trycksår med lägesändringar, förde vätskelistor och följde upp patienternas nutrition",
      "Dokumenterade omvårdnaden i journalen och rapporterade till nästa arbetslag vid passbyte",
      "Var kontaktperson för brukare i hemtjänsten och skrev deras genomförandeplaner",
      "Hanterade fall och akuta försämringar hos brukare enligt verksamhetens larmrutin och skrev avvikelserapporter",
      "Introducerade nyanställda och sommarvikarier i avdelningens rutiner",
    ],
    faq: [
      {
        q: "Hur skriver jag mina delegeringar i CV:t?",
        a: "Skriv dem under det jobb där du hade dem, till exempel ”Läkemedelsgivning och insulin på delegering från sjuksköterska”. En delegering är personlig och följer inte med till en ny arbetsgivare, så skriv ”har haft delegering för” i stället för att påstå att du har den nu. Arbetsgivaren ser då vilka moment du redan kan och att du är van vid delegerade uppgifter.",
      },
      {
        q: "Jag har jobbat både på sjukhus och i hemtjänsten. Hur får jag med båda?",
        a: "Ta med båda och låt tjänsten du söker avgöra vilket jobb som får flest punkter. Söker du till en vårdavdelning, beskriv provtagning, EKG och tempot kring in- och utskrivningar. Söker du till hemtjänst eller särskilt boende, lyft fram att du har arbetat ensam hos brukare, följt genomförandeplaner och fattat egna beslut. Skriv gärna en mening i profilen om att du har erfarenhet från båda.",
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
    tasks: [
      "Plockade kundorder med handdator och packade dem för utleverans",
      "Lastade lastbilar enligt lastordning och säkrade godset med spännband",
      "Körde motviktstruck och skjutstativtruck vid inlagring och påfyllning i höglagret",
      "Gjorde daglig kontroll av trucken före varje pass och felanmälde brister",
      "Fyllde på plockplatser från buffertlagret så att plocket inte stannade av",
      "Registrerade inleveranser och avvikelser mot följesedeln i lagersystemet (WMS)",
      "Deltog i rullande inventering och rättade felaktiga lagersaldon",
      "Tog hand om returer och sorterade ut skadat gods för reklamation",
    ],
    faq: [
      {
        q: "Hur skriver jag mitt truckkort i CV:t?",
        a: "Skriv vilka behörigheter kortet gäller, till exempel A och B, och vilka truckar du har kört mest, som motviktstruck eller skjutstativtruck. Lägg gärna till ungefär hur länge du har kört och i vilken miljö, till exempel höglager eller lastkaj. Truckkortet visar att du har gått utbildningen, men det är arbetsgivaren som ger dig körtillstånd på sin arbetsplats, så räkna med en introduktion när du börjar.",
      },
      {
        q: "Hur skriver jag jobb via bemanningsföretag?",
        a: "Skriv bemanningsföretaget som arbetsgivare och kunden där du jobbade på samma rad, till exempel ”Lagerarbetare, Bemanning Väst AB, uppdrag hos Lagerhuset Nord AB”. Har du haft många korta uppdrag, samla dem under en period och lista de kunder och uppgifter som passar jobbet du söker. Då ser CV:t inte splittrat ut, och arbetsgivaren förstår att uppdragen var tillfälliga och inte att du har hoppat mellan jobb.",
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
    tasks: [
      "Feriejobb i kommunens parkförvaltning: klippte gräs, rensade rabatter och tömde papperskorgar",
      "Sommarjobb på äldreboende: hjälpte till vid måltider, följde med på promenader och ordnade fika och bingo för de boende",
      "Extrajobb som tidningsbud: delade ut morgontidningar på ett eget distrikt före skolan",
      "Extrajobb på lager under jullovet: plockade och packade webbeställningar enligt plocklista",
      "Elevrådet: förde protokoll på mötena och drev elevernas förslag vidare till rektor",
      "Kioskansvarig på föreningens hemmamatcher: köpte in varor, bemannade kiosken och redovisade intäkterna till kassören",
      "Fadder för nya elever: visade runt på skolan och höll i aktiviteter under introduktionsveckan",
      "APL på restaurang- och livsmedelsprogrammet: förberedde sallader och kallskänk och diskade under lunchrusningen",
    ],
    faq: [
      {
        q: "Vem kan jag ha som referens när jag inte har haft något riktigt jobb?",
        a: "Välj en vuxen som har sett dig ta ansvar, till exempel tränaren i föreningen, din handledare från feriejobbet eller APL, eller din mentor i skolan. Undvik föräldrar och släktingar. Fråga personen innan du skriver upp namnet och berätta vilket jobb du söker, så att hen vet vad arbetsgivaren kan tänkas fråga om. Skriv namn, roll och telefonnummer.",
      },
      {
        q: "Hur skriver jag när jag kan jobba, eftersom jag går i skolan?",
        a: "Skriv det rakt ut i profilen, till exempel ”Kan arbeta vardagar efter kl. 16, varannan helg och hela sommarlovet”. Många extrajobb i butik och café gäller just kvällar och helger, så raden får inte missas. Är du under 18, skriv också ditt födelseår. Det finns särskilda regler för vilka tider och uppgifter minderåriga får ha, och arbetsgivaren behöver veta din ålder.",
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
    tasks: [
      "Genomför förstudier och nulägesanalyser med intervjuer, workshops och genomgång av kundens data",
      "Leder arbetsmöten med ledningsgrupper för att enas om mål, prioriteringar och handlingsplan",
      "Skriver offerter och uppdragsbeskrivningar med omfattning, tidplan och pris",
      "Leder uppdrag med ansvar för tidplan, budget och avstämningar med kundens styrgrupp",
      "Stöttar kunden i genomförandet genom att utbilda medarbetare och följa upp att förändringen ger effekt",
      "Bygger analysmodeller och uppföljningsverktyg som kunden kan fortsätta använda efter uppdraget",
      "Rapporterar debiterbar tid och arbetar mot bolagets mål för debiteringsgrad",
      "Hittar nya uppdrag hos befintliga kunder genom att föreslå nästa steg efter avslutad leverans",
    ],
    faq: [
      {
        q: "Hur skriver jag många kunduppdrag utan att CV:t blir för långt?",
        a: "Ha konsultbolaget som arbetsgivare med hela perioden och lista tre till fem utvalda uppdrag under. Ange för varje uppdrag bransch, din roll, ungefärlig längd och vad kunden fick ut av det. Får du inte nämna kunden, beskriv den i stället, till exempel ”regionalt energibolag med 400 anställda”. Äldre och mindre relevanta uppdrag kan samlas på en rad med branscher och antal.",
      },
      {
        q: "Är ett konsult-CV samma sak som ett vanligt CV?",
        a: "Inte riktigt. När du söker anställning på ett konsultbolag skickar du ett vanligt CV. När bolaget sedan erbjuder dig till kunder gör det ofta en konsultprofil i sin egen mall, där uppdrag, roller och metodkunskaper kommer först och anpassas efter kundens förfrågan. Spara därför en fullständig lista över alla dina uppdrag, så går det snabbt att plocka fram rätt delar.",
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
    tasks: [
      "Öppnar och stänger förskolan och håller koll på närvaron under dagen",
      "Deltar i inskolningen och ger nya barn och vårdnadshavare en trygg start",
      "Tar hand om vila, blöjbyten, toalettbesök och påklädning",
      "Leder samlingar, sångstunder och lekar utifrån arbetslagets planering",
      "Arbetar utifrån läroplanen för förskolan (Lpfö 18) under förskollärarens ansvar",
      "Använder bildstöd och TAKK med barn som behöver stöd i kommunikationen",
      "Dokumenterar barnens lärande med bild och text i förskolans digitala dokumentationsverktyg",
      "Följer rutinerna för allergier och specialkost vid måltiderna",
    ],
    faq: [
      {
        q: "Hur skriver jag barnvaktsjobb och nannyjobb i CV:t?",
        a: "Ta med dem som vanliga anställningar med period, arbetsgivare och ort. Har du jobbat direkt åt en familj, skriv ”Barnvakt i privat familj” utan familjens namn. Ange hur många barn och vilka åldrar du ansvarade för, och lyft fram det som liknar förskolan: rutiner kring mat och vila, lek ute och hur du löste konflikter mellan syskon.",
      },
      {
        q: "Jag har mest vikarierat på olika förskolor. Hur skriver jag det?",
        a: "Samla vikariaten på en rad i stället för att lista varje förskola, till exempel ”Timvikarie, barnskötare, kommunens vikariepool, 08/2022 – 06/2024”. Skriv under hur många förskolor du har arbetat på och vilka åldrar, som ”åtta förskolor, främst barn 1–3 år”. Det visar att du snabbt kommer in i nya arbetslag. Har du haft ett längre vikariat på samma ställe, ge det en egen rad.",
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
    tasks: [
      "Ansvarade för en egen station med upp till tio bord under kvällsservice",
      "Förberedde salen inför öppning: polerade glas och bestick och gick igenom dagens rätter med köket",
      "Tog emot bordsbokningar och placerade sällskapen så att köket fick ett jämnt flöde",
      "Ökade snittnotan genom att sälja in förrätt, dessert och kaffe",
      "Kontrollerade legitimation och nekade servering till märkbart påverkade gäster enligt alkohollagen",
      "Serverade bröllop, firmafester och konferenser med fast meny och tidsplan",
      "Serverade efter platsnummer så att gästerna fick sina rätter utan att behöva fråga",
      "Tog hand om klagomål vid bordet och löste dem tillsammans med köket eller skiftledaren",
    ],
    faq: [
      {
        q: "Ska jag skriva hur många gäster jag har serverat?",
        a: "Ja, siffror ger arbetsgivaren en bild av tempot. Skriv hur många platser restaurangen hade, hur många bord du hade ansvar för och ungefär hur många kuvert ni serverade en vanlig fredag. Ange också vilken typ av ställe det var, till exempel lunchrestaurang, à la carte eller bankett, eftersom arbetet skiljer sig mycket mellan dem. Avrunda hellre än att gissa högt.",
      },
      {
        q: "Mina restaurangjobb har överlappat varandra och mina studier. Hur skriver jag det?",
        a: "Låt jobben stå med sina riktiga perioder, även om de överlappar, och skriv omfattningen inom parentes, till exempel ”timanställd, helger” eller ”deltid 50 %”. Då förstår läsaren hur du fick ihop det och att du inte har hoppat av något. Studier inom ett annat område behöver inte förklaras, men en mening i profilen om vad du söker nu gör helheten tydligare.",
      },
    ],
  },
}

type ExtraExample = CvExample & { slug: string }

export const cvExamples: Record<string, CvExample> = {
  ...handWrittenExamples,
  ...Object.fromEntries((extraExamples as ExtraExample[]).map(({ slug, ...example }) => [slug, example])),
}
