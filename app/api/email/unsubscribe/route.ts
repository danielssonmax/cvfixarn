import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyUnsubscribeToken, UNSUBSCRIBE_SCOPE_JOB_ALERT } from "@/lib/email/tokens"
import { BRAND, getSiteUrl } from "@/lib/email/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Opt-out endpoint for lifecycle emails.
 *
 * Two entry points, both required:
 *   GET  — the human clicking "Avregistrera dig" in the footer. Opts out
 *          immediately (no "click here to confirm" step) and offers an undo,
 *          which also covers link-scanners that prefetch the URL.
 *   POST — RFC 8058 one-click, which Gmail and Yahoo call on the user's behalf
 *          when they hit the unsubscribe button in the client chrome. Required
 *          for bulk senders; must not render anything.
 *
 * What gets switched off depends on the scope signed into the token: a link
 * from the weekly job email ("job_alert") turns off that email only, every
 * other token opts out of all lifecycle email as before.
 */

function page(title: string, body: string, actionHtml = ""): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${title} · ${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.canvas};font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:64px 20px;">
    <div style="text-align:center;font-size:19px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.2px;">
      CV<span style="color:${BRAND.green};">fixaren</span>.se
    </div>
    <div style="margin-top:20px;background:#fff;border:1px solid ${BRAND.hairline};border-radius:16px;padding:36px 32px;text-align:center;">
      <h1 style="margin:0;font-size:22px;line-height:30px;color:${BRAND.ink};">${title}</h1>
      <p style="margin:12px 0 0;font-size:15px;line-height:24px;color:${BRAND.body};">${body}</p>
      ${actionHtml}
      <p style="margin:26px 0 0;">
        <a href="${getSiteUrl()}" style="display:inline-block;padding:13px 26px;background:${BRAND.green};color:#fff;font-weight:600;font-size:15px;border-radius:10px;text-decoration:none;">Till ${BRAND.name}</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

function html(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  })
}

function getAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** Flips marketing_opt_out. Returns an error string, or null on success. */
async function setOptOut(uid: string, optOut: boolean): Promise<string | null> {
  const admin = getAdmin()
  if (!admin) return "Server is not configured"

  const { error } = await admin
    .from("premium")
    .update({ marketing_opt_out: optOut, updated_at: new Date().toISOString() })
    .eq("uid", uid)

  return error ? error.message : null
}

/**
 * Switches the weekly job email off (or back on, for the undo link). Only ever
 * touches a row the user created themselves, so the undo cannot opt anyone in.
 *
 * Switching off here also stamps unsubscribed_at. While that is set the editor
 * cannot switch the email back on (app/api/jobs/alerts/route.ts) and the cron
 * skips the row: the stop came from whoever reads the mailbox, and only the
 * undo link from that same mailbox clears it.
 */
async function setJobAlertActive(uid: string, active: boolean): Promise<string | null> {
  const admin = getAdmin()
  if (!admin) return "Server is not configured"

  const now = new Date().toISOString()
  const { error } = await admin
    .from("job_alerts")
    .update({ active, unsubscribed_at: active ? null : now, updated_at: now })
    .eq("uid", uid)

  return error ? error.message : null
}

/** Applies the opt-out (or its undo) that the token's scope stands for. */
function applyChoice(payload: { uid: string; scope: string }, optOut: boolean): Promise<string | null> {
  return payload.scope === UNSUBSCRIBE_SCOPE_JOB_ALERT
    ? setJobAlertActive(payload.uid, !optOut)
    : setOptOut(payload.uid, optOut)
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const undo = request.nextUrl.searchParams.get("undo") === "1"

  const payload = token ? verifyUnsubscribeToken(token) : null
  if (!payload) {
    return html(
      page(
        "Länken är ogiltig",
        "Vi kunde inte läsa avregistreringslänken. Kontakta oss så hjälper vi dig direkt."
      ),
      400
    )
  }

  const error = await applyChoice(payload, !undo)
  if (error) {
    console.error("[unsubscribe] update failed:", error)
    return html(
      page("Något gick fel", "Vi kunde inte spara ditt val. Försök igen om en stund."),
      500
    )
  }

  const jobAlert = payload.scope === UNSUBSCRIBE_SCOPE_JOB_ALERT

  if (undo) {
    return html(
      jobAlert
        ? page(
            "Jobbmejlet är påslaget igen",
            "Du får nya jobb på mejl på måndagar, de veckor det finns nya annonser."
          )
        : page(
            "Du är påslagen igen",
            "Du kommer återigen att få påminnelser och tips från oss."
          )
    )
  }

  const undoUrl = `${getSiteUrl()}/api/email/unsubscribe?token=${encodeURIComponent(
    token as string
  )}&undo=1`

  if (jobAlert) {
    return html(
      page(
        "Jobbmejlet är avstängt",
        "Du får inga fler jobbmejl från oss. Andra mejl från oss påverkas inte.",
        `<p style="margin:18px 0 0;font-size:13px;line-height:20px;color:${BRAND.muted};">
           Stängde du av det av misstag?
           <a href="${undoUrl}" style="color:${BRAND.green};">Ångra</a>
         </p>`
      )
    )
  }

  return html(
    page(
      "Du är avregistrerad",
      "Du kommer inte att få fler påminnelser från oss. Viktiga mejl om ditt konto och din betalning skickas fortfarande.",
      `<p style="margin:18px 0 0;font-size:13px;line-height:20px;color:${BRAND.muted};">
         Avregistrerade du dig av misstag?
         <a href="${undoUrl}" style="color:${BRAND.green};">Ångra</a>
       </p>`
    )
  )
}

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const payload = token ? verifyUnsubscribeToken(token) : null
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 })
  }

  const error = await applyChoice(payload, true)
  if (error) {
    console.error("[unsubscribe] one-click update failed:", error)
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
