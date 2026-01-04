const rateLimitMap = new Map();

/**
 * Rate limiter function
 * @param {string} identifier - Unique identifier (e.g., IP address)
 * @param {number} limit - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if limit exceeded, false otherwise
 */
export function isRateLimited(identifier, limit = 5, windowMs = 60 * 1000) {
    const now = Date.now();

    // Clean up old entries occasionally to prevent memory leaks
    if (rateLimitMap.size > 10000) {
        rateLimitMap.clear();
    }

    const record = rateLimitMap.get(identifier);

    if (!record) {
        rateLimitMap.set(identifier, { count: 1, startTime: now });
        return false;
    }

    if (now - record.startTime > windowMs) {
        // Reset window
        rateLimitMap.set(identifier, { count: 1, startTime: now });
        return false;
    }

    // Increment count
    record.count += 1;

    if (record.count > limit) {
        return true;
    }

    return false;
}
