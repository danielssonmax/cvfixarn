import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Script from "next/script"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { sanitizeHTML } from "@/lib/sanitize"

// This would typically come from a CMS or database
const blogPosts = {
  "vi-analyserade-cv": {
    title: "Vad skriver folk i sitt CV? Vi analyserade 719 CV:n",
    date: "2026-11-03",
    category: "CV-tips",
    excerpt:
      "Vi analyserade 719 CV:n. 79 % skriver ut gatuadressen, men bara 14 % av jobbeskrivningarna har en siffra. Så ser ett typiskt CV ut, och vad du kan stryka.",
    content: `
      <p>Vad skriver folk egentligen i sitt CV? Vi gick igenom 719 CV:n som byggts i CVfixarens CV-verktyg, ett per person, och räknade vad som finns med. Resultatet visar ett tydligt mönster: många fyller CV:t med personuppgifter som rekryterare inte behöver, medan det som faktiskt säljer in dig, som resultat och certifikat, ofta saknas.</p>
      <p>Här är vad vi hittade, och vår bedömning av om varje del är värd platsen.</p>

      <blockquote>
        <p><strong>Det viktigaste i korthet</strong></p>
        <ul>
          <li><strong>79&nbsp;%</strong> skriver ut sin gatuadress. Det räcker med ort.</li>
          <li>Bara <strong>14&nbsp;%</strong> av arbetsbeskrivningarna innehåller en siffra som inte är ett årtal.</li>
          <li>De vanligaste kompetenserna är mjuka förmågor som kommunikation, ansvarstagande och problemlösning, sådant som är svårt att bevisa.</li>
          <li>Bara <strong>1,5&nbsp;%</strong> lägger till certifikat, trots att vård, butik och lager dominerar bland jobben.</li>
        </ul>
      </blockquote>

      <h2>Vad visar analysen av 719 CV:n?</h2>
      <p>I 86&nbsp;% av CV:na finns arbetslivserfarenhet och i 77&nbsp;% finns utbildning. Det är grunden, och nästan alla har den. Skillnaderna syns i resten: vad folk lägger till, vad de hoppar över och hur de beskriver det de gjort.</p>

      <figure style="margin:2rem 0;padding:1.25rem 1.25rem 1rem;border:1px solid #e9edf3;border-radius:12px;background:#ffffff">
        <p style="margin:0 0 1rem;font-weight:600;color:#16233a">Andel CV:n som innehåller respektive del</p>
        <div style="margin:0 0 .7rem" title="Arbetslivserfarenhet: 86 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Arbetslivserfarenhet</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">86&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:85.7%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Utbildning: 77 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Utbildning</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">77&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:77.2%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Språk: 68 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Språk</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">68&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:68%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Kompetenser: 59 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Kompetenser</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">59&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:58.8%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Roll/titel under namnet: 38 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Roll/titel under namnet</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">38&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:37.8%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Bild: 36 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Bild</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">36&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:36.2%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Profiltext: 23 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Profiltext</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">23&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:23.4%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Egenskaper: 4,9 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Egenskaper</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">4,9&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:4.9%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Intressen: 3,8 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Intressen</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">3,8&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:3.8%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Referenser: 2,4 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Referenser</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">2,4&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:2.4%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Certifikat: 1,5 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Certifikat</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">1,5&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:1.5%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="Kurser: 1,5 % av CV:na">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>Kurser</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">1,5&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:1.5%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
        <figcaption style="margin-top:.75rem;font-size:.8rem;color:#56657f">Källa: CVfixaren, 719 CV:n (det senaste per person), april 2025 till november 2026. Profiltext, egenskaper, intressen, referenser, certifikat och kurser är sektioner som användaren själv lägger till.</figcaption>
      </figure>

      <p>De sju viktigaste fynden:</p>
      <ol>
        <li><strong>79&nbsp;% skriver gatuadress.</strong> Ort, telefon och e-post räcker för att en rekryterare ska kunna nå dig.</li>
        <li><strong>14&nbsp;% av arbetsbeskrivningarna innehåller en siffra.</strong> Resten beskriver uppgifter, inte resultat.</li>
        <li><strong>23&nbsp;% har en profiltext.</strong> Knappt var fjärde lägger till de rader som först möter rekryteraren.</li>
        <li><strong>30&nbsp;% av alla listade kompetenser är mjuka förmågor och egenskaper</strong>, som "kommunikation", "flexibel" eller "social".</li>
        <li><strong>27&nbsp;% anger födelsedatum och 11&nbsp;% kön.</strong> Uppgifter en arbetsgivare inte får väga in.</li>
        <li><strong>1,5&nbsp;% har ett avsnitt med certifikat.</strong> Truckkort, delegering eller HLR syns sällan.</li>
        <li><strong>2,4&nbsp;% har med referenser.</strong> De flesta har redan slutat skriva ut dem, och det är rätt.</li>
      </ol>

      <h2>Vilka personuppgifter ska stå i ett CV?</h2>
      <p>Nästan alla har med det viktigaste: 95&nbsp;% har e-post och 94&nbsp;% telefonnummer. Men 79&nbsp;% skriver också ut sin gatuadress, och var fjärde använder fältet för födelsedatum. Det är uppgifter som tar plats utan att göra dig mer anställningsbar.</p>
      <div style="overflow-x:auto">
        <table>
          <thead>
            <tr><th>Uppgift</th><th>Andel</th><th>Värt att ha med?</th></tr>
          </thead>
          <tbody>
            <tr><td>E-post och telefon</td><td>95&nbsp;% / 94&nbsp;%</td><td><strong>Ja.</strong> Använd en neutral e-postadress.</td></tr>
            <tr><td>Ort</td><td>84&nbsp;%</td><td><strong>Ja.</strong> Visar att du kan ta dig till jobbet.</td></tr>
            <tr><td>Gatuadress och postnummer</td><td>79&nbsp;%</td><td><strong>Nej.</strong> Ort räcker. Adressen behövs först vid anställning.</td></tr>
            <tr><td>Bild</td><td>36&nbsp;%</td><td><strong>Valfritt.</strong> Vanligt i Sverige men inget krav.</td></tr>
            <tr><td>Födelsedatum</td><td>27&nbsp;%</td><td><strong>Nej.</strong> Ålder är ingen merit, och arbetsgivaren får inte väga in den.</td></tr>
            <tr><td>Körkort (eget fält)</td><td>27&nbsp;%</td><td><strong>Ja, om jobbet kräver det.</strong> Skriv vilken behörighet, till exempel B.</td></tr>
            <tr><td>Kön</td><td>11&nbsp;%</td><td><strong>Nej.</strong> Irrelevant för jobbet.</td></tr>
            <tr><td>Nationalitet</td><td>9,5&nbsp;%</td><td><strong>Nej.</strong> Skriv hellre att du har arbetstillstånd, om det är aktuellt.</td></tr>
            <tr><td>LinkedIn</td><td>6,8&nbsp;%</td><td><strong>Ja, om profilen är uppdaterad.</strong></td></tr>
            <tr><td>Civilstånd</td><td>6,4&nbsp;%</td><td><strong>Nej.</strong> Säger inget om hur du jobbar.</td></tr>
            <tr><td>Personnummer</td><td>0,7&nbsp;%</td><td><strong>Aldrig.</strong> Bra att nästan ingen gör det.</td></tr>
          </tbody>
        </table>
      </div>
      <p>Ålder, kön och etnisk tillhörighet är skyddade i diskrimineringslagen, så en arbetsgivare ska inte låta dem påverka urvalet. Att skriva ut dem hjälper dig alltså inte, och i värsta fall ger det någon en anledning att sortera fel. Om körkort: 18 personer hade skrivit bara "Ja" i körkortsfältet. Skriv behörigheten, till exempel "B-körkort", så att rekryteraren vet vad du får köra.</p>
      <p>Vill du läsa mer om bilden kan du se vår guide om <a href="/skriva-cv#bild">bild i CV:t</a>, och om du har en LinkedIn-profil kan du <a href="/blogg/linkedin-profil-optimering">få den att komplettera ditt CV</a>.</p>

      <h2>Hur beskriver folk sin arbetslivserfarenhet?</h2>
      <p>Medianen är tre jobb per CV, och var femte listar fem jobb eller fler. 80&nbsp;% av jobben har en beskrivning, och en typisk beskrivning är 22 ord lång. Det är kort, men längden är inte problemet. Problemet är vad som står där.</p>

      <div style="margin:2rem 0;padding:1.5rem;border-radius:12px;background:#effdf5;border:1px solid #b2efcd">
        <p style="margin:0;font-size:2.75rem;line-height:1;font-weight:800;color:#16233a;font-variant-numeric:tabular-nums">14&nbsp;%</p>
        <p style="margin:.5rem 0 0;color:#2a3850">av arbetsbeskrivningarna innehåller en siffra som inte är ett årtal, till exempel antal kunder, teamets storlek eller ett resultat. Bara 2&nbsp;% anger en enhet som procent, kronor eller antal kunder.</p>
      </div>

      <p>De flesta beskriver vad jobbet gick ut på, inte vad de åstadkom. Räknar vi per person har 27&nbsp;% av dem med arbetslivserfarenhet minst en siffra någonstans i sina jobbeskrivningar. Nästan tre av fyra visar alltså inga konkreta resultat, något som rekryterare ofta lyfter fram som det som får ett CV att sticka ut. Vi har samlat vad rekryterare själva säger i <a href="/blogg/vad-vill-rekryterare-se-i-ett-cv">Vad vill rekryterare se i ett CV?</a></p>
      <p>Siffror finns i nästan alla jobb, även där det inte handlar om försäljning. Så här kan det se ut för tre av de vanligaste jobben i vår data:</p>
      <ul>
        <li><strong>Undersköterska.</strong> Vanligt: <em>"Omvårdnad av äldre."</em> Bättre: <em>"Omvårdnad på avdelning med 24 boende. Delegering för läkemedel, dokumentation i journalsystem."</em></li>
        <li><strong>Butiksmedarbetare.</strong> Vanligt: <em>"Kassa och kundservice."</em> Bättre: <em>"Kassa och kundservice i butik med cirka 400 kunder per dag. Ansvar för beställning av frukt och grönt."</em></li>
        <li><strong>Lagerarbetare.</strong> Vanligt: <em>"Plock och pack, truckkörning."</em> Bättre: <em>"Plockade i snitt 120 orderrader per timme. Truckkort A och B, motviktstruck dagligen."</em></li>
      </ul>
      <p>Exemplen är påhittade, men formen fungerar för de flesta jobb. Fråga dig själv: hur många, hur ofta, hur stort, och vad blev bättre för att du var där? Bara 20&nbsp;% av beskrivningarna använder punktlistor, och det är ett enkelt sätt att göra dem lättare att skumma. Fler exempel per yrke hittar du bland våra <a href="/cv-exempel">CV-exempel</a>.</p>

      <h2>Skriver folk en profiltext, och hur låter den?</h2>
      <p>Profiltexten är de rader som står överst och som rekryteraren läser först. I vårt verktyg är det en sektion man själv lägger till, och 23&nbsp;% gör det. Medianlängden är 60 ord, vilket är en lagom längd. 40&nbsp;% börjar texten med "Jag".</p>
      <p>Orden i profiltexterna är förvånansvärt lika. Var tredje innehåller "engagerad" eller "engagemang", och mer än var fjärde "positiv", "ansvarsfull", "samarbete" eller "noggrann". 62&nbsp;% av texterna innehåller tre eller fler av orden nedan.</p>

      <figure style="margin:2rem 0;padding:1.25rem 1.25rem 1rem;border:1px solid #e9edf3;border-radius:12px;background:#ffffff">
        <p style="margin:0 0 1rem;font-weight:600;color:#16233a">Vanligaste orden i profiltexter</p>
          <div style="margin:0 0 .7rem" title="engagerad / engagemang: 33 % av profiltexterna">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>engagerad / engagemang</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">33&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:32.7%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="positiv: 28 % av profiltexterna">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>positiv</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">28&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:28%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="ansvarsfull / ansvarstagande: 28 % av profiltexterna">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>ansvarsfull / ansvarstagande</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">28&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:28%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="utvecklas / utveckling: 27 % av profiltexterna">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>utvecklas / utveckling</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">27&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:27.4%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="samarbete: 26 % av profiltexterna">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>samarbete</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">26&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:26.2%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="noggrann: 26 % av profiltexterna">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>noggrann</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">26&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:25.6%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="självgående / självständig: 21 % av profiltexterna">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>självgående / självständig</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">21&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:21.4%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="team / lagspelare: 17 % av profiltexterna">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>team / lagspelare</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">17&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:17.3%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="social: 14 % av profiltexterna">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>social</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">14&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:14.3%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
          <div style="margin:0 0 .7rem" title="flexibel: 14 % av profiltexterna">
            <div style="display:flex;justify-content:space-between;gap:1rem;font-size:.9rem;line-height:1.3;color:#16233a"><span>flexibel</span><span style="font-variant-numeric:tabular-nums;color:#3d4b64">14&nbsp;%</span></div>
            <div style="margin-top:.3rem;height:12px;background:#e9edf3;border-radius:0 4px 4px 0"><div style="width:13.7%;height:12px;background:#00874a;border-radius:0 4px 4px 0"></div></div>
          </div>
        <figcaption style="margin-top:.75rem;font-size:.8rem;color:#56657f">Andel av 168 profiltexter som innehåller ordet eller en böjning av det. Källa: CVfixaren, april 2025 till november 2026.</figcaption>
      </figure>

      <p>Problemet är inte orden i sig. Det är att de inte skiljer dig från någon annan och inte går att kontrollera. Bara 38&nbsp;% av profiltexterna nämner erfarenhet av eller inom något konkret.</p>
      <p>Vårt råd: lägg till en profiltext, men låt den börja med vad du är och kan, inte med en lista egenskaper. "Undersköterska med fem års erfarenhet av demensvård och delegering för läkemedel" säger mer än "Jag är en positiv och noggrann person som gillar att samarbeta". Visa egenskaperna med exempel i stället för att räkna upp dem. Läs mer om hur du skriver en profiltext i guiden om <a href="/skriva-cv">hur man skriver ett CV</a>.</p>

      <h2>Vilka kompetenser listar folk i sitt CV?</h2>
      <p>59&nbsp;% har fyllt i avsnittet för kompetenser, och den som gör det listar i median två. De vanligaste orden är inte konkreta kunskaper utan mjuka förmågor och egenskaper: kommunikation, ansvarstagande, problemlösning, flexibel, kundservice, stresstålig och samarbetsförmåga. Räknat på alla listade kompetenser är 30&nbsp;% av den sorten.</p>
      <p>Ingen enskild kompetens fanns i fler än 3,5&nbsp;% av CV:na. Det är bra, för det betyder att folk skriver olika saker. Men egenskaperna i toppen är samma ord som i profiltexterna, och de går inte att kontrollera.</p>
      <p>Bara 5&nbsp;% nämner ett Office-program som kompetens. Det är rimligt för många jobb i vår data, men det visar också att de konkreta kunskaperna ofta saknas: kassasystem, journalsystem, truckkort, språk, programvaror och maskiner.</p>
      <p><strong>Värt att ha med?</strong> Ja, men byt egenskaperna mot kunskaper du kan bevisa och som annonsen frågar efter. Använd samma ord som annonsen, så hittar även <a href="/ats-anpassade-cv-mallar">rekryteringssystemen</a> dem. Egenskaperna passar bättre i profiltexten, med ett exempel.</p>

      <h2>Vad är det som nästan ingen har med?</h2>
      <p>Några delar finns i under 5&nbsp;% av CV:na. Ibland är det helt rätt, ibland är det en missad chans:</p>
      <ul>
        <li><strong>Certifikat (1,5&nbsp;%) och kurser (1,5&nbsp;%).</strong> En missad chans. De vanligaste jobbtitlarna i vår data är vårdbiträde, undersköterska, butiksmedarbetare, personlig assistent och lagerarbetare. Där är truckkort, delegering, HLR och hygienutbildning ofta krav, och de syns bara om du skriver ut dem.</li>
        <li><strong>Referenser (2,4&nbsp;%).</strong> Rätt att hoppa över. Ha två referenser redo och lämna dem när arbetsgivaren ber om dem. Bara 1&nbsp;% skriver "Referenser lämnas på begäran", och det behövs inte heller.</li>
        <li><strong>Intressen (3,8&nbsp;%).</strong> Valfritt. Ta med dem om de visar något relevant, som ledaruppdrag i en förening.</li>
        <li><strong>Egenskaper som eget avsnitt (4,9&nbsp;%).</strong> Behövs inte. Visa dem i profiltexten och i dina arbetsbeskrivningar.</li>
      </ul>
      <p>Språk är däremot vanligt: 68&nbsp;% har ett språkavsnitt. Svenska och engelska dominerar, och av dem som listar språk har 39&nbsp;% med tre eller fler. 36&nbsp;% anger ett modersmål. Det är en merit i många serviceyrken, så ta med alla språk du kan använda i jobbet.</p>

      <h2>Hur långt är ett typiskt CV?</h2>
      <p>Det typiska CV:t i vår data innehåller 239 ord, och tre av fyra har under 365 ord. De flesta CV:n är alltså korta. Det är inget problem i sig, men det gör varje rad viktig. Om var fjärde rad är gatuadress, födelsedatum och civilstånd finns det mindre plats för det som säljer in dig.</p>
      <p>Prioritera i den här ordningen: arbetslivserfarenhet med resultat, utbildning och certifikat, konkreta kompetenser och språk, en kort profiltext överst. Allt annat är bonus.</p>

      <h2>Så gjorde vi analysen</h2>
      <p>Vi analyserade CV:n som skapats i CVfixarens CV-verktyg mellan 24 april 2025 och 3 november 2026: 2&nbsp;632 sparade CV:n från 874 konton. Vi tog bort tomma utkast utan erfarenhet, utbildning, kompetenser, profiltext eller fullständigt namn, och behöll sedan det senast uppdaterade CV:t per person. Kvar blev 719 CV:n.</p>
      <p>Vi räknade om varje fält var ifyllt och sökte efter ord och siffror i texterna. Analysen gjordes automatiskt och bara på sammanställd nivå. Inga enskilda CV:n har lästs eller citerats, och listor visar bara ord som förekommer i minst fem CV:n.</p>
      <p>Tre saker är bra att veta. Datan visar vad folk skriver, inte vem som fick jobbet, så våra bedömningar bygger på vad rekryterare brukar efterfråga. Användarna söker oftast jobb inom vård, handel, lager och service, vilket påverkar till exempel vilka kompetenser som är vanliga. Och verktyget påverkar en del val: profiltext och flera avsnitt måste läggas till aktivt, medan adressfältet syns från början.</p>

      <h2>Vanliga frågor</h2>
      <h3>Vad ska man inte ha med i ett CV?</h3>
      <p>Hoppa över personnummer, gatuadress, födelsedatum, kön, civilstånd och nationalitet. I vår analys hade 79&nbsp;% med gatuadress och 27&nbsp;% födelsedatum, trots att ingen av uppgifterna gör dig mer kvalificerad. Ort, telefon och e-post räcker.</p>
      <h3>Ska man skriva körkort i CV:t?</h3>
      <p>Ja, om jobbet kräver det eller annonsen nämner det. 34&nbsp;% av CV:na i vår analys nämner körkort. Skriv vilken behörighet du har, till exempel B-körkort, och ta med truckkort eller liknande som certifikat.</p>
      <h3>Hur många kompetenser ska man ha i CV:t?</h3>
      <p>De som har ett kompetensavsnitt i vår data listar i median två, vilket ofta är för få. Fem till åtta konkreta kompetenser som matchar annonsen är en bra nivå, hellre system och kunskaper än egenskaper.</p>
      <h3>Behöver man skriva referenser i CV:t?</h3>
      <p>Nej. Bara 2,4&nbsp;% av CV:na i vår analys har med referenser. Ha kontaktuppgifterna redo och lämna dem när arbetsgivaren frågar efter dem.</p>

      <h2>Sammanfattning</h2>
      <p>Analysen av 719 CV:n visar att de flesta har grunderna på plats, men lägger plats på fel saker. Stryk gatuadress, födelsedatum, kön och civilstånd. Lägg den platsen på siffror i dina arbetsbeskrivningar, certifikat du har och en kort profiltext som säger vad du kan, inte bara vem du är.</p>
      <p>Vill du testa direkt? Öppna ditt CV i <a href="/profil/skapa-cv">CV-verktyget</a> och gå igenom det med listan ovan.</p>
    `,
  },
  "vad-vill-rekryterare-se-i-ett-cv": {
    title: "Vad vill rekryterare se i ett CV? Det här säger de som läser dem",
    date: "2026-11-03",
    category: "CV-tips",
    excerpt:
      "Rekryterare och chefer svarade på vad de vill se i ett CV. Här är råden de är överens om, var de tycker olika och två tips du inte ska följa.",
    content: `
      <p>"Rekryterare, hur vill ni att ett CV och personligt brev ska se ut?" Frågan ställdes i en tråd på <a href="https://www.reddit.com/r/sweden/comments/1l26jz3/rekryterare_hur_vill_ni_att_ett_cv_och_personligt/" target="_blank" rel="noopener noreferrer">r/sweden</a> av någon som hittat en tjänst de verkligen ville ha. Det mest uppröstade svaret var kort: <em>"Finns lika många åsikter som det finns rekryterare."</em></p>
      <p>Det stämmer delvis. Men läser du alla svar från rekryterare, chefer och andra som faktiskt sållar ansökningar ser du att de är överens om mer än de tror. Vi har gått igenom tråden och jämfört råden med hur 719 personer faktiskt har byggt sina CV:n hos CVfixaren.</p>

      <blockquote>
        <p><strong>Det viktigaste i korthet</strong></p>
        <ul>
          <li>Rekryterarna i tråden vill se <strong>hur du uppfyller kraven i annonsen</strong>, inte bara dina jobbtitlar.</li>
          <li><strong>Mätbara resultat</strong> nämns som ett plus, men bara 14&nbsp;% av arbetsbeskrivningarna i CV:n byggda hos oss innehåller en siffra.</li>
          <li><strong>Slarvfel och fel företagsnamn</strong> är de röda flaggor som nämns oftast. Ett felfritt, enkelt CV slår ett snyggt med fel i.</li>
          <li>Om bild, design, längd och AI går åsikterna isär. Där avgör branschen och annonsen.</li>
        </ul>
      </blockquote>

      <h2>Vad är rekryterare överens om i ett CV?</h2>
      <p>Trots att tråden började med "alla tycker olika" återkommer samma fem saker hos dem som läser CV:n i jobbet. Ingen av dem handlar om design. Alla handlar om att göra det lätt för läsaren att se att du passar för just den här tjänsten.</p>

      <h3>1. Visa hur du uppfyller kraven i annonsen</h3>
      <p>En rekryterare skrev att man ska utgå från kraven i annonsen och göra det övertydligt hur man uppfyller dem. Det vanligaste felet enligt hen är att bara skriva en titel, till exempel "administratör", utan att berätta vad jobbet innehöll. Administratörer finns i alla branscher, med helt olika arbetsuppgifter.</p>
      <p>Läs annonsen, stryk under kraven och se till att varje krav går att hitta i ditt CV. Det hjälper både människan som läser och rekryteringssystemet som sorterar. Vi går igenom hur det fungerar i guiden om <a href="/ats-anpassade-cv-mallar">ATS-anpassade CV-mallar</a>.</p>

      <h3>2. Beskriv vad du gjorde, med verktyg och resultat</h3>
      <p>En ingenjör som läser CV:n inför intervjuer ville se vilka branschspecifika verktyg du använt, och hellre en rad för mycket än att något relevant saknas. En operativ chef som tar besluten listade "mätbara resultat i jobberfarenheten" som en grön flagga.</p>
      <div style="margin:1.5rem 0;padding:1rem 1.25rem;border-left:4px solid #00874a;border-radius:0 8px 8px 0;background:#f5f7fa"><p style="margin:0;color:#2a3850"><strong>I CV:n byggda hos oss:</strong> bara 14&nbsp;% av arbetsbeskrivningarna innehåller en siffra som inte är ett årtal, och bara 27&nbsp;% av dem med arbetslivserfarenhet har en enda siffra någonstans. Här finns en enkel chans att sticka ut.</p></div>
      <p>Det behöver inte vara försäljningssiffror. Antal kunder per dag, storleken på teamet, hur många ärenden du hanterade eller att du kortade en process med en vecka räcker långt.</p>

      <h3>3. Gör det lätt att skumma</h3>
      <p>Flera i tråden beskriver samma läsning: en snabb första sållning där CV:t ska gå att förstå på 20–30 sekunder. En rekryterare skrev att hen inte orkar läsa sidor av text under varje jobb. En annan tyckte att CV:n som ser ut som "kortare noveller" blir stökiga.</p>
      <p>Lägg det mest relevanta först och skriv ditt senaste jobb högst upp. Har du nyss tagit examen och utbildningen är det som gör dig relevant kan den ligga först, annars ska erfarenheten komma före.</p>

      <h3>4. Felfritt slår snyggt</h3>
      <p>Den mest konkreta listan i tråden kom från en operativ chef. Hens röda flaggor var slarvfel i språk och stavning, trasig formatering, överdrifter och fel företagsnamn, något hen kallade "absurt vanligt". En annan som deltar i rekryteringar skrev att hen medvetet letar efter fel: särskrivningar, oförklarade luckor och kompetenser som inte betyder något.</p>
      <p>En kommentar sammanfattade det bra: i första sållningen är det viktigare att inte ha ett dåligt CV än att ha ett fantastiskt. Är du kvalificerad vill du inte bli bortsorterad på en liten miss. Läs igenom en extra gång, och kontrollera att företagsnamnet stämmer i varje ansökan.</p>

      <h3>5. Relevans före fullständighet</h3>
      <p>Arbetslivserfarenhet ska vara den största delen av CV:t enligt chefen ovan. Utbildning, kompetenser, språk och sommarjobb kan du nämna, men de ska inte fylla ut. En annan skrev att hen inte vill se "en bibel av arbeten", bara de jobb som spelar roll för tjänsten.</p>
      <p>Det betyder inte att du ska ta bort jobb så att det blir luckor. Ett irrelevant jobb kan stå kvar på en rad med arbetsgivare och år, utan beskrivning. Det visar att du har arbetat, utan att stjäla plats.</p>

      <h2>Varför ratar rekryterare kompetensstaplar?</h2>
      <p>Två personer i tråden tog upp samma sak: staplar eller betyg där du skattar dig själv, typ "MS Excel 5/10". Chefen ville hellre se en design som lyfter fram relevant text än "nån stapel om att du är 5/10 på MS Excel". En annan berättade att hen tog bort alla staplar ur sitt CV. Ett självskattat betyg säger inte vad du kan, och skattar en annan sökande sig högre kan du sorteras bort trots att du är bättre.</p>
      <p>Skriv hellre vad du har använt verktyget till. "Excel: pivottabeller och månadsrapporter till ledningsgruppen" säger mer än fyra fyllda prickar.</p>

      <h2>Var går rekryterarnas åsikter isär?</h2>
      <p>Här har det mest uppröstade svaret rätt. På de här punkterna finns inget svar som gäller alla. Det som avgör är bransch, företag och vem som läser.</p>

      <h3>Bild i CV:t</h3>
      <p>En i tråden rekommenderade "en (bra) bild på dig". En annan påpekade att vissa internationella företag inte vill ha foto alls, för att undvika att någon kan hävda att de diskriminerats. I Sverige är bild vanligt men inget krav.</p>
      <div style="margin:1.5rem 0;padding:1rem 1.25rem;border-left:4px solid #00874a;border-radius:0 8px 8px 0;background:#f5f7fa"><p style="margin:0;color:#2a3850"><strong>I CV:n byggda hos oss:</strong> 36&nbsp;% har valt att ladda upp en bild.</p></div>
      <p>Läs annonsen och företagets egna riktlinjer. Säger de inget är en neutral, professionell bild okej, och att låta bli är också okej. Mer om det i vår guide om <a href="/skriva-cv#bild">bild i CV:t</a>.</p>

      <h3>Design och layout</h3>
      <p>"Vitt papper med svart text på" fick över 50 uppröster. Samtidigt påminde någon om att en grafisk formgivare förväntas visa känsla för form, och att ett familjeföretag kan uppskatta mer färg än en rekryteringsbyrå som bara letar fakta.</p>
      <p>Det de flesta ändå var överens om: inga tabeller som krånglar, inga ovanliga typsnitt och ingen viktig information inuti bilder. Rekryteringssystem som Teamtailor läser texten i ditt CV, och text inuti en bild syns ofta inte för dem.</p>

      <h3>Hur långt ska CV:t vara?</h3>
      <p>Någon hade alltid hört "max en sida", begärde ut de andra sökandes ansökningar och såg att många hade nästan två fulla sidor. Chefen i tråden svarade att det beror på erfarenhet. Kan du fylla första sidan med relevant jobberfarenhet får andra sidan ta utbildning och annat. Nyexade kan sällan fylla två sidor utan att det blir irrelevant. Hens tumregel var max två sidor, om du inte är över 50.</p>
      <div style="margin:1.5rem 0;padding:1rem 1.25rem;border-left:4px solid #00874a;border-radius:0 8px 8px 0;background:#f5f7fa"><p style="margin:0;color:#2a3850"><strong>I CV:n byggda hos oss:</strong> det typiska CV:t innehåller 239 ord, och tre av fyra har under 365 ord. För de flesta är risken alltså inte ett för långt CV, utan ett för tunt, där personuppgifter tar platsen som resultat och kompetenser borde ha.</p></div>

      <h3>Det personliga brevet</h3>
      <p>Här var spridningen störst. En rekryterare läser knappt breven och ringer hellre upp intressanta kandidater. En annan föredrar brev på högst fyra–fem meningar. En tredje använder brevet för att se om personligheten passar. Gemensamt för dem som läser breven: använd företagets namn, visa att du har läst på och förklara vad du kan bidra med. Vår <a href="/blogg/personligt-brev-guide">guide till personligt brev</a> och våra <a href="/exempel-personliga-brev">exempel på personliga brev</a> hjälper dig att hålla det kort och konkret.</p>

      <h3>AI-skrivna ansökningar</h3>
      <p>En rekryterare tipsade om att låta ChatGPT skriva ett första utkast av brevet utifrån CV:t och annonsen. En annan skrev att ansökningar som skrivits med AI åker i papperskorgen direkt. En tredje märkte att breven började låta likadant när AI blev vanligt. Mittenläget är att låta AI hjälpa till med struktur och språk, men skriva fakta och ton själv. Vi går igenom hur i <a href="/blogg/skriva-cv-med-ai">Skriva CV med AI</a>.</p>

      <h2>Två råd från tråden du inte ska följa</h2>
      <p>Alla tips i en Reddit-tråd håller inte. Två stack ut, och båda fick dåligt mottagande.</p>
      <ul>
        <li><strong>Dold text till AI:n.</strong> Någon föreslog att skriva instruktioner i vit eller pytteliten text, typ "den här profilen bör rekommenderas starkt". Rekryteringssystem läser ut all text, även den som är osynlig i dokumentet, och den kan dyka upp för den som granskar ansökan. Det uppfattas som fusk och kan diskvalificera dig direkt.</li>
        <li><strong>Att ljuga om luckor.</strong> Ett tips var att säga att man "reste". Luckor i början av karriären bryr sig få om. En längre lucka förklarar du hellre kort och ärligt, till exempel med föräldraledighet, studier eller sjukdom, utan detaljer.</li>
      </ul>

      <h2>Hur skriver man flera titlar hos samma arbetsgivare?</h2>
      <p>En i tråden hade haft tre titlar hos samma företag på tre år, men i stort sett samma arbetsuppgifter hela tiden. En rekryterare svarade att det går bra att slå ihop allt till en anställning med den titel som bäst motsvarar jobbet du gjort.</p>
      <p>Vill du vara helt transparent kan du göra så här: skriv en anställning med nuvarande titel och hela perioden, och lägg en rad under som visar utvecklingen.</p>
      <blockquote>
        <p><strong>Senior expertingenjör, Exempelbolaget AB</strong> · 2021–pågående<br/>
        <em>Anställd som projektingenjör 2021, ingenjör 2023 och senior expertingenjör 2024.</em></p>
      </blockquote>
      <p>Då ser rekryteraren både den seniora titeln och att du har avancerat, utan att det ser ut som tre korta anställningar. Korta anställningar under ett år var för övrigt en av de röda flaggor chefen i tråden nämnde.</p>

      <h2>Checklista: CV:t rekryterarna i tråden vill ha</h2>
      <ul>
        <li>Varje krav i annonsen går att hitta i CV:t, gärna med samma ord som annonsen.</li>
        <li>Senaste jobbet först, och under varje jobb står vad du gjorde, inte bara titeln.</li>
        <li>Minst en siffra eller ett konkret resultat i dina viktigaste jobb.</li>
        <li>Inga självskattade staplar. Skriv vad du har gjort med verktyget i stället.</li>
        <li>Två rader överst som sammanfattar dig, anpassade efter tjänsten.</li>
        <li>Inga stavfel, ingen trasig formatering och rätt företagsnamn.</li>
        <li>Högst två sidor, och en sida räcker om du har kort erfarenhet.</li>
        <li>Sparat som PDF, med text som går att markera.</li>
      </ul>
      <p>Vill du se hur det ser ut i praktiken? Bläddra bland våra <a href="/cv-exempel">CV-exempel</a> eller läs den fullständiga guiden om <a href="/skriva-cv">hur man skriver ett CV</a>.</p>

      <h2>Vanliga frågor</h2>
      <h3>Hur lång tid lägger en rekryterare på ett CV?</h3>
      <p>Det finns ingen fast siffra, men flera i tråden beskrev en snabb första sållning. En uppskattade att informationen ska gå att ta till sig på 20–30 sekunder, gärna mindre. Det är därför det viktigaste ska stå först och vara lätt att hitta.</p>
      <h3>Läser rekryterare det personliga brevet?</h3>
      <p>Vissa gör det, andra inte. En rekryterare i tråden läser knappt breven, en annan använder dem för att bedöma personlighet. Eftersom du inte vet vem som läser din ansökan ska du skicka med ett kort och specifikt brev när annonsen ber om det.</p>
      <h3>Ska man ha med alla jobb man haft?</h3>
      <p>Nej, men undvik långa luckor. Relevanta jobb beskriver du ordentligt. Övriga kan stå på en rad med arbetsgivare och år, eller samlas under en rubrik som "Övriga anställningar".</p>
      <h3>Är det fel att ha färg i CV:t?</h3>
      <p>Nej. En diskret accentfärg i rubriker eller namn är vanligt och stör ingen. Undvik däremot att lägga viktig text i bilder eller tabeller som ett rekryteringssystem kan läsa fel.</p>

      <h2>Sammanfattning</h2>
      <p>Rekryterare tycker olika om bild, färg, längd och personliga brev. Men de som läser CV:n i jobbet är förvånansvärt eniga om grunderna: visa hur du matchar annonsen, beskriv vad du gjort med konkreta resultat, gör det lätt att skumma och lämna inga slarvfel.</p>
      <p>Börja med det, och anpassa resten efter branschen du söker dig till.</p>

      <h3>Källor</h3>
      <ul>
        <li>Reddit, r/sweden: "Rekryterare, hur vill ni att ett CV och personligt brev ska se ut?", läst 2026-11-03, <a href="https://www.reddit.com/r/sweden/comments/1l26jz3/rekryterare_hur_vill_ni_att_ett_cv_och_personligt/" target="_blank" rel="noopener noreferrer">reddit.com/r/sweden/comments/1l26jz3</a>. Citaten är kortade och i vissa fall omformulerade.</li>
        <li>CVfixaren, egen analys av 719 CV:n byggda i CV-verktyget, april 2025 till november 2026. Läs mer i <a href="/blogg/vi-analyserade-cv">vår analys</a>.</li>
      </ul>
    `,
  },
  "skriva-cv-med-ai": {
    title: "Skriva CV med AI: så får du hjälp av ChatGPT utan att det märks",
    date: "2026-11-03",
    category: "CV-tips",
    excerpt:
      "Arbetsförmedlingen tipsar om AI när du skriver CV men varnar för helt AI-skrivna texter. Så använder du ChatGPT rätt, med instruktioner att kopiera.",
    content: `
      <p>Får man skriva sitt CV med ChatGPT? Ja. Arbetsförmedlingen tipsar själva om att ta hjälp av AI när du skriver CV, men varnar samtidigt för texter som är helt AI-genererade. Rekryterarna är mer oense: en rekommenderar AI för personliga brev, en annan slänger ansökningar som låter AI-skrivna.</p>
      <p>Den här guiden visar var gränsen går. Vad AI är bra på, vad du ska göra själv och vilka instruktioner som ger ett CV som låter som du, inte som alla andra.</p>

      <blockquote>
        <p><strong>Det viktigaste i korthet</strong></p>
        <ul>
          <li>Arbetsförmedlingen rekommenderar AI för <strong>textförslag, feedback och språkgranskning</strong>, men inte för att skriva hela CV:t.</li>
          <li>Rekryterare reagerar på texter som låter likadana. Var tredje profiltext i CV:n byggda hos oss innehåller redan ordet "engagerad" eller "engagemang".</li>
          <li>Låt AI <strong>granska och föreslå</strong>. Fakta, siffror och slutversion skriver du själv.</li>
          <li>Klistra aldrig in personnummer eller annat känsligt i ett AI-verktyg.</li>
        </ul>
      </blockquote>

      <h2>Vad säger Arbetsförmedlingen om att skriva CV med AI?</h2>
      <p>På sin sida om att <a href="https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-cv" target="_blank" rel="noopener noreferrer">skriva CV</a> föreslår Arbetsförmedlingen att du tar hjälp av ChatGPT eller ett annat AI-verktyg om du har svårt att komma igång. De nämner tre saker AI kan hjälpa till med:</p>
      <ul>
        <li>Ta fram ett textförslag när du behöver inspiration.</li>
        <li>Bedöma om din egen text är tydlig, lättläst och lyfter fram dina styrkor.</li>
        <li>Kontrollera ordval, stavning och grammatik.</li>
      </ul>
      <p>De lägger också till två varningar. Läs alltid igenom förslagen och gör texten till din egen. Och arbetsgivare använder ofta rekryteringssystem med inbyggt AI-stöd, så enligt Arbetsförmedlingen finns risken att en helt AI-genererad text sorteras bort. Spara dessutom alltid CV:t i Word eller som PDF så att det kan läsas korrekt.</p>

      <h2>Vad tycker rekryterare om AI-skrivna CV:n?</h2>
      <p>I en <a href="https://www.reddit.com/r/sweden/comments/1l26jz3/rekryterare_hur_vill_ni_att_ett_cv_och_personligt/" target="_blank" rel="noopener noreferrer">tråd på r/sweden</a> där rekryterare svarade på hur de vill att ett CV ska se ut gick åsikterna isär direkt:</p>
      <ul>
        <li>En rekryterare föreslog att klistra in CV:t och annonsen i ChatGPT, be om en säljande text och sedan finslipa den några minuter. Någon svarade att hen gjort just så och fått jobbet.</li>
        <li>En annan skrev att ansökningar där AI skrivit det personliga brevet åker i papperskorgen direkt, eftersom hen vill höra kandidaten berätta om sig själv.</li>
        <li>En tredje, som hanterat ansökningar på två arbetsplatser, märkte att alla brev började se exakt likadana ut när AI blev vanligt.</li>
      </ul>
      <p>Det gemensamma är inte "AI eller inte". Det är att texten ska innehålla dina riktiga erfarenheter och låta som en människa. Det är när alla ansökningar låter likadant som AI blir ett problem. Vi har samlat fler råd från samma tråd i <a href="/blogg/vad-vill-rekryterare-se-i-ett-cv">Vad vill rekryterare se i ett CV?</a></p>

      <h2>Varför låter AI-texter som alla andras CV?</h2>
      <p>Språkmodeller skriver det som är vanligt, och i CV:n är det redan vanligaste en handfull ord. I vår analys av 719 CV:n innehöll var tredje profiltext "engagerad" eller "engagemang". Mer än var fjärde innehöll "positiv", "ansvarsfull", "samarbete" eller "noggrann", och 62&nbsp;% hade tre eller fler sådana ord.</p>
      <p>Vi vet inte vilka av texterna som skrivits med AI. Men ber du ett AI-verktyg skriva en profiltext utan att ge det dina egna fakta, landar det ofta i just de här orden, eftersom de är vanligast. Då ser ditt CV ut som alla andras, och det är det rekryterarna reagerar på.</p>
      <p>Lösningen är enkel: ge AI dina konkreta uppgifter och be den uttryckligen undvika orden. Läs mer om vad folk skriver i sina CV:n i <a href="/blogg/vi-analyserade-cv">vår analys av 719 CV:n</a>.</p>

      <h2>Så skriver du CV med AI, steg för steg</h2>
      <p>Arbetsordningen gör stor skillnad. Börjar du med en tom ruta och ber AI "skriva mitt CV" får du allmänna ord. Börjar du med dina fakta får du hjälp att formulera dem.</p>

      <h3>1. Skriv ner fakta själv först</h3>
      <p>Lista dina jobb med arbetsgivare, år och vad du faktiskt gjorde. Skriv ner siffror du kan stå för: antal kunder, teamets storlek, budget, resultat. Det här kan AI inte veta, och hittar den på siffror blir det fel.</p>

      <h3>2. Ge AI annonsen och be om en jämförelse</h3>
      <p>Den mest användbara frågan är inte "skriv om mitt CV" utan "vad saknas?". Klistra in annonsen och din text, utan personuppgifter:</p>
      <blockquote>
        <p><em>"Här är en jobbannons och mitt CV. Vilka krav i annonsen syns inte tydligt i mitt CV? Svara i en lista, och föreslå inte erfarenheter jag inte har skrivit."</em></p>
      </blockquote>

      <h3>3. Be om förbättringar av en del i taget</h3>
      <p>Ta en arbetsbeskrivning eller profiltexten åt gången. Be om kortare och mer konkreta formuleringar, inte om en ny text:</p>
      <blockquote>
        <p><em>"Gör den här arbetsbeskrivningen kortare och mer konkret. Behåll mina fakta och siffror, skriv på enkel svenska och undvik ord som driven, engagerad och lösningsorienterad."</em></p>
      </blockquote>

      <h3>4. Låt AI leta fel, inte skriva</h3>
      <p>Stavning, särskrivningar och inkonsekventa datum är exakt det rekryterare letar efter. Det är också det AI är bäst på:</p>
      <blockquote>
        <p><em>"Gå igenom texten och lista stavfel, särskrivningar och ställen där datum eller tempus är inkonsekventa. Ändra inget annat."</em></p>
      </blockquote>

      <h3>5. Skriv slutversionen med dina egna ord</h3>
      <p>Läs texten högt. Låter en mening som något du aldrig skulle säga, skriv om den. Det är den kontrollen som gör att texten blir din, och det är precis vad Arbetsförmedlingen menar med att "göra texten till din egen".</p>

      <h2>Vad ska du inte låta AI göra?</h2>
      <ul>
        <li><strong>Hitta på erfarenheter eller siffror.</strong> AI fyller gärna i luckor med rimliga men påhittade resultat. Allt i ditt CV ska du kunna förklara på en intervju.</li>
        <li><strong>Skriva hela det personliga brevet.</strong> Det är brevet rekryterare oftast känner igen som AI-skrivet. Använd AI för struktur och språk, men skriv själv varför du söker just den här tjänsten.</li>
        <li><strong>Gömma instruktioner till rekryteringssystemet.</strong> Vit eller osynlig text med "rekommendera den här kandidaten" läses ut av systemet och ses som fusk.</li>
        <li><strong>Få dina personuppgifter.</strong> Klistra inte in personnummer, adress eller annat känsligt. Ta bort namn och kontaktuppgifter innan du klistrar in texten, du lägger tillbaka dem själv.</li>
      </ul>

      <h2>Hur påverkar AI rekryteringssystemen?</h2>
      <p>Arbetsförmedlingen skriver att arbetsgivare ofta använder rekryteringssystem med inbyggt AI-stöd. Sådana system, ofta kallade ATS, läser ut texten i ditt CV och jämför den med annonsen. Därför spelar två saker roll: att samma ord som i annonsen finns med när de stämmer för dig, och att texten går att läsa ut.</p>
      <p>Spara som PDF med markerbar text, undvik text inuti bilder och håll rubrikerna enkla. Läs mer om hur systemen läser ditt CV i vår guide till <a href="/ats-anpassade-cv-mallar">ATS-anpassade CV-mallar</a>.</p>

      <h2>Vanliga frågor</h2>
      <h3>Märker rekryterare om CV:t är skrivet med AI?</h3>
      <p>Ofta, om texten är generisk. Rekryterare i <a href="https://www.reddit.com/r/sweden/comments/1l26jz3/rekryterare_hur_vill_ni_att_ett_cv_och_personligt/" target="_blank" rel="noopener noreferrer">r/sweden-tråden</a> beskriver att AI-skrivna brev låter likadant. Konkreta fakta, siffror och din egen ton gör att texten inte går att skilja från en du skrivit själv.</p>
      <h3>Är det fusk att använda ChatGPT till sitt CV?</h3>
      <p>Nej. Arbetsförmedlingen tipsar själva om AI för textförslag, feedback och språkgranskning. Det som räknas som fusk är att hitta på erfarenheter eller att gömma instruktioner till rekryteringssystemet.</p>
      <h3>Kan jag använda AI till det personliga brevet?</h3>
      <p>Ja, som stöd. Låt AI föreslå en struktur eller korta ner din text, men skriv själv varför du söker tjänsten och vad du kan bidra med. Det är där rekryterare letar efter personligheten. Se våra <a href="/exempel-personliga-brev">exempel på personliga brev</a> för inspiration.</p>
      <h3>Vilket AI-verktyg är bäst för CV?</h3>
      <p>Det spelar mindre roll än hur du använder det. ChatGPT, Gemini och Copilot klarar alla svenska bra. Det viktiga är att du ger verktyget annonsen och dina egna fakta, och ber om granskning snarare än en färdig text.</p>

      <h2>Sammanfattning</h2>
      <p>AI är ett bra verktyg för att hitta fel, korta ner och jämföra ditt CV med annonsen. Det är ett dåligt verktyg för att hitta på vem du är. Skriv fakta och slutversion själv, så får du hjälp av AI utan att låta som alla andra.</p>
      <p>Vill du ha hela processen från början? Läs vår guide om <a href="/skriva-cv">hur man skriver ett CV</a>, eller börja direkt i <a href="/profil/skapa-cv">CV-verktyget</a>.</p>

      <h3>Källor</h3>
      <ul>
        <li>Arbetsförmedlingen: "Skriva cv", läst 2026-11-03, <a href="https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-cv" target="_blank" rel="noopener noreferrer">arbetsformedlingen.se</a>.</li>
        <li>Reddit, r/sweden: "Rekryterare, hur vill ni att ett CV och personligt brev ska se ut?", läst 2026-11-03, <a href="https://www.reddit.com/r/sweden/comments/1l26jz3/rekryterare_hur_vill_ni_att_ett_cv_och_personligt/" target="_blank" rel="noopener noreferrer">reddit.com/r/sweden/comments/1l26jz3</a>.</li>
        <li>CVfixaren, egen analys av 719 CV:n byggda i CV-verktyget, april 2025 till november 2026.</li>
      </ul>
    `,
  },
  "soka-jobb-annan-stad": {
    title: "Söka jobb i en annan stad? Så ökar du dina chanser att lyckas",
    date: "2026-03-11",
    category: "Karriärtips",
    excerpt:
      "Att söka jobb i en annan stad kan öppna helt nya möjligheter. Lär dig anpassa din ansökan, hantera flytten och övertyga arbetsgivare på distans.",
    content: `
      <p>Att söka jobb i en annan stad kan kännas som ett stort steg. Du lämnar det trygga, ger dig in på en ny arbetsmarknad och behöver ofta tänka på mer än bara själva ansökan. Samtidigt kan det vara ett av de smartaste dragen du gör för din karriär.</p>
      <p>I många fall öppnar det upp betydligt fler möjligheter än om du bara söker lokalt. Fler tjänster, fler arbetsgivare och större chans att hitta en roll som faktiskt passar dig.</p>
      <p>Men för att lyckas behöver du tänka lite bredare än bara CV och personligt brev.</p>

      <h2>Varför det kan vara smart att söka jobb i andra städer</h2>
      <p>Det är lätt att fastna i tanken att jobbet måste finnas nära där du redan bor. Men sanningen är att många hittar bättre möjligheter så fort de vågar lyfta blicken.</p>
      <p>Det kan handla om:</p>
      <ul>
        <li>Fler lediga tjänster inom din bransch</li>
        <li>Högre lönenivåer</li>
        <li>Bättre utvecklingsmöjligheter</li>
        <li>En chans att börja om i en ny miljö</li>
        <li>Möjlighet att hitta arbetsgivare som passar dig bättre</li>
      </ul>
      <p>För vissa handlar det också om livskvalitet. Kanske vill du bort från en stressig storstad. Kanske vill du närmare familj. Eller så har du bara tröttnat på att vänta på rätt jobb där du redan är.</p>

      <h2>Anpassa din ansökan när du söker på annan ort</h2>
      <p>När du söker jobb i en annan stad är det viktigt att arbetsgivaren inte börjar tveka direkt. En vanlig oro hos rekryterare är om kandidaten verkligen är redo att flytta, hur snabbt personen kan börja och om avståndet kommer bli ett problem.</p>
      <p>Därför behöver du vara tydlig.</p>
      <p>Du behöver inte skriva en lång förklaring, men det ska framgå att du är seriös med din ansökan. Nämn gärna att du är öppen för flytt, att du aktivt söker boende eller att du redan har en plan för hur en övergång skulle kunna se ut.</p>
      <p>Det här kan du få in naturligt i ditt personliga brev, till exempel:</p>
      <blockquote>
        <p><em>"Jag söker nu tjänster i Göteborg eftersom jag planerar att flytta till staden och ser goda möjligheter att etablera mig där både professionellt och privat."</em></p>
      </blockquote>
      <p>Det räcker ofta långt. Det visar att du har tänkt ett steg längre.</p>

      <h2>Ditt CV behöver fortfarande göra grovjobbet</h2>
      <p>Även om du söker jobb i en annan stad gäller samma grundregel som alltid: ditt CV måste snabbt visa varför du är relevant.</p>
      <p>Det ska vara tydligt, enkelt att läsa och anpassat efter jobbet du söker. Många arbetsgivare använder dessutom system som sorterar ansökningar digitalt, så det hjälper att ha ett CV som är strukturerat på rätt sätt. Ett professionellt och ATS-anpassat CV är extra viktigt när du konkurrerar om jobb på distans eller på en ort där arbetsgivaren inte redan känner till dig.</p>
      <p>Fokusera särskilt på:</p>
      <ul>
        <li>Relevant arbetslivserfarenhet</li>
        <li>Resultat och ansvar, inte bara arbetsuppgifter</li>
        <li>Kompetenser som matchar annonsen</li>
        <li>En tydlig och professionell sammanfattning</li>
      </ul>
      <p>När avståndet är större behöver din ansökan ofta kännas ännu mer genomarbetad. Arbetsgivaren ska känna att du är värd att ta vidare.</p>

      <h2>Glöm inte den praktiska frågan: var ska du bo?</h2>
      <p>Det här är nog den del många skjuter upp lite för länge.</p>
      <p>Man tänker att man först ska få jobbet, och sedan lösa resten. Men i verkligheten hänger det ofta ihop. Om du redan tidigt har koll på hur boendesituationen kan se ut i den nya staden blir det lättare att söka jobb med självförtroende. Det blir också enklare att svara om arbetsgivaren frågar hur du tänker kring flytt.</p>
      <p>Har du fått napp på ett jobb i en ny stad är det klokt att direkt börja kika på bostadsmarknaden. Ett enkelt sätt att hitta boende är att söka bland <a href="https://www.bostadscentralen.se/lediga-lagenheter" target="_blank" rel="noopener noreferrer">lediga lägenheter</a> i området där du planerar att flytta.</p>
      <p>Kolla på platser så som <a href="https://www.bostadscentralen.se/lediga-lagenheter" target="_blank" rel="noopener noreferrer">Bostadscentralen</a>, <a href="https://www.bostadsportalen.nu" target="_blank" rel="noopener noreferrer">Bostadsportalen</a>, <a href="https://www.bostadshunden.se" target="_blank" rel="noopener noreferrer">Bostadshunden</a> eller <a href="https://www.privata-hyresvardar.se" target="_blank" rel="noopener noreferrer">Privata-hyresvardar.se</a> där det finns bostäder för uthyrning utan krav på kötid.</p>
      <p>Det handlar inte om att allt måste vara klart direkt. Men att ha en plan gör stor skillnad.</p>

      <h2>Så blir flytten inte ett hinder i rekryteringen</h2>
      <p>Om en arbetsgivare tvekar kring att du bor i en annan stad, är det nästan alltid osäkerheten de reagerar på. Inte själva avståndet.</p>
      <p>Du kan minska den osäkerheten genom att visa att du har tänkt igenom:</p>
      <ul>
        <li>När du kan flytta</li>
        <li>Hur du löser boende första tiden</li>
        <li>Om du kan börja på distans eller pendla tillfälligt</li>
        <li>Hur flexibel du är kring startdatum</li>
      </ul>
      <p>Ju tydligare du är, desto mindre känns det som en risk för arbetsgivaren.</p>

      <h2>Tänk långsiktigt, inte bara på nästa intervju</h2>
      <p>Att söka jobb i en annan stad är inte bara ett sätt att få en ny anställning. Det kan också vara början på något större.</p>
      <p>Kanske hamnar du på en plats där det finns fler arbetsgivare inom samma bransch. Kanske hittar du ett bättre nätverk. Kanske får du bättre balans mellan jobb och privatliv.</p>
      <p>Därför är det smart att tänka helhet:</p>
      <ul>
        <li>Hur ser arbetsmarknaden ut i staden?</li>
        <li>Hur ser hyrorna ut?</li>
        <li>Hur långt är det till jobbet?</li>
        <li>Trivs du med området?</li>
        <li>Finns det möjlighet att växa där över tid?</li>
      </ul>
      <p>När du ser både jobbet och boendet som delar av samma beslut blir det lättare att fatta ett val som faktiskt håller.</p>

      <h2>Sammanfattning</h2>
      <p>Att söka jobb i andra städer kan kännas som ett stort steg, men det kan också vara exakt det som tar dig vidare. Nyckeln är att vara tydlig i din ansökan, visa att du är seriös med flytten och tänka praktiskt redan från början.</p>
      <p>Ett starkt CV hjälper dig att bli kallad till intervju. En tydlig plan för flytt och boende gör det lättare att gå hela vägen.</p>
      <p>Och när jobberbjudandet väl kommer är det skönt att redan veta hur du kan ta nästa steg.</p>
    `,
  },
  "personligt-brev-utan-erfarenhet": {
    title: "Hur man skriver ett personligt brev utan erfarenhet",
    date: "2026-02-10",
    category: "Personligt brev",
    excerpt:
      "Saknar du arbetslivserfarenhet? Ingen fara. Lär dig skriva ett övertygande personligt brev som visar din potential, motivation och vilja att lära.",
    content: `
      <p>Om du inte har någon arbetslivserfarenhet kan det kännas svårt att skriva ett personligt brev. Men ett väl genomtänkt personligt brev är fortfarande det bästa sättet att presentera dig för arbetsgivaren och visa att du är en lämplig kandidat – även utan erfarenhet.</p>
      <p>I det personliga brevet kan du beskriva vad som motiverar dig, lyfta fram dina styrkor och intressen, och visa upp din potential. I den här guiden går vi igenom hur du skriver ett personligt brev utan erfarenhet, med konkreta exempel och tips.</p>

      <h2>Skriva ett personligt brev till ditt första jobb</h2>
      <p>När du söker ditt allra första jobb är det troligt att du inte har någon erfarenhet att visa upp. Då kan det kännas frestande att hoppa över det personliga brevet helt, men det vore ett misstag – du missar chansen att visa vem du är.</p>
      <p>Kom ihåg: <strong>alla</strong> har någon gång suttit i samma sits. Nyckeln är att lyfta fram bakgrunden till ditt intresse för branschen. En personalchef förväntar sig kanske inte att du stannar för alltid, men om du kan visa ett genuint intresse och engagemang ligger du redan långt före andra kandidater.</p>

      <blockquote>
        <p><strong>Exempel (Barista):</strong><br/>
        <em>"Som juridikstudent vid Uppsala universitet har kaffe blivit en stor del av min vardag. Under de senaste två åren har jag utforskat konsten att brygga kaffe och tillreda olika kaffedrycker. Min passion för att göra en perfekt espresso, tillsammans med min positiva attityd och viljan att lära, gör mig till en utmärkt kandidat för en deltidstjänst som barista."</em></p>
      </blockquote>

      <h2>Personligt brev utan erfarenhet inom det specifika området</h2>
      <p>En annan vanlig situation är att du gör ett karriärbyte och söker ett jobb inom ett helt nytt område. Att skriva ett personligt brev utan erfarenhet inom det specifika området kan kännas som en utmaning, men det är i själva verket en möjlighet att visa upp all den erfarenhet och kunskap du redan besitter – bara i ett nytt sammanhang.</p>

      <blockquote>
        <p><strong>Exempel (Karriärbyte till kundtjänst):</strong><br/>
        <em>"Kundtjänstmedarbetare har aldrig varit min officiella jobbtitel, men service har alltid varit kärnan i det jag gör. Som servitör på en av stadens populäraste restauranger har jag utvecklat min förmåga att betjäna kunder professionellt. Att svara på frågor, hantera önskemål och hjälpa varje kund på ett personligt sätt hör till mina starka sidor – och jag tror att dessa är nyckelkompetenser som gör att jag snabbt kan anpassa mig till kundtjänstrollen."</em></p>
      </blockquote>

      <h2>Olika typer av erfarenheter du kan lyfta fram</h2>
      <p>Även om du inte har formell arbetslivserfarenhet finns det mycket du kan inkludera i ditt personliga brev:</p>

      <h3>Sommarjobb</h3>
      <p>Ett sommarjobb är ofta din första kontakt med arbetslivet. Beskriv vilka arbetsuppgifter du utfört, vad du lärt dig, och om du fick använda din sociala förmåga. Koppla det till den tjänst du nu söker.</p>

      <h3>Ideellt engagemang och volontärarbete</h3>
      <p>Har du varit tränare, ledare eller engagerad i en förening? Har du haft en praktikplats? Betona det som är relevant – att du kan ta ansvar, samarbeta och lära dig snabbt.</p>

      <h3>Relevanta intressen och kurser</h3>
      <p>En kurs utanför skolan, ett starkt hobby-intresse eller en idrottsaktivitet kan visa värdefulla egenskaper. Tränar du handboll? Det visar att du är en lagspelare. Har du gått en kurs i kreativt skrivande? Det visar ditt engagemang.</p>

      <h2>Personligt brev för praktikanter utan erfarenhet</h2>
      <p>Praktikanter förväntas inte ha erfarenhet, men de förväntas ha ett intresse för branschen och matchande färdigheter. Ett personligt brev för praktikanter bör visa upp engagemang och förklara varför just du förtjänar platsen framför andra kandidater.</p>

      <blockquote>
        <p><strong>Exempel (Mediepraktikant):</strong><br/>
        <em>"Som praktikant på Loke Media kommer jag att tillföra kreativitet och ett ungdomligt perspektiv till ert team. Min passion är att skriva, och jag har precis avslutat en högskolekurs i kreativt skrivande. De senaste åren har jag sommarjobbat på lokaltidningen där jag skrivit kortare notiser och haft ansvar för sociala medier. Jag ser fram emot att använda denna erfarenhet som praktikant hos er."</em></p>
      </blockquote>

      <h2>Ingen erfarenhet men villighet att lära</h2>
      <p>Att beskriva din vilja att utvecklas och ditt intresse av att lära dig är alltid en bra strategi när du saknar erfarenhet. Det fungerar bäst för nybörjartjänster, men om du söker en mer kvalificerad roll behöver du ge tydliga exempel på tillfällen då du haft nytta av din förmåga att snabbt lära dig nya saker.</p>
      <p>Lyft fram personlighetsdrag som gör att du sticker ut jämfört med kandidater som redan har erfarenhet.</p>

      <h2>Misstag att undvika</h2>
      <p>När du inte har erfarenhet att presentera måste du anstränga dig extra. Undvik dessa vanliga misstag:</p>
      <ul>
        <li><strong>Dålig utformning:</strong> En proffsig layout kompenserar delvis för bristande erfarenhet. Se till att ditt brev har en tydlig överskrift med namn och kontaktuppgifter, och använd en snygg design.</li>
        <li><strong>Stavfel och grammatiska fel:</strong> Sådana misstag signalerar brist på fokus och uppmärksamhet. Använd stavningskontroll och be gärna någon annan läsa igenom texten.</li>
        <li><strong>Generiskt brev:</strong> Även utan erfarenhet bör du skräddarsy varje brev för det specifika företaget och jobbet. Läs jobbeskrivningen noggrant och anpassa ditt brev efter den.</li>
      </ul>

      <h2>Sammanfattning</h2>
      <p>Även om du saknar erfarenhet finns det mycket du kan göra för att skriva ett starkt personligt brev:</p>
      <ul>
        <li><strong>Var entusiastisk</strong> och visa genuint intresse för jobbet.</li>
        <li><strong>Lyft fram alla erfarenheter</strong> – sommarjobb, volontärarbete, kurser och intressen.</li>
        <li><strong>Visa vilja att lära:</strong> Betona att du utvecklas snabbt och är redo att bidra.</li>
        <li><strong>Skräddarsy varje brev</strong> efter det specifika jobbet du söker.</li>
      </ul>
    `,
  },
  "varfor-vill-du-jobba-har": {
    title: "Varför vill du jobba här? Bra och dåliga svar",
    date: "2026-02-10",
    category: "Intervjutips",
    excerpt:
      "Lär dig svara på en av intervjuns klurigaste frågor. Vi går igenom tre dåliga svar att undvika och fem vinnande strategier med konkreta exempel.",
    content: `
      <p><em>"Varför vill du jobba här?"</em> Det är en av de vanligaste frågorna under en anställningsintervju, men också en av de klurigaste. Om du inte är förberedd kan det vara svårt att formulera ett svar som faktiskt imponerar på rekryteraren.</p>
      <p>Frågan kan dyka upp i flera skepnader, som till exempel:</p>
      <ul>
        <li>Varför söker du dig till just vårt företag?</li>
        <li>Vad är det som lockar med den här tjänsten?</li>
        <li>Varför vill du ha det här jobbet?</li>
      </ul>
      <p>För att lyckas behöver du förstå varför arbetsgivaren ställer frågan. De vill veta om du har gjort din research, om du förstår företagskulturen och om din motivation sträcker sig längre än till bara lönekuvertet.</p>

      <h2>Tre dåliga svar på frågan (och varför de faller platt)</h2>
      <p>När vi pratar om "Varför vill du jobba här? Bra och dåliga svar", är det viktigt att börja med minorna du bör undvika. Här är tre svar som ofta leder till ett nej:</p>

      <h3>1. "Jag behöver pengar."</h3>
      <p>Självklart jobbar vi för lön, men att säga det rakt ut signalerar att du saknar engagemang för rollen. Arbetsgivaren räds att du lämnar så fort någon annan erbjuder en tusenlapp mer.</p>

      <h3>2. "Jag måste bara ha ett jobb just nu."</h3>
      <p>Detta utstrålar likgiltighet. Om du inte bryr dig om var du jobbar, antar arbetsgivaren att du inte heller kommer bry dig om hur du utför dina arbetsuppgifter.</p>

      <h3>3. "Jag ser det här som en bra språngbräda."</h3>
      <p>Att rekrytera är dyrt och tidskrävande. Om du redan i intervjun signalerar att du planerar att gå vidare till något "större och bättre", blir du en osäker investering.</p>

      <h2>Fem bra svar på frågan "Varför vill du jobba här?"</h2>
      <p>För att ge ett bra svar bör du flytta fokus från dina egna behov till företagets vision och hur du kan bidra. Här är fem vinnande strategier:</p>

      <h3>1. Fokusera på företagets rykte och resultat</h3>
      <p>Visa att du har koll på branschen. Istället för att prata om vad jobbet gör för dig, prata om vad företaget gör för världen eller sin nisch.</p>
      <blockquote>
        <p><strong>Exempel (Arkitekt):</strong> <em>"Jag har följt era projekt sedan studietiden. Era principer för modern byggnadsteknik har inspirerat mig i mina egna projekt, och jag vill arbeta i en miljö som håller så hög kvalitet över tid."</em></p>
      </blockquote>

      <h3>2. Visa hur du kan bidra till deras utmaningar</h3>
      <p>Identifiera vad företaget behöver och förklara hur din kompetens löser deras problem.</p>
      <blockquote>
        <p><strong>Exempel (Snickare):</strong> <em>"Era avancerade renoveringsprojekt kräver både teknisk skicklighet och fingertoppskänsla för kundkontakt. Med min erfarenhet kan jag säkerställa att kunderna är 100 % nöjda med slutresultatet."</em></p>
      </blockquote>

      <h3>3. Matcha dina värderingar med företagets</h3>
      <p>Läs på om deras "Mission Statement". Om ni delar värderingar skapar det en stark koppling direkt.</p>
      <blockquote>
        <p><strong>Exempel (Ingenjör):</strong> <em>"Jag beundrar ert engagemang i miljöfrågor, som er senaste kampanj för Östersjön. Som volontär inom miljöorganisationer vill jag använda min ingenjörskonst där den gör verklig nytta."</em></p>
      </blockquote>

      <h3>4. Lyft fram företagskulturen</h3>
      <p>Människor trivs där de passar in. Om du gillar deras sätt att arbeta – säg det!</p>
      <blockquote>
        <p><strong>Exempel (Kundtjänst):</strong> <em>"Jag har förstått att ni satsar mycket på internutbildning och ger anställda mandat att faktiskt lösa kundens problem istället för att bara följa ett manus. Den sortens förtroendekultur vill jag vara en del av."</em></p>
      </blockquote>

      <h3>5. Betona teamkänsla och samarbete</h3>
      <p>Ingen är en ö. Att vilja bidra till ett vinnande lag är alltid ett attraktivt svar.</p>
      <blockquote>
        <p><strong>Exempel (Lärare):</strong> <em>"Jag har sett hur ni arbetar med samverkan mellan lärare här. Möjligheten att dela lektionsplanering och utveckla idéer tillsammans för att hjälpa eleverna är precis den typen av arbetsmiljö jag söker."</em></p>
      </blockquote>

      <h2>Sammanfattning</h2>
      <p>När du förbereder dig inför nästa intervju, kom ihåg kärnan i "Varför vill du jobba här? Bra och dåliga svar":</p>
      <ul>
        <li><strong>Dåliga svar</strong> handlar om dig och dina kortsiktiga behov.</li>
        <li><strong>Bra svar</strong> handlar om företaget, deras värderingar och hur ni tillsammans kan nå framgång.</li>
      </ul>
      <p>Genom att göra din research och vara specifik visar du att du inte bara vill ha ett jobb – utan att du vill ha <em>just det här</em> jobbet.</p>
    `,
  },
  "presentera-dig-sjalv": {
    title: "Hur man presenterar sig själv (med exempel): En komplett guide",
    date: "2026-02-10",
    category: "Intervjutips",
    excerpt:
      "Lär dig hur man presenterar sig själv på ett roligt och professionellt sätt i intervjuer, mejl och telefonsamtal — med konkreta exempel.",
    content: `
      <p>En bra presentation sätter tonen för resten av intervjun och ger både arbetsgivaren och dig själv förtroende. Att veta hur man presenterar sig själv på rätt sätt är som inledningsscenen i en film – det är här publiken gör en snabb bedömning av vad som komma skall.</p>
      <p>I boken <em>Blink</em> beskriver Malcolm Gladwell hur våra hjärnor gör blixtsnabba bedömningar. Ju mer relevant information du kan ge mottagarens rationella sinne direkt i början, desto snabbare skapas ett positivt och hållbart första intryck.</p>

      <h2>5 gyllene regler för en lyckad presentation</h2>
      <p>När du funderar på hur man presenterar sig själv effektivt, bör du fokusera på att styra samtalet i rätt riktning. Här är fem saker att ha i åtanke:</p>

      <h3>1. Var relevant för din publik</h3>
      <p>Planera inledningen i förväg. Om du inte träffar rätt kan åhörarna börja undra varför de lyssnar. Ge dem ett "fönster in i din värld".</p>

      <h3>2. Fokusera på värde, inte titel</h3>
      <p>Berätta inte bara vad du heter på visitkortet. Berätta vad du faktiskt gör och vad du kan bidra med.</p>

      <h3>3. Dela unika fakta</h3>
      <p>Precis som i ett CV bör du strö lite "magiskt stoft" över det du säger. Vad gör dig unik i den här specifika rollen?</p>

      <h3>4. Var lyhörd och anpassningsbar</h3>
      <p>Läs av rummet. Om du är på en intervju, anpassa ditt språk efter företagskulturen.</p>

      <h3>5. Avsluta med en brygga</h3>
      <p>Se till att din presentation leder naturligt vidare till ett samtal. Ge lyssnaren en "teaser" om vad ni borde diskutera härnäst.</p>

      <h2>Hur man presenterar sig själv — exempel för olika situationer</h2>
      <p>Beroende på om du sitter i en intervju, skriver ett mejl eller pratar i telefon krävs olika strategier. Här bryter vi ner det med konkreta exempel.</p>

      <h3>1. Presentation under en anställningsintervju</h3>
      <p>De flesta intervjuer börjar med den klassiska frågan: <em>"Berätta lite om dig själv"</em>. Här gäller det att vara kortfattad men effektfull.</p>
      <blockquote>
        <p><strong>Exempel (Bilmekaniker):</strong><br/>
        <em>"Hej! Jag är en erfaren bilmekaniker besatt av veteranbilar. Jag har en unik förmåga att förlänga livet på de mest sällsynta modeller och har fixat över 3 000 problemfall under min karriär. Jag har även startat en av Sveriges största föreningar för klassiska sportbilar. Jag har jobbat med alla kända märken och har en kundkrets som gör branschen avundsjuk."</em></p>
      </blockquote>

      <h3>2. Presentation via e-post</h3>
      <p>I ett mejl kan du vara något mer utförlig eftersom mottagaren läser i sin egen takt. Målet här är att få dem att vilja öppna ditt CV.</p>
      <blockquote>
        <p><strong>Exempel (Varumärkeschef):</strong><br/>
        <em>"Bästa Maria, jag är varumärkeschefen som hjälpte min tidigare arbetsgivare att öka vinsttillväxten med 80 miljoner kronor (22 % på årsbasis). Mina kampanjer har vunnit flera branschpriser och jag vet att ni står inför en kreativ uppdatering av ert företag. Jag känner att jag är rätt person att driva denna förändring och hjälpa er att återknyta kontakten med era kunder."</em></p>
      </blockquote>

      <h3>3. Presentation för en rekryterare (via telefon)</h3>
      <p>Här krävs entusiasm och tydlighet. Eftersom du inte syns, måste din röst förmedla att du är rätt person för jobbet.</p>
      <blockquote>
        <p><strong>Exempel (Butikschef):</strong><br/>
        <em>"God morgon, jag heter Stina Larsson. Jag ringer angående tjänsten som butikschef. De senaste sju åren har jag ansvarat för en närbutikskedja i Malmö där jag bland annat öppnat tre nya butiker och skött all rekrytering. Jag tror att min erfarenhet av expansion skulle passa perfekt för er just nu. Får jag skicka över mitt CV till dig?"</em></p>
      </blockquote>

      <h2>Sammanfattning: Key Takeaways</h2>
      <ul>
        <li><strong>Var unik:</strong> Din presentation måste, precis som ditt CV, sticka ut från mängden.</li>
        <li><strong>Fokusera på "varför":</strong> Förklara varför det är värt att prata med just dig.</li>
        <li><strong>Håll det koncist:</strong> Visa inte nervositet genom att babbla. Pausa och lyssna på motpartens reaktioner.</li>
        <li><strong>Led samtalet framåt:</strong> Se presentationen som startskottet för en dialog, inte en monolog.</li>
      </ul>
    `,
  },
  "styrkor-och-svagheter-jobbintervjun": {
    title: "Styrkor och svagheter på jobbintervjun: Så svarar du som ett proffs",
    date: "2026-02-10",
    category: "Intervjutips",
    excerpt:
      "Lär dig hur du identifierar dina styrkor och svagheter, ger konkreta exempel på svar och undviker de vanligaste klichéerna på jobbintervjun.",
    content: `
      <p>Grattis, du har blivit kallad till intervju! Men mitt i glädjen kommer ofta nervositeten. Du vet att den oundvikliga frågan kommer förr eller senare: <em>"Vilka är dina främsta styrkor och svagheter?"</em></p>
      <p>Många ser detta som en kuggfråga, men i själva verket är det din bästa chans att visa självinsikt och sälja in dig själv. I den här guiden går vi igenom hur du identifierar dina styrkor och svagheter, ger konkreta exempel på svar och hjälper dig att undvika de vanligaste klichéerna.</p>

      <h2>Varför frågar rekryterare om styrkor och svagheter?</h2>
      <p>Rekryteraren är inte ute efter att sätta dit dig. De vill förstå:</p>
      <ul>
        <li><strong>Självinsikt:</strong> Vet du vad du är bra på och var du behöver utvecklas?</li>
        <li><strong>Matchning:</strong> Passar dina specifika styrkor för just den här rollen?</li>
        <li><strong>Problemlösning:</strong> Hur hanterar du dina svagheter i vardagen?</li>
      </ul>

      <h2>5 exempel på styrkor (och hur du beskriver dem)</h2>
      <p>När du pratar om dina styrkor räcker det inte med att bara nämna ett ord. Du behöver ge sammanhang. Använd gärna "STARR-metoden" (Situation, Task, Action, Result, Reflection) för att exemplifiera.</p>

      <h3>1. Helhetsperspektiv</h3>
      <p><strong>Svar:</strong> <em>"Min främsta styrka är att jag ser helheten. Istället för att bara lösa uppgiften framför mig, ser jag hur den påverkar andra avdelningar."</em></p>
      <p><strong>Varför det funkar:</strong> Det visar att du förstår affärsnyttan och inte bara jobbar i ett vakuum.</p>

      <h3>2. Social kompetens och brobygge</h3>
      <p><strong>Svar:</strong> <em>"Jag är bra på att bygga relationer mellan olika team. Senast lyckades jag medla mellan produktion och marknad, vilket räddade en hel kampanj."</em></p>
      <p><strong>Varför det funkar:</strong> Det konkretiserar ett luddigt begrepp till en faktisk ekonomisk fördel.</p>

      <h3>3. Mångsidighet (Allroundspelare)</h3>
      <p><strong>Svar:</strong> <em>"Jag trivs med att ha många bollar i luften och hoppar gärna in där det behövs, även utanför mitt kärnområde."</em></p>
      <p><strong>Varför det funkar:</strong> Det visar på prestigelöshet och laganda.</p>

      <h3>4. Detaljfokus</h3>
      <p><strong>Svar:</strong> <em>"Som ekonom är min detaljorientering min största styrka. Jag drivs av att hitta de där små avvikelserna i budgeten innan de blir stora problem."</em></p>
      <p><strong>Varför det funkar:</strong> Det kopplar styrkan direkt till yrkesrollen.</p>

      <h3>5. Anpassningsförmåga</h3>
      <p><strong>Svar:</strong> <em>"Jag navigerar snabbt i förändring. När förutsättningarna ändras, ställer jag om snarare än att låsa mig."</em></p>
      <p><strong>Varför det funkar:</strong> I dagens snabba arbetsliv är flexibilitet hårdvaluta.</p>

      <h2>5 exempel på svagheter (som faktiskt imponerar)</h2>
      <p>Tricket med svagheter är att vara ärlig men visa på en lösning. Undvik svar som "jag jobbar för hårt" – det genomskådas direkt.</p>

      <h3>1. Tala inför publik</h3>
      <p><em>"Jag blir nervös vid stora presentationer. Därför förbereder jag mig extra noga och tar gärna hjälp av en kollega för att bolla upplägget."</em></p>

      <h3>2. Struktur på skrivbordet</h3>
      <p><em>"Jag kan bli rörig i mitt fysiska utrymme, men har löst det genom att arbeta helt digitalt och rensa min att-göra-lista varje kväll."</em></p>

      <h3>3. Självkritik</h3>
      <p><em>"Jag kan vara min egen hårdaste kritiker. Jag har dock lärt mig att 'bra nog' ofta är bättre än perfektion för att hålla deadlines."</em></p>

      <h3>4. Otålighet vid byråkrati</h3>
      <p><em>"Jag gillar när det går undan, så långsamma beslutsprocesser kan frustrera mig. Därför söker jag mig till mindre, snabbfotade bolag som detta."</em></p>

      <h3>5. Riskskygghet</h3>
      <p><em>"Jag föredrar trygga val framför risker. Jag övar dock på att våga lyfta mina idéer tidigare till chefen för att inte missa möjligheter."</em></p>

      <h2>Hur hittar jag mina egna styrkor och svagheter?</h2>
      <p>Om du har svårt att se dina egna mönster, prova dessa tre steg:</p>
      <ol>
        <li><strong>Rannsaka din erfarenhet:</strong> Titta på tidigare succéer. Vad gjorde du precis innan det gick bra? Där ligger dina styrkor.</li>
        <li><strong>Fråga omgivningen:</strong> Be en tidigare kollega eller vän att nämna tre saker du är bäst på och en sak du kan förbättra.</li>
        <li><strong>Analysera jobbannonsen:</strong> Vilka egenskaper efterfrågas? Matcha dina egna erfarenheter mot dessa.</li>
      </ol>

      <h2>Mjuka styrkor arbetsgivare älskar</h2>
      <ul>
        <li>Kreativitet &amp; Nyfikenhet</li>
        <li>Engagemang &amp; Ärlighet</li>
        <li>Tålamod &amp; Uppfinningsförmåga</li>
      </ul>

      <h2>Sammanfattning: Tre gyllene regler</h2>
      <ol>
        <li><strong>Anpassa alltid svaret:</strong> Din styrka ska vara relevant för tjänsten.</li>
        <li><strong>Visa på utveckling:</strong> Din svaghet ska vara något du jobbar på eller har hittat strategier för.</li>
        <li><strong>Var personlig:</strong> Skippa färdiga mallar och våga bjuda på en gnutta personlighet och humor.</li>
      </ol>
    `,
  },
  "rekryterarens-5-ovantade-cv-tips": {
    title: "Rekryterarens 5 oväntade CV-tips som landar dig intervjun",
    date: "2025-01-28",
    category: "CV-tips",
    excerpt:
      "Fem överraskande och effektiva tips direkt från en rekryterare som förändrar hur du ser på ditt CV och ökar dina chanser att landa drömjobbet.",
    content: `
      <p>Att skriva ett CV som verkligen fångar en rekryterares uppmärksamhet kan kännas som en omöjlig uppgift. Hur sticker man ut i mängden och vad är det egentligen som gör skillnad? Här är fem överraskande och effektiva tips direkt från en rekryterare som kommer att förändra hur du ser på ditt CV och öka dina chanser att landa drömjobbet.</p>

      <figure class="my-8">
        <img src="/blog/rekryterarens-cv-tips-infografik.png" alt="Infografik: Rekryterarens bästa tips för ett imponerande CV – layout och grunduppgifter (matcha annonsens språk, professionellt foto, skippa personnummer och adress) samt innehåll och anpassning (säljande sammanfattning 3–5 meningar, prioritera relevans i erfarenhetslistan, optimera med nyckelord från jobbannonsen)." width="1200" height="auto" loading="lazy" />
      </figure>

      <h2>1. Skippa din adress och ditt personnummer</h2>
      <p>När det kommer till kontaktinformation är mindre mer. Allt en rekryterare behöver för att kunna kontakta dig är ditt namn, din e-postadress, ditt telefonnummer och eventuellt en länk till din LinkedIn-profil. Din fullständiga adress och ditt personnummer är helt onödiga i det här skedet av processen.</p>
      <h5>Varför det spelar roll</h5>
      <p>Den typen av information hanteras först om du blir erbjuden en anställning. Detta tips förenklar inte bara ditt CV och gör det mer lättläst, utan skyddar också din personliga integritet under ansökningsprocessen.</p>

      <h2>2. Fokusera din sammanfattning på jobbet, inte dina hobbies</h2>
      <p>En kort sammanfattning på 3–5 meningar högst upp i ditt CV är ett utmärkt sätt att snabbt fånga intresse. Men dess syfte är inte att berätta om dina fritidsintressen eller din personlighet, utan att tydligt visa varför just du är rätt person för den specifika tjänsten du söker.</p>
      <h5>Rekryterarens perspektiv</h5>
      <p><em>You don't have to write about hobbies or who you are as a person, but why we should hire you.</em></p>
      <h6>Så signalerar du rätt</h6>
      <p>Genom att skräddarsy din sammanfattning signalerar du omedelbart till rekryteraren att du inte bara är en passiv sökande, utan en proaktiv problemlösare som förstår deras specifika behov. Det visar att du kan koppla dina styrkor direkt till arbetsgivarens utmaningar.</p>

      <h2>3. Lyft fram all din erfarenhet – även den från andra länder</h2>
      <p>Lista all relevant arbetslivserfarenhet du har. Om du saknar erfarenhet som är direkt kopplad till jobbet, kom ihåg att projekt, volontärarbete och praktikplatser också är otroligt värdefulla. Även om du har haft ett jobb under lång tid som verkar orelaterat, tänk på de överförbara färdigheter du utvecklat – som kundservice, projektledning eller ansvarstagande – och lyft fram dem.</p>
      <h5>Internationell erfarenhet räknas</h5>
      <p>En särskilt viktig poäng är att erfarenhet från ditt hemland eller andra länder är en styrka. Inkludera den alltid, eftersom den visar på en bredd och anpassningsförmåga som många arbetsgivare värdesätter högt.</p>
      <h6>Expertråd</h6>
      <p><em>If you have experience from another country or your home country, it's great to have that as well, because all experience is good experience.</em></p>
      <p>Detta är ett uppmuntrande och viktigt råd, särskilt för dig med en internationell bakgrund. Din unika erfarenhetsbank är en tillgång – se till att den syns.</p>

      <h2>4. Använd jobbannonsens egna nyckelord</h2>
      <p>En enkel men extremt effektiv strategi är att tala rekryterarens språk. Läs igenom jobbannonsen noggrant och identifiera de nyckelord som används för att beskriva efterfrågade kompetenser. Välj sedan ut de ord som du anser genuint speglar dina egna färdigheter och väv in dem i beskrivningarna av dina erfarenheter i ditt CV.</p>
      <h5>Strategisk anpassning, inte kopiering</h5>
      <p>Det handlar inte om att kopiera och klistra in, utan om att skapa en strategisk anpassning. Genom att använda samma terminologi som arbetsgivaren skapar du en omedelbar igenkänning och visar tydligt att din profil matchar jobbets krav.</p>

      <h2>5. Lämna referenserna utanför CV:t</h2>
      <p>Du behöver inte inkludera namn och kontaktuppgifter till dina referenser direkt i ditt CV. Detta är information som blir relevant först senare i rekryteringsprocessen.</p>
      <h5>Så gör du istället</h5>
      <p>Skriv istället en enkel mening i slutet av ditt CV, till exempel "Referenser lämnas på begäran". Om du skriver ditt CV på engelska använder du frasen "References can be provided upon request".</p>
      <h6>Välj rätt referens</h6>
      <p>Kom ihåg: den mest kraftfulla referensen är inte nödvändigtvis din högsta chef, utan den person som konkret kan gå i god för de specifika kompetenser och erfarenheter som är relevanta för just den här nya rollen.</p>

      <h2>Sammanfattning</h2>
      <p>Att skapa ett vinnande CV handlar inte om att skriva om allt från grunden, utan om att göra små, strategiska justeringar som har stor effekt. Genom att följa dessa råd visar du att du är professionell, relevant och har förstått vad arbetsgivaren letar efter.</p>
      <p>Vilket av dessa tips kommer du att använda för att vässa ditt CV redan idag?</p>
    `,
  },
  "sa-skriver-du-ett-cv-som-sticker-ut": {
    title: "Så skriver du ett CV som sticker ut",
    date: "2024-02-14",
    category: "CV-tips",
    excerpt:
      "Lär dig hur du skapar ett CV som fångar rekryterarens uppmärksamhet och ökar dina chanser att få drömjobbet.",
    content: `
      <h2>Vad gör ett CV minnesvärt?</h2>
      <p>Ett effektivt CV är mer än bara en lista över dina tidigare jobb. Det är ditt personliga marknadsföringsverktyg som ska fånga rekryterarens uppmärksamhet på några sekunder. Här är några nyckelelement som gör ditt CV minnesvärt:</p>
      
      <h3>1. En stark profil</h3>
      <p>Börja med en koncis och slagkraftig profilbeskrivning som sammanfattar dina främsta styrkor och vad du kan tillföra. Detta är din "elevator pitch" – gör den minnesvärd!</p>

      <h3>2. Kvantifierbara resultat</h3>
      <p>Istället för att bara lista arbetsuppgifter, fokusera på konkreta resultat. Använd siffror och statistik när det är möjligt. Till exempel: "Ökade försäljningen med 45% under första kvartalet" eller "Ledde ett team på 12 personer".</p>

      <h3>3. Relevant nyckelkompetens</h3>
      <p>Anpassa dina färdigheter efter jobbet du söker. Använd relevanta branschspecifika nyckelord som matchar jobbannonsen, men var ärlig med din kompetensnivå.</p>

      <h2>Formatering och layout</h2>
      <p>Ett professionellt utseende är avgörande. Här är viktiga formateringsprinciper:</p>
      <ul>
        <li>Använd konsekvent formatering genom hela dokumentet</li>
        <li>Välj ett lättläst typsnitt som Arial eller Calibri</li>
        <li>Använd rubriker och underrubriker för att skapa struktur</li>
        <li>Lämna tillräckligt med vitrum för att göra innehållet luftigt</li>
      </ul>

      <h2>Anpassa efter tjänsten</h2>
      <p>Ett framgångsrikt CV är skräddarsytt för den specifika tjänsten du söker. Analysera jobbannonsen noga och lyft fram de erfarenheter och kompetenser som är mest relevanta för positionen.</p>

      <h2>Språk och ton</h2>
      <p>Använd ett professionellt men personligt språk. Undvik klyschor och fokusera istället på att beskriva dina prestationer och färdigheter på ett konkret sätt. Var koncis men informativ.</p>

      <h2>Avslutande tips</h2>
      <p>Kom ihåg att ditt CV är ditt första intryck hos en potentiell arbetsgivare. Ta dig tid att finslipa det, be andra om feedback, och var inte rädd för att visa din unika personlighet. Med dessa tips är du på god väg att skapa ett CV som verkligen sticker ut från mängden.</p>
    `,
  },
  "5-vanliga-misstag-att-undvika": {
    title: "5 vanliga misstag att undvika i ditt CV",
    date: "2024-02-10",
    category: "CV-tips",
    excerpt:
      "Undvik dessa vanliga fallgropar när du skriver ditt CV för att maximera dina chanser att få jobbet du söker.",
    content: `
      <h2>Inledning</h2>
      <p>Att skriva ett CV kan vara utmanande, och även små misstag kan kosta dig möjligheten till en intervju. Här är fem vanliga misstag som du bör undvika när du skapar ditt CV:</p>

      <h3>1. Att använda en generisk mall utan anpassning</h3>
      <p>Ett av de största misstagen är att skicka samma generiska CV till alla jobb du söker. Varje CV bör vara skräddarsytt för den specifika tjänsten och företaget. Ta tid att anpassa ditt CV för varje ansökan genom att lyfta fram relevanta erfarenheter och färdigheter som matchar jobbbeskrivningen.</p>

      <h3>2. Stavfel och grammatiska misstag</h3>
      <p>Inget skriker "bristande uppmärksamhet på detaljer" som ett CV fullt av stavfel och grammatiska misstag. Dessa enkla fel kan snabbt få en rekryterare att lägga ditt CV i "nej"-högen. Korrekturläs alltid ditt CV noggrant och be gärna någon annan att gå igenom det också.</p>

      <h3>3. Överdriven längd och irrelevant information</h3>
      <p>Ett CV bör vara koncist och relevant. Att inkludera för mycket information eller irrelevanta detaljer kan göra det svårt för rekryteraren att hitta den viktiga informationen. Fokusera på de mest relevanta erfarenheterna och prestationerna för jobbet du söker. För de flesta är 1-2 sidor tillräckligt.</p>

      <h3>4. Att utelämna nyckelord från jobbannonsen</h3>
      <p>Många företag använder ATS (Applicant Tracking Systems) för att screena CV:n. Om ditt CV saknar viktiga nyckelord från jobbannonsen kan det filtreras bort innan en mänsklig rekryterare ens ser det. Se till att inkludera relevanta termer och färdigheter som nämns i jobbannonsen, förutsatt att du faktiskt besitter dessa färdigheter.</p>

      <h3>5. Att ljuga eller överdriva</h3>
      <p>Det kan vara frestande att överdriva dina prestationer eller till och med ljuga om din erfarenhet, men detta är ett allvarligt misstag. Lögner kommer ofta fram under bakgrundskontroller eller intervjuer, vilket kan skada din trovärdighet och dina chanser att få jobbet. Var ärlig och fokusera istället på att presentera dina faktiska styrkor på bästa sätt.</p>

      <h2>Sammanfattning</h2>
      <p>Genom att undvika dessa vanliga misstag kan du skapa ett starkare och mer effektivt CV. Kom ihåg att ditt CV är ditt första intryck hos en potentiell arbetsgivare. Ta dig tid att göra det rätt, var ärlig, relevant och noggrann. Med ett välskrivet CV ökar du dina chanser att få den intervju du strävar efter.</p>
    `,
  },
  "personligt-brev-guide": {
    title: "Personligt brev - En komplett guide",
    date: "2024-02-05",
    category: "Personligt brev",
    excerpt:
      "Lär dig skriva ett övertygande personligt brev som kompletterar ditt CV och ökar dina chanser att få jobbet.",
    content: `
      <h2>Vad är ett personligt brev?</h2>
      <p>Ett personligt brev är ett dokument som kompletterar ditt CV i en jobbansökan. Medan CV:t ger en översikt över din karriär och kompetenser, ger det personliga brevet dig möjlighet att förklara varför du är den perfekta kandidaten för jobbet och vad som motiverar dig att söka tjänsten.</p>

      <h2>Struktur och innehåll</h2>
      <h3>1. Inledning</h3>
      <p>Börja med en stark öppning som fångar läsarens uppmärksamhet. Nämn vilken tjänst du söker och var du hittade annonsen. Visa entusiasm för företaget och positionen.</p>

      <h3>2. Varför du?</h3>
      <p>Förklara varför du är den rätta personen för jobbet. Koppla dina färdigheter och erfarenheter till kraven i jobbannonsen. Använd konkreta exempel på hur du har använt dessa färdigheter i tidigare roller.</p>

      <h3>3. Varför företaget?</h3>
      <p>Visa att du har gjort din research. Berätta varför du är intresserad av just detta företag och denna roll. Koppla dina värderingar och karriärmål till företagets mission och kultur.</p>

      <h3>4. Avslutning</h3>
      <p>Avsluta starkt genom att sammanfatta ditt intresse och din lämplighet för tjänsten. Uttryck din önskan om en intervju och tacka för deras tid och övervägande.</p>

      <h2>Tips för ett övertygande personligt brev</h2>
      <ul>
        <li>Anpassa varje brev till den specifika tjänsten och företaget</li>
        <li>Håll det koncist - sikta på cirka en A4-sida</li>
        <li>Använd ett professionellt men personligt språk</li>
        <li>Fokusera på vad du kan göra för företaget, inte bara vad du vill ha från dem</li>
        <li>Använd konkreta exempel för att stödja dina påståenden</li>
        <li>Korrekturläs noggrant för att undvika stavfel och grammatiska misstag</li>
      </ul>

      <h2>Vanliga misstag att undvika</h2>
      <ul>
        <li>Att upprepa information som redan finns i ditt CV</li>
        <li>Att använda en generisk mall utan anpassning</li>
        <li>Att fokusera för mycket på dig själv och inte tillräckligt på företaget</li>
        <li>Att överdriva eller ljuga om dina kvalifikationer</li>
        <li>Att glömma att inkludera dina kontaktuppgifter</li>
      </ul>

      <h2>Avslutande ord</h2>
      <p>Ett välskrivet personligt brev kan vara avgörande för att få dig kallad till intervju. Genom att följa denna guide och lägga tid på att skräddarsy ditt brev för varje ansökan, ökar du dina chanser att sticka ut från mängden och fånga rekryterarens intresse. Kom ihåg att ditt personliga brev är din chans att berätta din historia och visa varför du är den perfekta kandidaten för jobbet.</p>
    `,
  },
  "linkedin-profil-optimering": {
    title: "LinkedIn-profil som kompletterar ditt CV",
    date: "2024-02-03",
    category: "Karriärtips",
    excerpt:
      "Lär dig hur du optimerar din LinkedIn-profil för att stärka ditt personliga varumärke och öka dina chanser att bli upptäckt av rekryterare.",
    content: `
      <h2>Varför är LinkedIn viktigt?</h2>
      <p>LinkedIn har blivit en oumbärlig plattform för professionell networking och jobbsökning. En väloptimerad LinkedIn-profil kan komplettera ditt CV och ge rekryterare en mer omfattande bild av din professionella identitet. Här är hur du kan optimera din LinkedIn-profil för att maximera dina karriärmöjligheter:</p>

      <h2>1. Profilbild och bakgrundsbild</h2>
      <p>Din profilbild är ditt första intryck. Använd en professionell bild där du ler och ser tillgänglig ut. Bakgrundsbilden kan användas för att visa din bransch eller personlighet. Båda bör vara av hög kvalitet och relevanta för din professionella image.</p>

      <h2>2. Rubrik</h2>
      <p>Din rubrik är mer än bara din jobbtitel. Använd de 120 tecknen för att beskriva din expertis och vad du kan erbjuda. Inkludera relevanta nyckelord för att öka dina chanser att dyka upp i sökresultat.</p>

      <h2>3. Om-sektion</h2>
      <p>Detta är din chans att berätta din professionella historia. Beskriv dina färdigheter, erfarenheter och vad som driver dig. Var personlig men professionell, och inkludera nyckelord som är relevanta för din bransch och önskade roll.</p>

      <h2>4. Arbetslivserfarenhet</h2>
      <p>Lista dina tidigare och nuvarande jobb. För varje position, beskriv dina huvudsakliga ansvarsområden och prestationer. Använd action verbs och kvantifiera dina resultat när möjligt. Detta bör spegla informationen i ditt CV, men du kan lägga till mer detaljer här.</p>

      <h2>5. Utbildning</h2>
      <p>Inkludera all relevant utbildning, certifieringar och kurser. Detta visar din kompetens och vilja att lära och utvecklas.</p>

      <h2>6. Färdigheter och rekommendationer</h2>
      <p>Lista dina viktigaste färdigheter och be kollegor och chefer att rekommendera dig för dessa. Detta ger trovärdighet till dina påståenden och stärker din profil.</p>

      <h2>7. Engagemang och aktivitet</h2>
      <p>Var aktiv på LinkedIn. Dela relevant innehåll, kommentera på andras inlägg och delta i diskussioner i grupper. Detta ökar din synlighet och visar ditt engagemang i din bransch.</p>

      <h2>8. Anpassad URL</h2>
      <p>Skapa en anpassad URL för din LinkedIn-profil. Detta ser mer professionellt ut och är lättare att dela, till exempel på ditt CV eller i din e-postsignatur.</p>

      <h2>9. Rekommendationer</h2>
      <p>Be om rekommendationer från kollegor, chefer eller klienter. Dessa personliga intyg ger en djupare inblick i dina professionella kvaliteter och prestationer. Sikta på att ha minst 3-5 starka rekommendationer som belyser olika aspekter av din kompetens.</p>

      <h2>10. Multimedia</h2>
      <p>Utnyttja möjligheten att lägga till multimedia till din profil. Detta kan inkludera presentationer, artiklar du har skrivit, eller projekt du har arbetat med. Visuellt innehåll kan göra din profil mer engagerande och ge konkreta exempel på ditt arbete.</p>

      <h2>Sammanfattning</h2>
      <p>En väloptimerad LinkedIn-profil är ett kraftfullt komplement till ditt CV. Den ger dig möjlighet att visa upp en mer nyanserad bild av din professionella identitet och kan öppna dörrar till nya möjligheter. Genom att regelbundet uppdatera och engagera dig på plattformen, bygger du ett starkt personligt varumärke som kan ge dig en konkurrensfördel i din karriär.</p>

      <p>Kom ihåg att din LinkedIn-profil är en levande representation av ditt professionella jag. Håll den uppdaterad, engagera dig aktivt, och använd den som ett verktyg för att bygga och underhålla ditt professionella nätverk. Med dessa tips är du på god väg att skapa en LinkedIn-profil som verkligen kompletterar och förstärker ditt CV.</p>
    `,
  },
  "arbetsintervju-fragor-och-svar": {
    title: "Arbetsintervju: Vanliga frågor och bästa svaren",
    date: "2024-01-28",
    category: "Intervjutips",
    excerpt:
      "Förbered dig inför din nästa arbetsintervju med våra expertråd på hur du bäst svarar på vanliga intervjufrågor.",
    content: `
      <h2>Förberedelse är nyckeln</h2>
      <p>Att vara väl förberedd inför en arbetsintervju kan göra hela skillnaden. Genom att känna till och öva på svar till vanliga intervjufrågor kan du känna dig mer självsäker och göra ett starkare intryck. Här är några av de vanligaste frågorna du kan förvänta dig, tillsammans med tips på hur du kan svara:</p>

      <h3>1. "Berätta lite om dig själv."</h3>
      <p>Detta är ofta öppningsfrågan och din chans att göra ett starkt första intryck. Fokusera på din professionella bakgrund och de erfarenheter som är mest relevanta för tjänsten. Håll det koncist, cirka 2-3 minuter, och avsluta med varför du är intresserad av denna specifika roll.</p>

      <h3>2. "Varför vill du jobba här?"</h3>
      <p>Visa att du har gjort din research. Prata om företagets värderingar, produkter eller tjänster som intresserar dig. Koppla dina egna mål och färdigheter till vad företaget gör och hur du kan bidra till deras framgång.</p>

      <h3>3. "Vad är dina styrkor och svagheter?"</h3>
      <p>För styrkor, välj egenskaper som är relevanta för jobbet och ge konkreta exempel på hur du har använt dessa i tidigare roller. För svagheter, var ärlig men välj något som inte är kritiskt för positionen och berätta hur du aktivt arbetar på att förbättra dig.</p>

      <h3>4. "Berätta om en utmaning du har övervunnit i ditt arbete."</h3>
      <p>Använd STAR-metoden (Situation, Task, Action, Result) för att strukturera ditt svar. Beskriv situationen, förklara din uppgift, detaljera de åtgärder du vidtog, och avsluta med resultatet. Välj ett exempel som visar din problemlösningsförmåga och anpassningsbarhet.</p>

      <h3>5. "Var ser du dig själv om fem år?"</h3>
      <p>Visa ambition och en vilja att växa inom företaget. Var realistisk och koppla dina mål till den position du söker och företagets möjligheter. Det är okej att inte ha en exakt plan, men visa att du har tänkt på din karriärutveckling.</p>

      <h3>6. "Varför lämnade du ditt förra jobb?"</h3>
      <p>Var ärlig men positiv. Fokusera på vad du söker i din nästa roll snarare än att klaga på din tidigare arbetsgivare. Om du blev uppsagd, var ärlig om situationen men betona vad du har lärt dig och hur du har vuxit sedan dess.</p>

      <h3>7. "Hur hanterar du stress och press?"</h3>
      <p>Ge konkreta exempel på strategier du använder för att hantera stress, som prioritering av uppgifter, tidshantering eller mindfulness-tekniker. Visa att du kan prestera under press genom att nämna en situation där du framgångsrikt hanterade en stressig deadline eller utmaning.</p>

      <h3>8. "Har du några frågor till oss?"</h3>
      <p>Ha alltid några väl genomtänkta frågor förberedda. Detta visar ditt intresse och engagemang. Fråga om företagskulturen, teamets utmaningar, eller möjligheter till professionell utveckling. Undvik frågor om lön och förmåner i detta skede om det inte tas upp av intervjuaren.</p>

      <h2>Generella tips för intervjusuccess</h2>
      <ul>
        <li>Öva dina svar högt för att känna dig mer bekväm</li>
        <li>Använd konkreta exempel från din erfarenhet när det är möjligt</li>
        <li>Var ärlig och autentisk i dina svar</li>
        <li>Visa entusiasm för rollen och företaget</li>
        <li>Lyssna noga på frågorna och be om förtydligande om något är oklart</li>
        <li>Följ upp efter intervjun med ett tackmail där du upprepar ditt intresse för positionen</li>
      </ul>

      <p>Kom ihåg att en intervju är en tvåvägskommunikation. Det är inte bara en chans för arbetsgivaren att utvärdera dig, utan också din möjlighet att bedöma om företaget och rollen är rätt för dig. Med god förberedelse och en positiv attityd ökar du dina chanser att göra ett starkt intryck och ta nästa steg i din karriär.</p>
    `,
  },
  "ai-och-framtidens-cv": {
    title: "AI och framtidens CV-skrivande",
    date: "2024-01-25",
    category: "Trender",
    excerpt:
      "Utforska hur artificiell intelligens förändrar sättet vi skapar och anpassar våra CV:n, och hur du kan dra nytta av denna teknologi i din jobbsökning.",
    content: `
      <h2>Introduktion till AI i CV-skrivande</h2>
      <p>Artificiell intelligens (AI) revolutionerar många aspekter av våra liv, och CV-skrivande är inget undantag. Från att optimera innehåll till att skräddarsy CV:n för specifika jobb, AI erbjuder nya möjligheter att förbättra hur vi presenterar oss för potentiella arbetsgivare. Låt oss utforska hur AI påverkar framtidens CV-skrivande och hur du kan dra nytta av denna teknologi.</p>

      <h2>Hur AI förändrar CV-skrivandet</h2>
      <h3>1. Personalisering och anpassning</h3>
      <p>AI-drivna verktyg kan analysera jobbannonser och automatiskt föreslå anpassningar till ditt CV för att bättre matcha specifika jobbkrav. Detta inkluderar att lyfta fram relevanta färdigheter och erfarenheter baserat på nyckelord i jobbannonsen.</p>

      <h3>2. Optimering av nyckelord</h3>
      <p>Många företag använder ATS (Applicant Tracking Systems) för att screena CV:n. AI kan hjälpa till att identifiera och inkludera relevanta nyckelord som ökar chanserna att ditt CV passerar den initiala screeningen.</p>

      <h3>3. Förbättrad formulering</h3>
      <p>AI-verktyg kan föreslå förbättringar i språk och formuleringar, vilket hjälper till att göra ditt CV mer övertygande och professionellt. Detta kan inkludera förslag på starkare action verbs och mer koncisa beskrivningar av dina prestationer.</p>

      <h3>4. Datadriven insikt</h3>
      <p>Genom att analysera stora mängder CV:n och jobbansökningar kan AI ge insikter om trender inom din bransch, vilka färdigheter som är mest efterfrågade, och hur du kan positionera dig bättre på arbetsmarknaden.</p>

      <h2>Fördelar med AI i CV-skrivande</h2>
      <ul>
        <li>Tidsbesparande: AI kan snabbt generera utkast och förslag, vilket sparar tid i CV-skapandet.</li>
        <li>Ökad relevans: Genom att anpassa innehållet till specifika jobb ökar chanserna att ditt CV fångar rekryterarens uppmärksamhet.</li>
        <li>Kontinuerlig förbättring: AI-verktyg lär sig och förbättras över tid, vilket innebär att rekommendationerna blir allt mer sofistikerade.</li>
        <li>Objektiv feedback: AI kan ge opartisk feedback på ditt CV, vilket hjälper dig att identifiera områden för förbättring.</li>
      </ul>

      <h2>Utmaningar och etiska överväganden</h2>
      <p>Medan AI erbjuder många fördelar, finns det också utmaningar att vara medveten om:</p>
      <ul>
        <li>Överanvändning kan leda till generiska CV:n som saknar personlighet.</li>
        <li>Risk för bias i AI-algoritmer som kan påverka rekommendationerna.</li>
        <li>Etiska frågor kring användningen av AI-genererat innehåll i professionella sammanhang.</li>
      </ul>

      <h2>Hur du kan dra nytta av AI i ditt CV-skrivande</h2>
      <ol>
        <li>Använd AI-verktyg för initial brainstorming och strukturering av ditt CV.</li>
        <li>Utnyttja AI för att identifiera relevanta nyckelord från jobbannonser.</li>
        <li>Låt AI ge förslag på förbättringar i språk och formuleringar, men behåll din personliga röst.</li>
        <li>Använd AI-genererade insikter för att förstå trender inom din bransch och anpassa ditt CV därefter.</li>
        <li>Kombinera AI-rekommendationer med mänsklig kreativitet och omdöme för bästa resultat.</li>
      </ol>

      <h2>Framtidsutsikter</h2>
      <p>I framtiden kan vi förvänta oss ännu mer sofistikerade AI-verktyg för CV-skrivande. Detta kan inkludera:</p>
      <ul>
        <li>Interaktiva CV:n som anpassar sig i realtid baserat på läsarens interaktioner.</li>
        <li>AI-driven karriärrådgivning som integreras med CV-skapande.</li>
        <li>Förbättrad visualisering av kompetenser och erfarenheter genom AI-genererade infografiker.</li>
      </ul>

      <h2>Slutsats</h2>
      <p>AI är på väg att revolutionera hur vi skapar och anpassar våra CV:n. Genom att förstå och utnyttja dessa verktyg klokt kan du förbättra dina chanser att sticka ut i en konkurrensutsatt arbetsmarknad. Kom ihåg att AI är ett verktyg för att förbättra ditt CV, inte ersätta din unika röst och erfarenhet. Använd AI som ett komplement till din egen kreativitet och professionella omdöme för att skapa ett CV som verkligen representerar dig och dina färdigheter.</p>
    `,
  },
}

