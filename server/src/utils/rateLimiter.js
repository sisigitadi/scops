/**
 * In-Memory Sliding Window Rate Limiter Middleware
 * Protects against brute-force attacks and volumetric API abuse.
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60 * 1000 // 1 minute default
    this.max = options.max || 60 // 60 requests per minute default
    this.message = options.message || 'Too many requests, please try again later.'
    this.hits = new Map()

    // Periodically clean expired records every 2 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 2 * 60 * 1000)
    if (this.cleanupInterval.unref) this.cleanupInterval.unref()
  }

  cleanup() {
    const now = Date.now()
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter(t => now - t < this.windowMs)
      if (valid.length === 0) {
        this.hits.delete(key)
      } else {
        this.hits.set(key, valid)
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim()
      const key = `${clientIp}:${req.baseUrl || req.path}`
      const now = Date.now()

      const timestamps = this.hits.get(key) || []
      const recent = timestamps.filter(t => now - t < this.windowMs)

      if (recent.length >= this.max) {
        const oldest = recent[0]
        const retryAfterSec = Math.ceil((this.windowMs - (now - oldest)) / 1000)
        res.setHeader('Retry-After', retryAfterSec)
        res.setHeader('X-RateLimit-Limit', this.max)
        res.setHeader('X-RateLimit-Remaining', 0)
        res.setHeader('X-RateLimit-Reset', new Date(now + retryAfterSec * 1000).toISOString())
        return res.status(429).json({
          error: 'TOO_MANY_REQUESTS',
          message: this.message,
          retryAfter: `${retryAfterSec}s`
        })
      }

      recent.push(now)
      this.hits.set(key, recent)

      res.setHeader('X-RateLimit-Limit', this.max)
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - recent.length))
      next()
    }
  }
}

export const createRateLimiter = (options) => new RateLimiter(options).middleware()

// Pre-configured rate limiters
export const loginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10, // 10 attempts per minute per IP
  message: 'Too many authentication attempts. Please wait 60 seconds before trying again.'
})

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 300, // 300 requests per minute
  message: 'API rate limit exceeded. Please throttle your requests.'
})
