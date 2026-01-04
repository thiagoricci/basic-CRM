import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Redis is properly configured
const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Initialize Redis client for rate limiting
let redis: Redis | null = null;

if (isRedisConfigured) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    console.log('[RateLimit] Redis client initialized successfully');
  } catch (error) {
    console.error('[RateLimit] Failed to initialize Redis client:', error);
  }
} else {
  console.warn('[RateLimit] Redis not configured. Rate limiting will be disabled.');
  console.warn('[RateLimit] To enable rate limiting, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local');
}

// Rate limiters for different endpoints
export const rateLimiters = {
  // Signup: 3 requests per hour per IP
  signup: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'signup',
  }) : null,

  // Signin: 10 requests per hour per IP
  signin: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'signin',
  }) : null,

  // Forgot password: 3 requests per hour per IP
  forgotPassword: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'forgot-password',
  }) : null,

  // Reset password: 5 requests per hour per token
  resetPassword: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: 'reset-password',
  }) : null,

  // Verify email: 10 requests per hour per token
  verifyEmail: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'verify-email',
  }) : null,

  // Resend verification: 3 requests per minute per email
  resendVerification: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    analytics: true,
    prefix: 'resend-verification',
  }) : null,

  // Enable 2FA: 3 requests per hour per user
  enable2FA: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'enable-2fa',
  }) : null,

  // Verify 2FA: 10 requests per hour per user
  verify2FA: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'verify-2fa',
  }) : null,
};

// Rate limit check function
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // If rate limiter is not configured (Redis not available), allow the request (fail open)
  if (!limiter) {
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 3600000,
    };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);
    // If Redis is unavailable, allow the request (fail open)
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 3600000,
    };
  }
}

// Get rate limit headers for response
export function getRateLimitHeaders(result: { limit: number; remaining: number; reset: number }): {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
} {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
}

// Rate limit error response
export function getRateLimitErrorResponse(result: { limit: number; remaining: number; reset: number }): string {
  return JSON.stringify({
    data: null,
    error: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
  });
}
