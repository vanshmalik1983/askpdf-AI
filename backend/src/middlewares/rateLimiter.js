import rateLimit from "express-rate-limit";

// Generic API limiter: generous enough for normal usage, tight enough
// to blunt scripted abuse.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});

// Auth endpoints get a much stricter limit — this is the classic
// brute-force / credential-stuffing surface.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts. Please try again later." },
});

// Chat/ask endpoint hits Gemini per call — rate limit protects both
// the API bill and per-user fair usage.
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "You're asking questions too quickly. Please wait a moment." },
});
