import { BRAND } from "../client"

/**
 * "Abandoned cart" email for people who built a CV but never started their
 * subscription, so they never got the download.
 *
 * Written as hand-rolled table HTML on purpose: Outlook and Gmail still ignore
 * most modern CSS, and a template that renders correctly everywhere is worth
 * more than one that is pleasant to author.
 */

export interface AbandonedCvEmailInput {
  /** From the CV itself, not the auth record — it is what they typed. */
  firstName: string | null
  /** 0-100 completeness, drives the progress bar and the subject line. */
  percent: number
  /** Sections they already filled in, e.g. ["Arbetslivserfarenhet"]. */
  completedSections: string[]
  /** High-value sections still empty. */
  missingSections: string[]
  /** Auto-login link straight into their CV. */
  resumeUrl: string
  /** Same destination without auto-login, for when the token has expired. */
  fallbackUrl: string
  /** Signed one-click opt-out. */
  unsubscribeUrl: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** "a, b och c" — Swedish list joining. */
function joinSv(items: string[]): string {
  if (items.length === 0) return ""
  if (items.length === 1) return items[0]
  return items.slice(0, -1).join(", ") + " och " + items[items.length - 1]
}

export function buildAbandonedCvEmail(input: AbandonedCvEmailInput): {
  subject: string
  html: string
  text: string
} {
  const {
    firstName,
    percent,
    completedSections,
    missingSections,
    resumeUrl,
    fallbackUrl,
    unsubscribeUrl,
  } = input

  const name = firstName ? escapeHtml(firstName) : null
  const greeting = name ? `Hej ${name}!` : "Hej!"

  const subject = name
    ? `${name}, ditt CV är ${percent}% klart – ta det sista steget`
    : `Ditt CV är ${percent}% klart – ta det sista steget`

  const preheader =
    "Allt du fyllde i finns kvar. Starta din gratisvecka och ladda ner ditt ATS-anpassade CV som PDF."

  const doneSentence = completedSections.length
    ? `Du har redan fyllt i ${joinSv(completedSections).toLowerCase()}.`
    : "Du har redan lagt grunden."

  const missingSentence = missingSections.length
    ? `Det som saknas är ${joinSv(missingSections).toLowerCase()} – sedan är du klar.`
    : "Det enda som återstår är att låsa upp nedladdningen."

  const doneLine = escapeHtml(doneSentence)
  const missingLine = escapeHtml(missingSentence)

  // Progress bar as two table cells: the only technique that survives Outlook.
  const filled = Math.max(4, Math.min(100, percent))
  const remainder = 100 - filled

  const benefits: Array<[string, string]> = [
    [
      "ATS-anpassad PDF",
      "Ditt CV läses korrekt av rekryteringssystemen som sorterar ansökningar innan en människa ser dem.",
    ],
    [
      "Professionella mallar",
      "Byt layout, färg och typsnitt när du vill – utan att fylla i något på nytt.",
    ],
    [
      "Spara och redigera fritt",
      "Skräddarsy CV:t för varje tjänst du söker, direkt i webbläsaren.",
    ],
  ]

  const benefitRows = benefits
    .map(
      ([title, body]) => `
              <tr>
                <td style="padding:0 0 18px 0;" valign="top">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="28" valign="top" style="padding:2px 12px 0 0;">
                        <div style="width:20px;height:20px;border-radius:10px;background-color:${BRAND.green};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;text-align:center;font-weight:bold;">&#10003;</div>
                      </td>
                      <td valign="top" style="font-family:Arial,Helvetica,sans-serif;">
                        <div style="font-size:15px;line-height:22px;color:${BRAND.ink};font-weight:bold;">${title}</div>
                        <div style="font-size:14px;line-height:21px;color:${BRAND.body};padding-top:3px;">${body}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
    )
    .join("")

  const button = (label: string) => `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${BRAND.green}" style="border-radius:10px;">
                    <a href="${resumeUrl}" target="_blank" style="display:inline-block;padding:16px 34px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:20px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:10px;">${label}</a>
                  </td>
                </tr>
              </table>`

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${escapeHtml(subject)}</title>
  <style>
    /* Only progressive enhancement lives here; nothing essential. */
    @media only screen and (max-width:620px) {
      .sm-px { padding-left:22px !important; padding-right:22px !important; }
      .sm-h1 { font-size:26px !important; line-height:32px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.canvas};-webkit-font-smoothing:antialiased;">
  <!-- Preheader: the grey line next to the subject in the inbox list. -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BRAND.canvas};opacity:0;">
    ${escapeHtml(preheader)}
    &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.canvas};">
    <tr>
      <td align="center" style="padding:28px 12px 40px 12px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">

          <!-- Wordmark as text, not an image: images are blocked by default. -->
          <tr>
            <td align="center" style="padding:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:19px;line-height:24px;font-weight:bold;color:${BRAND.ink};letter-spacing:-0.2px;">
              CV<span style="color:${BRAND.green};">fixaren</span>.se
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;border-radius:16px;border:1px solid ${BRAND.hairline};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

                <!-- Headline -->
                <tr>
                  <td class="sm-px" style="padding:40px 44px 0 44px;font-family:Arial,Helvetica,sans-serif;">
                    <div style="font-size:14px;line-height:20px;color:${BRAND.muted};">${greeting}</div>
                    <h1 class="sm-h1" style="margin:10px 0 0 0;font-size:30px;line-height:37px;font-weight:bold;color:${BRAND.ink};letter-spacing:-0.4px;">
                      Ditt CV ligger kvar &ndash;<br />och det är nästan klart
                    </h1>
                    <p style="margin:14px 0 0 0;font-size:16px;line-height:25px;color:${BRAND.body};">
                      ${doneLine} ${missingLine}
                    </p>
                  </td>
                </tr>

                <!-- Progress -->
                <tr>
                  <td class="sm-px" style="padding:28px 44px 0 44px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;font-weight:bold;color:${BRAND.ink};text-transform:uppercase;letter-spacing:0.6px;">
                          Ditt CV
                        </td>
                        <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:18px;font-weight:bold;color:${BRAND.green};">
                          ${percent}% klart
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:9px;border-radius:5px;background-color:#eceef1;">
                      <tr>
                        <td width="${filled}%" height="10" bgcolor="${BRAND.green}" style="border-radius:5px;font-size:0;line-height:0;">&nbsp;</td>
                        ${remainder > 0 ? `<td width="${remainder}%" height="10" style="font-size:0;line-height:0;">&nbsp;</td>` : ""}
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Offer -->
                <tr>
                  <td class="sm-px" style="padding:30px 44px 0 44px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f2fbf6;border:1px solid #cdeedd;border-radius:12px;">
                      <tr>
                        <td style="padding:22px 24px;font-family:Arial,Helvetica,sans-serif;">
                          <div style="font-size:13px;line-height:18px;font-weight:bold;color:${BRAND.greenDark};text-transform:uppercase;letter-spacing:0.7px;">
                            Det sista steget
                          </div>
                          <div style="font-size:27px;line-height:34px;font-weight:bold;color:${BRAND.ink};padding-top:7px;">
                            0 kr i 7 dagar
                          </div>
                          <div style="font-size:14px;line-height:21px;color:${BRAND.body};padding-top:5px;">
                            Därefter 69 kr/vecka. Ingen bindningstid &ndash; avsluta när du vill,
                            direkt i ditt konto.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Primary CTA -->
                <tr>
                  <td class="sm-px" align="center" style="padding:28px 44px 0 44px;">
                    ${button("Fortsätt på mitt CV")}
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:${BRAND.muted};padding-top:12px;">
                      Du loggas in automatiskt och landar direkt i ditt CV.
                    </div>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td class="sm-px" style="padding:32px 44px 0 44px;">
                    <div style="height:1px;background-color:${BRAND.hairline};font-size:0;line-height:0;">&nbsp;</div>
                  </td>
                </tr>

                <!-- Benefits -->
                <tr>
                  <td class="sm-px" style="padding:28px 44px 0 44px;font-family:Arial,Helvetica,sans-serif;">
                    <div style="font-size:17px;line-height:24px;font-weight:bold;color:${BRAND.ink};padding-bottom:18px;">
                      Det här får du när du slutför
                    </div>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${benefitRows}
                    </table>
                  </td>
                </tr>

                <!-- Urgency -->
                <tr>
                  <td class="sm-px" style="padding:6px 44px 0 44px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f9fa;border-radius:12px;">
                      <tr>
                        <td style="padding:18px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:${BRAND.body};">
                          De flesta jobbannonser får sin största del av ansökningarna under de
                          första dygnen. Ju snabbare ditt CV är nedladdningsbart, desto fler
                          tjänster hinner du söka medan de fortfarande är färska.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Secondary CTA -->
                <tr>
                  <td class="sm-px" align="center" style="padding:28px 44px 40px 44px;">
                    ${button("Slutför mitt CV nu")}
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Link fallback -->
          <tr>
            <td class="sm-px" style="padding:22px 44px 0 44px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:${BRAND.muted};text-align:center;">
              Fungerar inte knappen? Öppna den här länken:<br />
              <a href="${fallbackUrl}" target="_blank" style="color:${BRAND.muted};text-decoration:underline;word-break:break-all;">${fallbackUrl}</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="sm-px" style="padding:20px 44px 0 44px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:${BRAND.muted};text-align:center;">
              Du får det här mejlet för att du skapade ett konto på ${BRAND.name}.<br />
              <a href="${unsubscribeUrl}" target="_blank" style="color:${BRAND.muted};text-decoration:underline;">Avregistrera dig från påminnelser</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `${greeting}

${doneSentence} ${missingSentence}

Ditt CV är ${percent}% klart.

DET SISTA STEGET
0 kr i 7 dagar. Därefter 69 kr/vecka, ingen bindningstid - avsluta när du vill.

Fortsätt på ditt CV (du loggas in automatiskt):
${resumeUrl}

DET HÄR FÅR DU NÄR DU SLUTFÖR
${benefits.map(([t, b]) => `* ${t} - ${b}`).join("\n")}

De flesta jobbannonser får sin största del av ansökningarna under de första
dygnen. Ju snabbare ditt CV är nedladdningsbart, desto fler tjänster hinner du
söka medan de fortfarande är färska.

--
Du får det här mejlet för att du skapade ett konto på ${BRAND.name}.
Avregistrera dig: ${unsubscribeUrl}
`

  return { subject, html, text }
}
