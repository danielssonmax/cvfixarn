import { NextResponse } from "next/server"
import { matchJobsForCv } from "@/lib/jobs/match"
import type { JobMatchInput, JobMatchResult } from "@/lib/jobs/types"
import { apiRateLimit, checkRateLimit, createRateLimitResponse, getClientIP } from "@/lib/rate-limit"

export const runtime = "nodejs"

/**
 * POST { title, location, experienceTitles? } -> JobMatchResult (lib/jobs/types.ts)
 *
 * Asked by the editor to show "N lediga jobb som <yrke> i <ort>" next to a CV.
 * Anyone gets the counts; the ads themselves (jobs) are only included for a
 * signed-in user (Authorization: Bearer <Supabase access token>).
 *
 * The answer is always 200 with a status field unless the request itself is
 * wrong (400) or rate limited (429). A slow or failing jobs API gives
 * { status: "unavailable" }, never a 500, so the editor can ignore it.
 */

const MAX_BODY_LENGTH = 4000
const MAX_TEXT_LENGTH = 120
const MAX_EXPERIENCE_TITLES = 5
const BUDGET_MS = 8000

const UNAVAILABLE: JobMatchResult = { status: "unavailable" }

const respond = (result: JobMatchResult) =>
  NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } })

const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 })

function parseInput(body: unknown): JobMatchInput | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null
  const { title = "", location = "", experienceTitles = [] } = body as Record<string, unknown>
  if (typeof title !== "string" || typeof location !== "string") return null
  if (!Array.isArray(experienceTitles) || experienceTitles.some((item) => typeof item !== "string")) {
    return null
  }
  return {
    title: title.slice(0, MAX_TEXT_LENGTH),
    location: location.slice(0, MAX_TEXT_LENGTH),
    experienceTitles: experienceTitles
      .slice(0, MAX_EXPERIENCE_TITLES)
      .map((item: string) => item.slice(0, MAX_TEXT_LENGTH)),
  }
}

async function signedInUserId(request: Request): Promise<string | null> {
  try {
    // Loaded on demand: lib/subscription pulls in Stripe, which the anonymous
    // path has no reason to depend on.
    const { getUserIdFromRequest } = await import("@/lib/subscription")
    return await getUserIdFromRequest(request)
  } catch (error) {
    console.warn("[jobs] could not verify session:", error instanceof Error ? error.message : error)
    return null
  }
}

/** The editor is waiting on this, so give up rather than hang when the jobs API crawls. */
function withBudget(match: Promise<JobMatchResult>): Promise<JobMatchResult> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<JobMatchResult>((resolve) => {
    timer = setTimeout(() => resolve(UNAVAILABLE), BUDGET_MS)
  })
  return Promise.race([match, timeout]).finally(() => clearTimeout(timer))
}

export async function POST(request: Request) {
  const limit = await checkRateLimit(apiRateLimit, `jobs:${getClientIP(request)}`, request)
  if (!limit.success) {
    return createRateLimitResponse(limit.remaining, limit.reset)
  }

  let body: unknown
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_LENGTH) return badRequest("Request too large")
    body = JSON.parse(raw)
  } catch {
    return badRequest("Invalid JSON")
  }
  const input = parseInput(body)
  if (!input) {
    return badRequest("title and location must be strings, experienceTitles a list of strings")
  }

  try {
    const hasToken = (request.headers.get("authorization") || "").startsWith("Bearer ")
    const [result, userId] = await Promise.all([
      withBudget(matchJobsForCv(input, { withJobs: hasToken })),
      hasToken ? signedInUserId(request) : null,
    ])
    if (result.status === "ok" && !userId) {
      return respond({ ...result, jobs: [] })
    }
    return respond(result)
  } catch (error) {
    console.warn("[jobs] match failed:", error instanceof Error ? error.message : error)
    return respond(UNAVAILABLE)
  }
}
