/**
 * Minimal structured logger. Swappable for pino/winston in production
 * without touching call sites, since every module imports from here.
 */
const ts = () => new Date().toISOString();

export const logger = {
  info: (msg, meta) => console.log(`[INFO] ${ts()} - ${msg}`, meta ?? ""),
  warn: (msg, meta) => console.warn(`[WARN] ${ts()} - ${msg}`, meta ?? ""),
  error: (msg, err) => console.error(`[ERROR] ${ts()} - ${msg}`, err?.stack || err || ""),
};
