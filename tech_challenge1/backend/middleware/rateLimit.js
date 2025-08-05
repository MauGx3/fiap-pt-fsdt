import rateLimit from 'express-rate-limit';

// Skip rate limiting in test environment for most tests
const isTestEnvironment = process.env.NODE_ENV === 'test';

// General rate limiter for all routes
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnvironment ? 1000 : 100, // Higher limit for tests
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => isTestEnvironment && !req.headers['x-test-rate-limit'], // Skip unless explicitly testing rate limiting
});

// Strict rate limiter for authentication routes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestEnvironment ? 50 : 5, // Higher limit for tests
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => isTestEnvironment && !req.headers['x-test-rate-limit'], // Skip unless explicitly testing rate limiting
});

// Rate limiter for creating posts
export const createPostRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isTestEnvironment ? 100 : 10, // Higher limit for tests
  message: {
    error: 'Too many posts created from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isTestEnvironment && !req.headers['x-test-rate-limit'], // Skip unless explicitly testing rate limiting
});

// Rate limiter for user registration
export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isTestEnvironment ? 50 : 3, // Higher limit for tests
  message: {
    error: 'Too many registration attempts from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isTestEnvironment && !req.headers['x-test-rate-limit'], // Skip unless explicitly testing rate limiting
});
