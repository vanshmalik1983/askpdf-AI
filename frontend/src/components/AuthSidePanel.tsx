import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const POINTS = [
  "Every answer cites the exact page it came from",
  "Questions outside the document get an honest refusal, not a guess",
  "Full chat history saved per document",
];

export function AuthSidePanel() {
  return (
    <div className="relative hidden overflow-hidden bg-paper-dim md:flex md:flex-col md:justify-center md:px-16">
      <div className="pointer-events-none absolute inset-0 bg-grain" />

      {/* Scattered paper illustration */}
      <div className="pointer-events-none absolute -right-10 top-1/2 h-[340px] w-[280px] -translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, rotate: 8, y: 20 }}
          animate={{ opacity: 1, rotate: -6, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-6 top-10 h-64 w-48 rounded-card border border-paper-line bg-[#F6F5F0] shadow-paper"
        />
        <motion.div
          initial={{ opacity: 0, rotate: -4, y: 20 }}
          animate={{ opacity: 1, rotate: 4, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="absolute left-16 top-4 h-64 w-48 rounded-card border border-paper-line bg-white shadow-paper-lg"
        >
          <div className="space-y-2.5 p-6">
            {[0.9, 0.65, 0.8, 0.4].map((w, i) => (
              <div
                key={i}
                className={`h-2 rounded-full ${i === 1 ? "bg-marker" : "bg-paper-line"}`}
                style={{ width: `${w * 100}%` }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative max-w-xs"
      >
        <span className="eyebrow">Grounded by design</span>
        <p className="mt-4 font-display text-2xl font-medium leading-snug text-ink text-balance">
          When the document doesn't have the answer, you'll hear that plainly — never a confident guess.
        </p>
        <ul className="mt-8 space-y-3">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-verified" />
              {point}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
