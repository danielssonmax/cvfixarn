import crypto from "crypto"

/**
 * HMAC-signed unsubscribe tokens.
 *
 * The unsubscribe link has to work without a login (people click it from an
 * inbox on a device that was never signed in), so the URL itself has to carry
 * the identity. Signing it stops anyone from unsubscribing another user by
 * guessing uids, and stops the endpoint from being a mass opt-out button.
 */

function getSecret(): string {
  const secret =
    process.env.EMAIL_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    throw new Error(
      "EMAIL_TOKEN_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set to sign email links"
    )
  }
  return secret
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url")
}

/** Token format: `<uid>.<scope>.<hmac>` — opaque enough, and self-verifying. */
export function createUnsubscribeToken(uid: string, scope = "marketing"): string {
  const payload = `${uid}.${scope}`
  return `${payload}.${sign(payload)}`
}

export function verifyUnsubscribeToken(
  token: string
): { uid: string; scope: string } | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null

  const [uid, scope, signature] = parts
  if (!uid || !scope || !signature) return null

  const expected = sign(`${uid}.${scope}`)

  // Constant-time compare. timingSafeEqual throws on length mismatch, so guard.
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null
  if (!crypto.timingSafeEqual(a, b)) return null

  return { uid, scope }
}
