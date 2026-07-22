import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Sparkles,
  ShieldAlert,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { CitationChip } from "@/components/CitationChip";
import { EmptyState } from "@/components/EmptyState";
import { api, ApiError, type ChatMessage, type DocumentItem, type SummaryData } from "@/lib/api";

type Tab = "chat" | "summary";

export default function Workspace() {
  const { id } = useParams<{ id: string }>();
  const documentId = id!;
  const location = useLocation();
  const docName = (location.state as { name?: string })?.name || "Document";

  const [tab, setTab] = useState<Tab>("chat");
  const [status, setStatus] = useState<DocumentItem["status"] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const summaryPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const s = await api.getDocumentStatus(documentId);
        setStatus(s.status);
      } catch {
        setStatus("failed");
      }
      try {
        const history = await api.getDocumentHistory(documentId);
        setMessages([...history].reverse());
      } catch {
        // A missing history is a normal empty state, not an error.
      } finally {
        setIsLoadingHistory(false);
      }
    }
    load();
  }, [documentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await api.getSummary(documentId);
      setSummary(data);
      if (data.status === "ready" || data.status === "failed") {
        if (summaryPollRef.current) {
          clearInterval(summaryPollRef.current);
          summaryPollRef.current = null;
        }
      }
    } catch {
      // No summary requested yet — leave summary as null so the CTA shows.
    }
  }, [documentId]);

  useEffect(() => {
    if (tab === "summary" && !summary) loadSummary();
    return () => {
      if (summaryPollRef.current) clearInterval(summaryPollRef.current);
    };
  }, [tab, summary, loadSummary]);

  async function handleRequestSummary() {
    setIsSummaryLoading(true);
    try {
      await api.requestSummary(documentId);
      setSummary({ status: "pending" });
      summaryPollRef.current = setInterval(loadSummary, 3500);
    } catch (err) {
      setSummary({ status: "failed" });
    } finally {
      setIsSummaryLoading(false);
    }
  }

  async function handleAsk(e: FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isAsking) return;

    setChatError(null);
    setIsAsking(true);
    setQuestion("");

    const optimisticId = `pending-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { _id: optimisticId, question: trimmed, answer: "", citations: [], confidenceScore: 0, isFallback: false, createdAt: new Date().toISOString() },
    ]);

    try {
      const result = await api.askQuestion(documentId, trimmed);
      setMessages((prev) => prev.map((m) => (m._id === optimisticId ? result : m)));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
      setChatError(err instanceof ApiError ? err.message : "Couldn't get an answer. Please try again.");
    } finally {
      setIsAsking(false);
    }
  }

  const isReady = status === "ready";

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <div className="border-b border-paper-line bg-white/60">
        <div className="container-page flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={17} />
            </Link>
            <div>
              <h1 className="line-clamp-1 font-display text-lg font-medium text-ink">{docName || "Document"}</h1>
              {status && <div className="mt-0.5"><StatusBadge status={status} /></div>}
            </div>
          </div>

          <div className="flex gap-1 rounded-full bg-paper-dim p-1">
            {(["chat", "summary"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                  tab === t ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isReady && status && status !== "failed" && (
        <div className="container-page mt-6">
          <div className="flex items-center gap-2.5 rounded-lg bg-cobalt-soft px-4 py-3 text-sm text-cobalt-dark">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cobalt-dark/40 border-t-cobalt-dark" />
            Still processing this document — chat and summaries will be available once it's ready.
          </div>
        </div>
      )}
      {status === "failed" && (
        <div className="container-page mt-6">
          <div className="flex items-center gap-2.5 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
            <AlertCircle size={15} />
            This document failed to process. Try deleting it and uploading again.
          </div>
        </div>
      )}

      {tab === "chat" ? (
        <main className="container-page flex flex-1 flex-col py-6">
          <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto pb-4">
            {isLoadingHistory ? (
              <div className="flex justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink/15 border-t-cobalt" />
              </div>
            ) : messages.length === 0 ? (
              <EmptyState
                icon={<Sparkles size={20} />}
                title="Ask your first question"
                description={
                  isReady
                    ? "Try something specific — a number, a clause, a definition. You'll get the page it came from."
                    : "You'll be able to ask questions once this document finishes processing."
                }
              />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-4 py-2.5 text-[14px] text-paper">
                        {msg.question}
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-[85%] space-y-3">
                        {msg.answer === "" ? (
                          <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-paper-line bg-white px-4 py-3">
                            <span className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint"
                                  style={{ animationDelay: `${i * 0.12}s` }}
                                />
                              ))}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div
                              className={`rounded-2xl rounded-tl-sm border px-4 py-3 text-[14px] leading-relaxed ${
                                msg.isFallback
                                  ? "border-paper-line bg-paper-dim text-ink-soft"
                                  : "border-paper-line bg-white text-ink"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {msg.isFallback && <ShieldAlert size={15} className="mt-0.5 shrink-0 text-ink-faint" />}
                                <span>{msg.answer}</span>
                              </div>
                            </div>

                            {!msg.isFallback && msg.citations.length > 0 && (
                              <div className="space-y-2 pl-1">
                                <ConfidenceMeter score={msg.confidenceScore} />
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {msg.citations.map((c, i) => (
                                    <CitationChip key={i} citation={c} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {chatError && (
            <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-danger">
              <AlertCircle size={14} />
              {chatError}
            </p>
          )}

          <form onSubmit={handleAsk} className="sticky bottom-4 flex items-center gap-2 rounded-full border border-paper-line bg-white p-1.5 shadow-paper-lg">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!isReady || isAsking}
              maxLength={500}
              placeholder={isReady ? "Ask something about this document…" : "Waiting for processing to finish…"}
              className="flex-1 bg-transparent px-4 py-2 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!isReady || isAsking || !question.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-cobalt disabled:opacity-40"
              aria-label="Send question"
            >
              <Send size={16} />
            </button>
          </form>
        </main>
      ) : (
        <main className="container-page py-8">
          <SummaryPanel
            summary={summary}
            isLoading={isSummaryLoading}
            isReady={isReady}
            onRequest={handleRequestSummary}
          />
        </main>
      )}
    </div>
  );
}

function SummaryPanel({
  summary,
  isLoading,
  isReady,
  onRequest,
}: {
  summary: SummaryData | null;
  isLoading: boolean;
  isReady: boolean;
  onRequest: () => void;
}) {
  if (!isReady) {
    return (
      <EmptyState
        icon={<FileText size={20} />}
        title="Not ready yet"
        description="Summaries are available once this document finishes processing."
      />
    );
  }

  if (!summary) {
    return (
      <EmptyState
        icon={<Sparkles size={20} />}
        title="No summary yet"
        description="Generate a page-by-page and overall summary of this document."
        action={
          <button onClick={onRequest} disabled={isLoading} className="btn-primary">
            {isLoading ? "Starting…" : "Generate summary"}
          </button>
        }
      />
    );
  }

  if (summary.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-paper-line bg-white/60 px-6 py-16 text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-cobalt" />
        <h3 className="font-display text-lg font-medium text-ink">Generating summary…</h3>
        <p className="mt-1.5 max-w-sm text-sm text-ink-faint">
          This runs page by page, so longer documents take a bit more time.
        </p>
      </div>
    );
  }

  if (summary.status === "failed") {
    return (
      <EmptyState
        icon={<AlertCircle size={20} />}
        title="Summary generation failed"
        description="Something went wrong while summarizing this document."
        action={
          <button onClick={onRequest} className="btn-secondary">
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <span className="eyebrow">Overall summary</span>
        <p className="mt-3 text-[15px] leading-relaxed text-ink">{summary.overallSummary}</p>
      </div>

      {summary.pageSummaries && summary.pageSummaries.length > 0 && (
        <div>
          <span className="eyebrow">Page by page</span>
          <div className="mt-4 space-y-3">
            {summary.pageSummaries
              .sort((a, b) => a.pageNumber - b.pageNumber)
              .map((p) => (
                <div key={p.pageNumber} className="card flex gap-4 p-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-dim font-mono text-xs font-semibold text-ink-soft">
                    {p.pageNumber}
                  </div>
                  <p className="text-[14px] leading-relaxed text-ink-soft">{p.summary}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
