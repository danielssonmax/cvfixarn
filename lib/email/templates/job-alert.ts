import { BRAND } from "../client"
import { JOBS_SOURCE_LABEL } from "../../jobs/format"

/**
 * The weekly job email for people who switched it on in the CV editor.
 *
 * Deliberately plain: a headline with the live count, a short list of ads and
 * one line about the CV. Same hand-rolled table HTML as the abandoned-CV email,
 * for the same reason (Outlook and Gmail).
 *
 * Headlines, employers and places are employer-written text from the API and
 * are escaped here. The caller only has to pass absolute http(s) URLs.
 */

export interface JobAlertEmailJob {
  headline: string
  employer: string | null
  /** The ad's municipality, as the API names it. */
  place: string | null
  /** Absolute link to our own ad page. */
  url: string
}

export interface JobAlertEmailInput {
  /** New ads in the period, as counted by the API. Can be larger than jobs.length. */
  total: number
  /** Lowercase, reads after "som": "undersköterska". */
  occupation: string
  /** Reads after "i": "Västerås", "Västmanlands län" or "hela Sverige". */
  place: string
  /** Set when the user's municipality had no new ads and the search was widened to its län. */
  widenedFrom?: string | null
  /** Start of the period, e.g. "9 november". Left out of the copy when missing. */
  since?: string | null
  /** Newest first. At most MAX_JOBS are shown. */
  jobs: JobAlertEmailJob[]
  /** The same search on /lediga-jobb. */
  allJobsUrl: string
  /** The user's CV in the editor, or their CV list. */
  cvUrl: string
  /** Signed link that switches off this email only. */
  unsubscribeUrl: string
}

export const JOB_ALERT_MAX_JOBS = 8

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatNewJobCount(count: number): string {
  return count === 1 ? "1 nytt jobb" : `${count.toLocaleString("sv-SE")} nya jobb`
}

export function buildJobAlertEmail(input: JobAlertEmailInput): {
  subject: string
  html: string
  text: string
} {
  const { occupation, place, widenedFrom, since, allJobsUrl, cvUrl, unsubscribeUrl } = input
  const jobs = input.jobs.slice(0, JOB_ALERT_MAX_JOBS)
  // The API's count and the list can disagree by an ad or two (removed ads are
  // filtered out of the list). Never claim fewer than what is shown.
  const total = Math.max(input.total, jobs.length)

  const headline = `${formatNewJobCount(total)} som ${occupation} i ${place}`
  const subject = headline

  const intro = since
    ? `Här är annonserna som har publicerats sedan den ${since}.`
    : "Här är de senaste annonserna."
  const widened = widenedFrom
    ? `Det kom inga nya annonser i ${widenedFrom}, så vi visar ${place}.`
    : ""
  const shownOf =
    total > jobs.length ? `Vi visar de ${jobs.length} senaste av ${total.toLocaleString("sv-SE")}.` : ""
  const lead = [intro, widened, shownOf].filter(Boolean).join(" ")

  const allJobsLabel = `Se alla lediga jobb som ${occupation} i ${place}`
  const reason = "Du får det här mejlet för att du slog på jobbmejl på CVfixaren."

  const preheader = jobs
    .slice(0, 3)
    .map((job) => job.headline)
    .join(" · ")

  const jobRows = jobs
    .map((job, index) => {
      const where = [job.employer, job.place].filter(Boolean).join(" · ")
      return `
                      <tr>
                        <td style="padding:14px 0;${index > 0 ? `border-top:1px solid ${BRAND.hairline};` : ""}font-family:Arial,Helvetica,sans-serif;">
                          <a href="${escapeHtml(job.url)}" target="_blank" style="font-size:16px;line-height:23px;font-weight:bold;color:${BRAND.ink};text-decoration:underline;">${escapeHtml(job.headline)}</a>${
                            where
                              ? `
                          <div style="font-size:14px;line-height:21px;color:${BRAND.body};padding-top:2px;">${escapeHtml(where)}</div>`
                              : ""
                          }
                        </td>
                      </tr>`
    })
    .join("")

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
    @media only screen and (max-width:620px) {
      .sm-px { padding-left:22px !important; padding-right:22px !important; }
      .sm-h1 { font-size:22px !important; line-height:29px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.canvas};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BRAND.canvas};opacity:0;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.canvas};">
    <tr>
      <td align="center" style="padding:28px 12px 40px 12px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">

          <tr>
            <td align="center" style="padding:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:19px;line-height:24px;font-weight:bold;color:${BRAND.ink};letter-spacing:-0.2px;">
              CV<span style="color:${BRAND.green};">fixaren</span>.se
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;border-radius:16px;border:1px solid ${BRAND.hairline};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

                <tr>
                  <td class="sm-px" style="padding:36px 44px 0 44px;font-family:Arial,Helvetica,sans-serif;">
                    <h1 class="sm-h1" style="margin:0;font-size:24px;line-height:31px;font-weight:bold;color:${BRAND.ink};letter-spacing:-0.3px;">
                      ${escapeHtml(headline)}
                    </h1>
                    <p style="margin:10px 0 0 0;font-size:15px;line-height:23px;color:${BRAND.body};">
                      ${escapeHtml(lead)}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td class="sm-px" style="padding:14px 44px 0 44px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${jobRows}
                    </table>
                  </td>
                </tr>

                <tr>
                  <td class="sm-px" style="padding:10px 44px 0 44px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;">
                    <a href="${escapeHtml(allJobsUrl)}" target="_blank" style="color:${BRAND.ink};font-weight:bold;text-decoration:underline;">${escapeHtml(allJobsLabel)}</a>
                    <div style="font-size:12px;line-height:18px;color:${BRAND.muted};padding-top:6px;">
                      ${escapeHtml(JOBS_SOURCE_LABEL)}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td class="sm-px" style="padding:24px 44px 0 44px;">
                    <div style="height:1px;background-color:${BRAND.hairline};font-size:0;line-height:0;">&nbsp;</div>
                  </td>
                </tr>

                <tr>
                  <td class="sm-px" style="padding:20px 44px 34px 44px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:${BRAND.body};">
                    Tänker du söka något av jobben?
                    <a href="${escapeHtml(cvUrl)}" target="_blank" style="color:${BRAND.ink};text-decoration:underline;">Se över ditt CV</a>
                    innan du skickar ansökan.
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td class="sm-px" style="padding:20px 44px 0 44px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:${BRAND.muted};text-align:center;">
              ${escapeHtml(reason)}<br />
              <a href="${escapeHtml(unsubscribeUrl)}" target="_blank" style="color:${BRAND.muted};text-decoration:underline;">Stäng av jobbmejlet</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `${headline}

${lead}

${jobs
  .map((job) => {
    const where = [job.employer, job.place].filter(Boolean).join(", ")
    return `${job.headline}${where ? `\n${where}` : ""}\n${job.url}`
  })
  .join("\n\n")}

${allJobsLabel}:
${allJobsUrl}
${JOBS_SOURCE_LABEL}

Tänker du söka något av jobben? Se över ditt CV innan du skickar ansökan:
${cvUrl}

--
${reason}
Stäng av jobbmejlet: ${unsubscribeUrl}
`

  return { subject, html, text }
}
