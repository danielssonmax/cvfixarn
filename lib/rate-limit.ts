import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create Redis instance (fallback to in-memory if no Redis URL)
const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// Rate limit configurations
export const authRateLimit = new Ratelimit({
  redis: redis || new Map(), // Fallback to in-memory storage
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 requests per 15 minutes
  analytics: true,
  prefix: "auth",
})

export const apiRateLimit = new Ratelimit({
  redis: redis || new Map(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  analytics: true,
  prefix: "api",
})

export const paymentRateLimit = new Ratelimit({
  redis: redis || new Map(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
  prefix: "payment",
})

export const strictRateLimit = new Ratelimit({
  redis: redis || new Map(),
  limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 requests per minute
  analytics: true,
  prefix: "strict",
})

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
  rateLimit: Ratelimit,
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
