import { NextResponse } from "next/server"
import { getJobAd } from "@/lib/jobs/client"
import { JOB_AD_MAX_LENGTH } from "@/lib/cv-optimize/prompt"
import { apiRateLimit, checkRateLimit, createRateLimitResponse, getClientIP } from "@/lib/rate-limit"

export const runtime = "nodejs"

/**
 * GET /api/jobs/ad/<id> -> { id, headline, employer, text }
 *
 * The text of one Platsbanken ad, for the editor to prefill "anpassa CV:t efter
 * en annons" when the user arrives from our ad page (?jobb=<id>). The browser
 * cannot ask JobTech itself (connect-src), and the text is cut to what
 * /api/optimize-cv accepts.
 *
 * 404 covers a removed ad, an id that is not an ad, and a jobs API that is
 * down: the caller does the same thing in all three cases, which is nothing.
 */

const headers = { "Cache-Control": "private, no-store" }

/** Only for the rare ad that has formatted text but no plain text. */
function htmlToText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "\n- ")
    .replace(/<\/\s*(p|div|li|ul|ol|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
}

const tidy = (value: string): string =>
  value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Same budget as /api/jobs/match: one visitor, one allowance for jobs lookups.
  const limit = await checkRateLimit(apiRateLimit, `jobs:${getClientIP(request)}`, request)
  if (!limit.success) {
    return createRateLimitResponse(limit.remaining, limit.reset)
  }

  const { id } = await params
  const ad = await getJobAd(id)
  if (!ad) {
    return NextResponse.json({ error: "Annonsen finns inte längre." }, { status: 404, headers })
  }

  const text = tidy(ad.descriptionText || (ad.descriptionHtml ? htmlToText(ad.descriptionHtml) : ""))

  return NextResponse.json(
    {
      id: ad.id,
      headline: ad.headline,
      employer: ad.employer,
      text: text.slice(0, JOB_AD_MAX_LENGTH),
    },
    { headers }
  )
}
