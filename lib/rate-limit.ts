import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Upstash counts as configured only with an https URL and a token. A placeholder
// such as the literal "null" is truthy, and new Redis() throws on it. That would
// happen at import and take down every route that imports this file, so anything
// that is not a usable URL means "not configured" and the limits count in memory.
function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token || !/^https:\/\//.test(url)) return null
  try {
    return new Redis({ url, token })
  } catch {
    return null
  }
}

/** The shared Upstash client, or null when Upstash is not configured. */
export const upstashRedis = createRedis()

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  /** Unix time in milliseconds when the limit frees up again. */
  reset: number
}

/** What checkRateLimit needs from a limiter. An Upstash Ratelimit fits as it is. */
export interface RateLimiter {
  limit(identifier: string): Promise<RateLimitResult>
}

const MAX_TRACKED_KEYS = 5000

// Sliding window kept in this process, for when there is no Redis. Each server
// instance counts on its own, so it is weaker than Upstash, but never unlimited.
function createMemoryLimiter(max: number, windowMs: number): RateLimiter {
  const hits = new Map<string, number[]>()

  return {
    async limit(identifier) {
      const now = Date.now()

      if (hits.size >= MAX_TRACKED_KEYS && !hits.has(identifier)) {
        hits.forEach((times, key) => {
          if (now - (times[times.length - 1] ?? 0) >= windowMs) hits.delete(key)
        })
        if (hits.size >= MAX_TRACKED_KEYS) hits.clear()
      }

      const recent = (hits.get(identifier) || []).filter((time) => now - time < windowMs)
      const success = recent.length < max
      if (success) recent.push(now)
      hits.set(identifier, recent)

      return {
        success,
        limit: max,
        remaining: max - recent.length,
        // The oldest request in the window is the next one to drop out of it.
        reset: (recent[0] ?? now) + windowMs,
      }
    },
  }
}

function createLimiter(prefix: string, max: number, minutes: number): RateLimiter {
  if (!upstashRedis) return createMemoryLimiter(max, minutes * 60 * 1000)
  return new Ratelimit({
    redis: upstashRedis,
    limiter: Ratelimit.slidingWindow(max, `${minutes} m`),
    analytics: true,
    prefix,
  })
}

// Rate limit configurations
export const authRateLimit = createLimiter("auth", 5, 15) // 5 requests per 15 minutes
export const apiRateLimit = createLimiter("api", 100, 1) // 100 requests per minute
export const paymentRateLimit = createLimiter("payment", 10, 1) // 10 requests per minute
export const strictRateLimit = createLimiter("strict", 3, 1) // 3 requests per minute

// Helper function to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

// Rate limiting middleware
export async function checkRateLimit(
  rateLimit: RateLimiter,
  identifier: string,
  request: Request
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  try {
    const { success, limit, remaining, reset } = await rateLimit.limit(identifier)

    return {
      success,
      limit,
      remaining,
      reset: new Date(reset),
    }
  } catch (error) {
    console.error("Rate limit error:", error)
    // Allow request if rate limiting fails
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: new Date(Date.now() + 60000),
    }
  }
}

// Rate limit response helper
export function createRateLimitResponse(remaining: number, reset: Date) {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      message: "För många förfrågningar. Försök igen senare.",
      retryAfter: Math.ceil((reset.getTime() - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toISOString(),
        "Retry-After": Math.ceil((reset.getTime() - Date.now()) / 1000).toString(),
      },
    }
  )
}
