import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { company } from "@/lib/company"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Integritetspolicy | CVfixaren.se",
  description:
    "Så behandlar CVfixaren.se dina personuppgifter: vilka uppgifter vi sparar, varför, vilka leverantörer vi använder, hur cookies fungerar och vilka rättigheter du har.",
  alternates: {
    canonical: "https://www.cvfixaren.se/integritetspolicy",
  },
  openGraph: {
    title: "Integritetspolicy | CVfixaren.se",
    description: "Vilka personuppgifter vi behandlar, varför vi gör det och vilka rättigheter du har.",
    url: "https://www.cvfixaren.se/integritetspolicy",
  },
}

const LAST_UPDATED = "18 november 2026"

export default function IntegritetspolicyPage() {
  const supportMail = (
    <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Integritetspolicy", href: "/integritetspolicy" }]} />
        <h1 className="text-3xl font-bold mt-4 mb-6">Integritetspolicy</h1>
        <div className="prose max-w-3xl">
          <p>Senast uppdaterad: {LAST_UPDATED}</p>
          <p>
            Här beskriver vi vilka personuppgifter {company.name} behandlar, varför vi gör det, vilka leverantörer som
            hjälper oss och vilka rättigheter du har. Policyn gäller webbplatsen cvfixaren.se och de mejl vi skickar.
          </p>

          <h2>Kort sammanfattning</h2>
          <ul>
            <li>Vi sparar det du skriver in i ditt CV för att du ska kunna redigera det och ladda ner det.</li>
            <li>
              Vi delar uppgifter bara med de leverantörer som behövs för att driva tjänsten. De räknas upp i avsnitt 4.
            </li>
            <li>Analys- och annonscookies från Google sätts bara om du godkänner dem i cookie-rutan.</li>
            <li>
              Sökningar efter lediga jobb skickas till Arbetsförmedlingen utan ditt namn och utan din e-postadress.
            </li>
            <li>
              Vill du ha ett utdrag, rätta något eller radera ditt konto mejlar du {supportMail}.
            </li>
          </ul>

          <h2>1. Vem ansvarar för dina personuppgifter?</h2>
          <p>
            {company.legalName
              ? `Personuppgiftsansvarig är ${company.legalName}, som driver ${company.name}.`
              : `Personuppgiftsansvarig är företaget som driver ${company.name}.`}{" "}
            Det är dit du vänder dig med frågor om hur dina uppgifter behandlas.
          </p>
          <ul>
            {company.orgNumber && <li>Organisationsnummer: {company.orgNumber}</li>}
            {company.address && <li>Postadress: {company.address}</li>}
            <li>E-post: {supportMail}</li>
          </ul>

          <h2>2. Vilka uppgifter behandlar vi?</h2>

          <h3>Kontouppgifter</h3>
          <p>
            Din e-postadress, ett konto-id, när kontot skapades och om du har ett aktivt medlemskap. Om du loggar in via
            en länk i ett mejl kan vi också spara första delen av din e-postadress som visningsnamn.
          </p>

          <h3>Innehållet i ditt CV</h3>
          <p>
            Det du själv skriver in eller laddar upp i CV-verktyget, till exempel namn, kontaktuppgifter, adress,
            födelsedatum, nationalitet, körkort, foto, arbetslivserfarenhet, utbildning, kompetenser, språk, kurser,
            certifikat, referenser och intressen. Vi sparar också vilken mall, vilket typsnitt och vilka färger du har
            valt.
          </p>
          <p>
            Du bestämmer själv vad som ska stå i ditt CV. Vi ber inte om personnummer eller känsliga uppgifter som hälsa,
            facklig tillhörighet eller religion, och du bör inte skriva in dem. Om du lägger in referenser ansvarar du för
            att personerna har gått med på det.
          </p>

          <h3>Betalning</h3>
          <p>
            Betalningen sker hos Stripe. Kortuppgifterna lämnar du direkt till Stripe och vi ser aldrig ditt fullständiga
            kortnummer. Vi får veta att betalningen har gått igenom, vilken e-postadress som användes och en referens
            till köpet och medlemskapet hos Stripe.
          </p>

          <h3>Mejl från oss</h3>
          <p>
            När vi skickar en påminnelse sparar vi din e-postadress, vilken typ av mejl det var, vilket CV det gällde,
            tidpunkten och mejlets id hos vår e-postleverantör. Vi sparar också om du har avregistrerat dig, så att vi
            inte mejlar dig igen.
          </p>

          <h3>Lediga jobb</h3>
          <p>
            Jobbtiteln, titlar från din arbetslivserfarenhet och orten i ditt CV, som används för jobbsökningarna. Om du
            slår på jobbmejlet sparar vi din e-postadress, den sökning mejlet bygger på (yrke och ort) och uppgifter om
            utskicken, till exempel när ett mejl skickades. Om du stänger av jobbmejlet via länken i ett mejl sparar vi
            också när du gjorde det.
          </p>

          <h3>Tekniska uppgifter</h3>
          <p>
            IP-adress, webbläsare och enhet, tidpunkt och vilka sidor eller funktioner som anropas. Uppgifterna hamnar i
            serverloggar hos vår driftleverantör. Loggarna kan i vissa fall också innehålla innehåll från ett anrop, till
            exempel uppgifter från en LinkedIn-profil som importeras.
          </p>

          <h3>Uppgifter om hur du hittade hit</h3>
          <p>
            Om du kommer till oss via en annons hos Google sparar vi annonsens klick-id (gclid, gbraid eller wbraid) i din
            webbläsare. Vi sparar också adressen till den webbplats du kom ifrån under besöket. När du skapar ett konto
            sparas klick-id och den adressen tillsammans med kontot.
          </p>

          <h3>Kontakt med oss</h3>
          <p>Om du mejlar oss sparar vi din e-postadress och det du skriver, så att vi kan svara.</p>

          <h2>3. Varför behandlar vi uppgifterna, och med vilken rättslig grund?</h2>

          <h3>Konto och inloggning</h3>
          <p>
            Vi använder din e-postadress för att skapa ditt konto och för att skicka inloggningslänkar. Rättslig grund:
            avtal (artikel 6.1 b i dataskyddsförordningen, GDPR).
          </p>

          <h3>Skapa, spara och ladda ner CV</h3>
          <p>
            Innan du har ett konto sparas ditt utkast bara i din egen webbläsare. När du är inloggad sparas ditt CV
            löpande i vår databas så att du kan fortsätta senare. När du laddar ner ditt CV skickas innehållet till vår
            server, som skapar PDF-filen. Rättslig grund: avtal.
          </p>

          <h3>Importera ett befintligt CV</h3>
          <p>
            Om du laddar upp en PDF- eller Word-fil läser vår server av texten och fyller i fälten åt dig. Själva filen
            sparas inte hos oss efter att den har lästs av. Rättslig grund: avtal.
          </p>

          <h3>Importera från LinkedIn</h3>
          <p>
            Det här gäller bara om du använder funktionen för att importera från LinkedIn. Då skickar vi adressen till
            den profil du anger till en extern tjänst (iScraper från ProAPIs), som hämtar profilens offentliga uppgifter
            så att vi kan fylla i ditt CV. Importera bara din egen profil. Rättslig grund: avtal.
          </p>

          <h3>Optimera CV:t mot en jobbannons</h3>
          <p>
            Det här gäller bara om du använder funktionen Optimera mitt CV. Då skickas jobbannonsen du klistrar in och
            delar av ditt CV till AI-leverantören Anthropic, som tar fram förslag på förbättringar: din jobbtitel, din
            profiltext, titel, arbetsgivare och beskrivning för dina anställningar samt dina kompetenser. Namn,
            e-postadress, telefonnummer, adress och foto skickas inte med, om du inte själv har skrivit in dem i de
            texterna. Rättslig grund: avtal.
          </p>

          <h3>Betalning och medlemskap</h3>
          <p>
            Vi behandlar uppgifter om din betalning för att ge dig tillgång till det du har betalat för och för att
            hantera ditt medlemskap. Rättslig grund: avtal. Underlag för bokföringen sparar vi för att följa
            bokföringslagen. Rättslig grund: rättslig förpliktelse (artikel 6.1 c).
          </p>

          <h3>Påminnelser</h3>
          <p>
            Om du har skapat ett konto och börjat på ett CV utan att bli klar kan vi skicka en påminnelse med en länk
            tillbaka till ditt CV. Rättslig grund: berättigat intresse (artikel 6.1 f) av att hjälpa dig att slutföra det
            du har påbörjat och av att berätta om vår tjänst. Varje sådant mejl har en länk för avregistrering, och du kan
            när som helst invända mot den här typen av mejl.
          </p>

          <h3>Lediga jobb</h3>
          <p>
            Intill ditt CV och på sidan Lediga jobb visar vi lediga jobb från Arbetsförmedlingen (Platsbanken).
          </p>
          <ul>
            <li>
              <strong>Jobbmatchning.</strong> För att visa hur många lediga jobb som finns för ditt yrke och din ort
              skickas jobbtiteln, upp till tre titlar från din arbetslivserfarenhet och orten från ditt CV till vår
              server. Därifrån går jobbtiteln vidare som en sökfråga till Arbetsförmedlingens öppna API. Om den saknas
              eller inte känns igen som ett yrke prövas titlarna från din arbetslivserfarenhet på samma sätt, en i
              taget. Orten skickas vidare bara om vi känner igen den som en kommun eller ett län, och då som kommunen
              eller länet. Namn, e-postadress och andra uppgifter som identifierar dig skickas inte med, om du inte
              själv har skrivit in dem som jobbtitel. Rättslig grund: berättigat intresse av att visa relevanta lediga
              jobb i tjänsten.
            </li>
            <li>
              <strong>Jobbmejl.</strong> Du kan själv slå på ett mejl med lediga jobb som skickas högst en gång i
              veckan. Det är frivilligt, och du stänger av det i CV-verktyget eller via länken som finns i varje mejl.
              Rättslig grund: samtycke (artikel 6.1 a), som du när som helst kan ta tillbaka.
            </li>
            <li>
              <strong>Annonserna.</strong> Jobbannonserna kommer från Arbetsförmedlingen (Platsbanken). När du går
              vidare till en annons eller ansöker om ett jobb gör du det hos Arbetsförmedlingen eller arbetsgivaren, och
              då gäller deras regler. Vi skickar inte ditt CV till någon arbetsgivare.
            </li>
          </ul>

          <h3>Statistik och uppföljning av annonser</h3>
          <p>
            Vi mäter hur webbplatsen används och vilka annonser som leder till att någon skapar ett konto eller blir
            medlem. Analys- och annonscookies från Google används bara med ditt samtycke (artikel 6.1 a), se avsnitt 7.
            Besöksstatistik utan cookies och sparandet av annonsens klick-id sker med stöd av berättigat intresse av att
            förbättra tjänsten och följa upp vår annonsering.
          </p>

          <h3>Säkerhet och felsökning</h3>
          <p>
            Vi använder tekniska uppgifter och loggar för att hitta fel och upptäcka missbruk. För att skydda inloggning
            och betalning kan vi räkna antalet anrop från en IP-adress under en kort tid. Rättslig grund: berättigat
            intresse av en säker och fungerande tjänst.
          </p>

          <h3>Support</h3>
          <p>
            Vi behandlar det du skickar till oss för att kunna svara och hjälpa dig. Rättslig grund: berättigat intresse
            av att kunna besvara frågor, eller avtal när ärendet gäller ditt konto eller medlemskap.
          </p>

          <h3>Automatiserade beslut</h3>
          <p>
            Vi fattar inga beslut om dig som enbart bygger på automatiserad behandling och som har rättsliga följder för
            dig. AI-funktionen ger förslag som du själv väljer om du vill använda.
          </p>

          <h2>4. Vilka får del av uppgifterna?</h2>
          <p>
            Vi delar uppgifter med leverantörer som behandlar dem för vår räkning, och bara i den omfattning som behövs
            för respektive uppgift:
          </p>
          <ul>
            <li>
              <strong>Supabase</strong> (USA): databas och inloggning. Här lagras ditt konto och dina CV:n.
              Inloggningstjänsten skickar också mejl med inloggningslänk.
            </li>
            <li>
              <strong>Vercel</strong> (USA): drift av webbplatsen, serverloggar och besöksstatistik utan cookies.
            </li>
            <li>
              <strong>Stripe</strong> (Irland och USA): betalningar och medlemskap. Stripe ansvarar självt för de
              kortuppgifter du lämnar där.
            </li>
            <li>
              <strong>Resend</strong> (USA): utskick av påminnelser och jobbmejl.
            </li>
            <li>
              <strong>Google</strong> (Irland och USA): Google Tag Manager, mätning för Google Ads och statistik, samt
              typsnitt från Google Fonts.
            </li>
            <li>
              <strong>Anthropic</strong> (USA): AI-analys, bara när du använder funktionen Optimera mitt CV.
            </li>
            <li>
              <strong>ProAPIs, tjänsten iScraper</strong>: hämtning av LinkedIn-profil, bara när du använder den
              importen. Leverantören kan behandla uppgifterna utanför EU/EES.
            </li>
            <li>
              <strong>Upstash</strong> (USA): begränsning av antalet anrop, där IP-adresser behandlas.
            </li>
          </ul>
          <p>
            <strong>Arbetsförmedlingen</strong> (Sverige) tar emot de sökfrågor om yrke och ort som beskrivs i avsnitt 3.
            Arbetsförmedlingen får inga uppgifter om vem du är från oss.
          </p>
          <p>
            Vi kan också behöva lämna ut uppgifter till myndigheter om vi är skyldiga till det enligt lag.
          </p>

          <h2>5. Överföring utanför EU/EES</h2>
          <p>
            Flera av leverantörerna ovan är amerikanska företag eller har verksamhet i USA. Det innebär att
            personuppgifter kan komma att behandlas utanför EU/EES. När det sker görs överföringen med stöd av en
            överföringsmekanism enligt kapitel V i dataskyddsförordningen: EU-kommissionens beslut om adekvat skyddsnivå
            (för USA gäller det leverantörer som är certifierade enligt EU-U.S. Data Privacy Framework) eller
            EU-kommissionens standardavtalsklausuler.
          </p>
          <p>Kontakta oss om du vill veta mer om vilka skyddsåtgärder som gäller för en viss leverantör.</p>

          <h2>6. Hur länge sparar vi uppgifterna?</h2>
          <ul>
            <li>
              <strong>Konto och CV:n</strong> sparas så länge du har ett konto hos oss. Enskilda CV:n kan du själv radera
              under Mina CV. Kontot finns kvar tills du ber oss radera det.
            </li>
            <li>
              <strong>Utkast i webbläsaren</strong> ligger kvar i din webbläsare tills det har sparats till ditt konto
              eller tills du rensar webbläsarens data för cvfixaren.se.
            </li>
            <li>
              <strong>Betalningsunderlag</strong> sparas så länge bokföringslagen kräver, vilket är sju år efter det
              kalenderår då räkenskapsåret avslutades.
            </li>
            <li>
              <strong>Uppgifter om skickade påminnelser och jobbmejl och om avregistrering</strong> sparas så länge
              kontot finns.
            </li>
            <li>
              <strong>Uppgifterna för jobbmejlet</strong> (den sparade sökningen med yrke och ort, och när mejlet senast
              skickades) sparas så länge kontot finns, även om du stänger av mejlet, så att du kan slå på det igen. Om
              du stänger av mejlet via länken i ett mejl sparar vi också tidpunkten, så att mejlet förblir avstängt
              tills du själv ångrar det via samma länk. Uppgifterna raderas när kontot raderas, eller tidigare om du
              ber oss.
            </li>
            <li>
              <strong>Serverloggar</strong> sparas en begränsad tid hos vår driftleverantör och raderas sedan
              automatiskt.
            </li>
            <li>
              <strong>Uppgifter som samlas in med cookies från Google</strong> sparas enligt Googles egna regler.
            </li>
          </ul>

          <h2>7. Cookies och lokal lagring</h2>
          <p>
            Första gången du besöker oss visas en cookie-ruta där du kan välja Acceptera alla, Neka kakor eller göra ett
            eget val under Preferenser. Det finns tre kategorier:
          </p>
          <ul>
            <li>
              <strong>Nödvändiga.</strong> Krävs för att tjänsten ska fungera, till exempel för att hålla dig inloggad,
              spara ditt CV-utkast och komma ihåg ditt cookie-val. Stripe sätter egna cookies för att förhindra
              bedrägerier när betalfunktionen laddas i CV-verktyget.
            </li>
            <li>
              <strong>Analys.</strong> Om du godkänner får Google lagra cookies för statistik om hur webbplatsen används.
            </li>
            <li>
              <strong>Marknadsföring.</strong> Om du godkänner får Google lagra cookies som används för att mäta
              resultatet av våra annonser och för annonsering, till exempel _gcl_aw.
            </li>
          </ul>

          <h3>Så fungerar ditt val</h3>
          <p>
            Googles skript (Google Tag Manager och Googles tagg) laddas på alla sidor, även innan du har gjort ditt val.
            Vi använder Googles samtyckesläge (Consent Mode), där lagring för analys och annonsering är avstängd från
            start. Så länge du inte har godkänt sätts inga analys- eller annonscookies. Google kan ändå ta emot
            begränsade signaler utan cookies, till exempel att en sida har visats, att ett konto har skapats eller att
            ett köp har genomförts, tillsammans med tekniska uppgifter som IP-adress och webbläsare. En annons klick-id
            kan då följa med i sidornas webbadresser i stället för i cookies.
          </p>
          <p>
            Ditt val sparas i din webbläsare. Du ändrar det när som helst via cookie-ikonen nere till vänster på sidan.
            Cookies som redan har satts tas inte bort automatiskt när du ändrar dig, men du kan radera dem i
            webbläsarens inställningar.
          </p>

          <h3>Det här styrs inte av cookie-valet</h3>
          <ul>
            <li>Din inloggning, som sparas i webbläsaren så att du slipper logga in på nytt.</li>
            <li>Ditt CV-utkast, som sparas i webbläsarens lokala lagring medan du skriver.</li>
            <li>Ditt cookie-val och tidpunkten då du gjorde det.</li>
            <li>
              En annons klick-id (gclid, gbraid eller wbraid) om du kom hit via en annons hos Google, och adressen till
              den webbplats du kom ifrån.
            </li>
            <li>
              Besöksstatistik från Vercel Web Analytics. Enligt Vercel används inga cookies och besökare följs inte
              mellan olika webbplatser.
            </li>
            <li>
              Typsnitt och vissa bilder som hämtas från externa servrar: Google Fonts i förhandsvisningen av ditt CV och
              logotyper för betalsätt från Wikimedia och 1000logos.net. Då ansluter din webbläsare till de servrarna och
              din IP-adress överförs.
            </li>
          </ul>

          <h2>8. Dina rättigheter</h2>
          <p>Enligt dataskyddsförordningen har du rätt att:</p>
          <ul>
            <li>få veta vilka uppgifter vi har om dig och få en kopia av dem (registerutdrag)</li>
            <li>få felaktiga uppgifter rättade</li>
            <li>få dina uppgifter raderade, om vi inte måste spara dem enligt lag</li>
            <li>begära att behandlingen begränsas</li>
            <li>få ut de uppgifter du själv har lämnat i ett format som går att flytta (dataportabilitet)</li>
            <li>
              invända mot behandling som bygger på berättigat intresse, och alltid mot behandling för direktmarknadsföring
            </li>
            <li>ta tillbaka ett samtycke. Det påverkar inte den behandling som skedde innan du tog tillbaka det</li>
          </ul>
          <p>
            Mejla {supportMail} från den e-postadress som hör till ditt konto, så hjälper vi dig. Vi svarar utan onödigt
            dröjsmål och senast inom en månad. En del kan du göra själv:
          </p>
          <ul>
            <li>radera ett CV under Mina CV</li>
            <li>ändra ditt cookie-val via cookie-ikonen nere till vänster</li>
            <li>avregistrera dig från påminnelser och jobbmejl via länken i mejlet</li>
            <li>avsluta ditt medlemskap under Konto</li>
          </ul>

          <h2>9. Klagomål</h2>
          <p>
            Om du tycker att vi behandlar dina personuppgifter på ett felaktigt sätt får du gärna höra av dig till oss
            först. Du har också alltid rätt att klaga hos Integritetsskyddsmyndigheten (IMY), som är tillsynsmyndighet i
            Sverige. Mer information finns på{" "}
            <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer">
              imy.se
            </a>
            .
          </p>

          <h2>10. Säkerhet</h2>
          <p>
            All trafik mellan din webbläsare och cvfixaren.se är krypterad med HTTPS. Betalningar hanteras av Stripe och
            vi lagrar inga kortuppgifter. Om det inträffar en personuppgiftsincident som innebär en risk för dig följer vi
            reglerna om anmälan till IMY och om information till dem som berörs.
          </p>

          <h2>11. Ändringar i policyn</h2>
          <p>
            Vi uppdaterar policyn när tjänsten eller reglerna ändras. Datumet högst upp visar när den senast ändrades.
            Större ändringar meddelar vi på webbplatsen eller via mejl.
          </p>

          <h2>12. Kontakt</h2>
          <p>
            Har du frågor om policyn eller om hur vi behandlar dina uppgifter? Mejla {supportMail}. Se även våra{" "}
            <Link href="/anvandarvillkor">användarvillkor</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
