// Simple in-memory rate limiter — no Redis required
// Stores per-IP hit counts with automatic expiry windows.

const store = new Map(); // key → { count, resetAt }

/**
 * Build a rate-limiter middleware.
 * @param {number} maxRequests  Max allowed requests per window.
 * @param {number} windowMs     Window size in milliseconds.
 */
function createLimiter(maxRequests, windowMs) {
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${ip}`;

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      store.set(key, entry);
      return next();
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return res.status(429).json({
        error: `Rate limit exceeded. Please wait ${retryAfter} second${retryAfter !== 1 ? 's' : ''}.`
      });
    }

    return next();
  };
}

// 100 requests per minute — general API endpoints
export const generalLimiter = createLimiter(100, 60 * 1000);

// 10 requests per minute — expensive AI endpoints
export const aiLimiter = createLimiter(10, 60 * 1000);
