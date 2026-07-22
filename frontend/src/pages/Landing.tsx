import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UploadCloud,
  MessageSquareText,
  ShieldCheck,
  Layers,
  History,
  Gauge,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const EvidenceStack3D = lazy(() =>
  import("@/components/EvidenceStack3D").then((m) => ({ default: m.EvidenceStack3D }))
);

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const STEPS = [
  {
    n: "01",
    title: "Upload the PDF",
    body: "Drop in a paper, contract, or spec sheet. It's parsed page by page and split into passages so nothing gets flattened into one big blob.",
    icon: UploadCloud,
  },
  {
    n: "02",
    title: "Ask it directly",
    body: "Type a question the way you'd ask a colleague who already read it. No need to guess the document's exact wording.",
    icon: MessageSquareText,
  },
  {
    n: "03",
    title: "Get a grounded answer",
    body: "The answer comes back with the page it was pulled from and a match score — or a plain admission that the document doesn't cover it.",
    icon: ShieldCheck,
  },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Refuses to guess",
    body: "If the retrieved passages don't clear a confidence threshold, you get told the document doesn't contain the answer — not a confident-sounding invention.",
  },
  {
    icon: Layers,
    title: "Page-level citations",
    body: "Every answer names the page it came from, with the exact passage available to expand and check yourself.",
  },
  {
    icon: Gauge,
    title: "Async processing",
    body: "Large PDFs are parsed and embedded in the background, so uploading a 200-page document never locks up your screen.",
  },
  {
    icon: History,
    title: "Full chat history",
    body: "Every question and answer is saved per document, so a research session doesn't start from zero each time you come back.",
  },
  {
    icon: MessageSquareText,
    title: "Page & document summaries",
    body: "Get a page-by-page breakdown or one overall summary before you start asking targeted questions.",
  },
  {
    icon: UploadCloud,
    title: "Built for real documents",
    body: "Contracts, research papers, specs — sentence-aware chunking keeps context intact instead of cutting mid-thought.",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid grid-cols-1 items-center gap-10 pb-16 pt-14 md:grid-cols-2 md:pb-24 md:pt-20">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.span variants={fadeUp} className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
              Reads only what you gave it
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-5 text-balance text-[2.6rem] font-medium leading-[1.08] text-ink sm:text-5xl lg:text-[3.4rem]"
            >
              Ask the page,
              <br />
              not the internet.
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-soft">
              Upload a PDF and ask it questions in plain language. Every answer points back to the exact
              page it came from — and if the document doesn't say, it tells you that instead of guessing.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
              <Link to={user ? "/dashboard" : "/signup"} className="btn-primary">
                {user ? "Go to dashboard" : "Upload your first PDF"}
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                See how it works
              </a>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 text-xs text-ink-faint">
              No credit card. Free to try with your own documents.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <Suspense
              fallback={
                <div className="h-[380px] w-full animate-pulse rounded-card bg-paper-dim sm:h-[440px] md:h-[520px]" />
              }
            >
              <EvidenceStack3D />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-paper-line bg-white/50 py-20 md:py-28">
        <div className="container-page">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mb-14 max-w-lg"
          >
            <motion.span variants={fadeUp} className="eyebrow">
              How it works
            </motion.span>
            <motion.h2 variants={fadeUp} className="mt-3 text-3xl font-medium text-ink sm:text-4xl">
              Three steps. No prompt engineering required.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {STEPS.map((step) => (
              <motion.div key={step.n} variants={fadeUp} className="card relative p-7">
                <span className="font-mono text-xs font-medium text-ink-faint">{step.n}</span>
                <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-marker-soft text-ink">
                  <step.icon size={19} strokeWidth={2} />
                </div>
                <h3 className="mt-5 font-display text-lg font-medium text-ink">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live example */}
      <section className="py-20 md:py-28">
        <div className="container-page grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="eyebrow">
              The part that matters
            </motion.span>
            <motion.h2 variants={fadeUp} className="mt-3 text-3xl font-medium text-ink sm:text-4xl">
              Two questions. Two honest answers.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
              A generic chat tool will answer both of these questions confidently, whether or not the
              document backs it up. AskPDF AI checks the retrieved passages against a similarity
              threshold before it ever generates a response — so the second answer is a refusal, not a
              hallucination.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="space-y-4"
          >
            <motion.div variants={fadeUp} className="card p-5">
              <p className="text-sm font-semibold text-ink">"What's the notice period for termination?"</p>
              <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-verified-soft p-3.5">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-verified" />
                <p className="text-[13.5px] leading-relaxed text-ink">
                  <span className="marker-underline">60 days written notice</span>, delivered to the
                  registered address.{" "}
                  <span className="font-mono text-xs text-ink-faint">Page 4 · 92% match</span>
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="card p-5">
              <p className="text-sm font-semibold text-ink">"What's the company's stock ticker?"</p>
              <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-paper-dim p-3.5">
                <XCircle size={16} className="mt-0.5 shrink-0 text-ink-soft" />
                <p className="text-[13.5px] leading-relaxed text-ink-soft">
                  The uploaded document does not contain enough information to answer this question.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-paper-line bg-white/50 py-20 md:py-28">
        <div className="container-page">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mb-14 max-w-lg"
          >
            <motion.span variants={fadeUp} className="eyebrow">
              Built for actually reading documents
            </motion.span>
            <motion.h2 variants={fadeUp} className="mt-3 text-3xl font-medium text-ink sm:text-4xl">
              Everything past the demo
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="card p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cobalt-soft text-cobalt-dark">
                  <f.icon size={18} strokeWidth={2} />
                </div>
                <h3 className="mt-4 font-display text-[16px] font-medium text-ink">{f.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="card flex flex-col items-center gap-5 px-8 py-16 text-center"
          >
            <h2 className="max-w-lg text-balance font-display text-3xl font-medium text-ink sm:text-4xl">
              Stop skimming. Start asking.
            </h2>
            <p className="max-w-sm text-[15px] text-ink-soft">
              Upload the first PDF that's been sitting in your downloads folder unread.
            </p>
            <Link to={user ? "/dashboard" : "/signup"} className="btn-primary mt-2">
              {user ? "Go to dashboard" : "Get started free"}
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