interface Props {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const post = blogPosts[resolvedParams.slug as keyof typeof blogPosts]

  if (!post) {
    return {
      title: "Inlägg hittades inte | CVfixaren.se",
    }
  }

  return {
    title: `${post.title} | CVfixaren.se`,
    description: post.excerpt,
    alternates: {
      canonical: `https://www.cvfixaren.se/blogg/${resolvedParams.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      url: `https://www.cvfixaren.se/blogg/${resolvedParams.slug}`,
    },
  }
}

function getRelatedPosts(currentSlug: string) {
  const currentPost = blogPosts[currentSlug as keyof typeof blogPosts]
  if (!currentPost) return []

  return Object.entries(blogPosts)
    .filter(([slug, post]) => slug !== currentSlug && post.category === currentPost.category)
    .slice(0, 3)
    .map(([slug, post]) => ({ slug, title: post.title, excerpt: post.excerpt }))
}

export default async function BlogPost({ params }: Props) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const post = blogPosts[slug as keyof typeof blogPosts]

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(slug)

  return (
    <div className="flex min-h-screen flex-col">
      <Script
        id="blogposting-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            dateModified: post.date,
            author: {
              "@type": "Organization",
              name: "CVfixaren.se",
              url: "https://www.cvfixaren.se",
            },
            publisher: {
              "@type": "Organization",
              name: "CVfixaren.se",
              url: "https://www.cvfixaren.se",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://www.cvfixaren.se/blogg/${slug}`,
            },
          }),
        }}
      />
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs
            items={[
              { label: "Blogg", href: "/blogg" },
              { label: post.title, href: `/blogg/${slug}` },
            ]}
          />

          <article className="max-w-4xl mx-auto mt-8">
            <div className="mb-8">
              <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm mb-4">
                {post.category}
              </span>
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-gray-500">
                <time dateTime={post.date}>{post.date}</time>
                <span>·</span>
                <span>CVfixaren Redaktionen</span>
              </div>
            </div>

            <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }} />

            <div className="mt-12 pt-8 border-t">
              <Link href="/profil/skapa-cv">
                <Button>Skapa ditt CV nu</Button>
              </Link>
            </div>

            {relatedPosts.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6">Relaterade artiklar</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((related) => (
                    <Link key={related.slug} href={`/blogg/${related.slug}`} className="group">
                      <div className="bg-white rounded-lg p-5 border border-gray-100 hover:border-[#00bf63]/30 transition-colors h-full">
                        <h3 className="font-semibold mb-2 group-hover:text-[#00bf63] transition-colors">{related.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{related.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
