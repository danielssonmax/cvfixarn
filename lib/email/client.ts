import { Resend } from "resend"

/**
 * Shared Resend client + the handful of brand constants the templates need.
 *
 * Nothing here throws at import time: the cron route imports this module and
 * must be able to report "not configured" as a clean 500 rather than crashing
 * the whole serverless function on a cold start.
 */

let cached: Resend | null = null

export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  if (!cached) cached = new Resend(apiKey)
  return cached
}

/**
 * Absolute site origin, with no trailing slash.
 *
 * The repo is inconsistent about which var holds this (NEXT_PUBLIC_URL in
 * .env.local, NEXT_PUBLIC_BASE_URL in the Stripe actions), so accept either and
 * fall back to the production domain rather than emitting "undefined/..." links
 * into an email that we cannot take back.
 */
export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    "https://www.cvfixaren.se"
  return configured.replace(/\/+$/, "")
}

export const BRAND = {
  name: "CVfixaren.se",
  green: "#00bf63",
  greenDark: "#00a857",
  ink: "#111827",
  body: "#4b5563",
  muted: "#6b7280",
  hairline: "#e5e7eb",
  canvas: "#f4f5f7",
} as const

/** From-header. Must be a verified Resend domain or sending fails. */
export function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "CVfixaren <no-reply@cvfixaren.se>"
}

/** Where "Svara" goes. Support inbox, not the no-reply sender. */
export function getReplyToAddress(): string | undefined {
  return process.env.RESEND_REPLY_TO || undefined
}
