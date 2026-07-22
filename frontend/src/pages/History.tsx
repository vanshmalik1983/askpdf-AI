import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessagesSquare, ShieldAlert, FileText } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { EmptyState } from "@/components/EmptyState";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { api, ApiError, type ChatMessage } from "@/lib/api";

type HistoryEntry = ChatMessage & { document: { _id: string; originalName: string } };

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await api.getAllHistory(1, 30);
        setEntries(result);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't load your history.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="container-page py-10 md:py-14">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-[28px] font-medium text-ink">Question history</h1>
          <p className="mt-1 text-sm text-ink-soft">Every question you've asked, across every document.</p>
        </motion.div>

        {error && <p className="mt-6 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>}

        <div className="mt-8 space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-card border border-paper-line bg-white/60" />
            ))
          ) : entries.length === 0 ? (
            <EmptyState
              icon={<MessagesSquare size={20} />}
              title="No questions yet"
              description="Once you ask a document something, it'll show up here for easy reference later."
            />
          ) : (
            entries.map((entry, i) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
                className="card p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    to={`/documents/${entry.document._id}`}
                    state={{ name: entry.document.originalName }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-cobalt hover:text-cobalt-dark"
                  >
                    <FileText size={12} />
                    {entry.document.originalName}
                  </Link>
                  <span className="text-xs text-ink-faint">{timeAgo(entry.createdAt)}</span>
                </div>

                <p className="mt-3 text-[14.5px] font-medium text-ink">{entry.question}</p>

                <div className={`mt-2.5 flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                  entry.isFallback ? "bg-paper-dim text-ink-soft" : "bg-paper text-ink"
                }`}>
                  {entry.isFallback && <ShieldAlert size={14} className="mt-0.5 shrink-0 text-ink-faint" />}
                  <span>{entry.answer}</span>
                </div>

                {!entry.isFallback && (
                  <div className="mt-2.5">
                    <ConfidenceMeter score={entry.confidenceScore} />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
