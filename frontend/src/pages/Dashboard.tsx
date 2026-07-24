import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileStack, MessagesSquare } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { UploadDropzone } from "@/components/UploadDropzone";
import { DocumentCard } from "@/components/DocumentCard";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { api, ApiError, type DocumentItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Refresh document status every 4 seconds while processing.
const POLL_INTERVAL_MS = 4000;

// Documents with these statuses are still being processed.
const PROCESSING_STATUSES = ["queued", "processing"];

export default function Dashboard() {
  const { user } = useAuth();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDocuments = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);

    try {
      const result = await api.listDocuments(1, 24);
      setDocuments(result.items);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load your documents."
      );
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(true);
  }, [fetchDocuments]);

  // Poll while documents are still being processed so that
  // status badges update automatically.
  useEffect(() => {
    const hasInFlight = documents.some((doc) =>
      PROCESSING_STATUSES.includes(doc.status)
    );

    if (hasInFlight && !pollRef.current) {
      pollRef.current = setInterval(
        () => fetchDocuments(false),
        POLL_INTERVAL_MS
      );
    }

    if (!hasInFlight && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [documents, fetchDocuments]);

  /**
   * Optimistically update the UI immediately after upload
   * instead of waiting for the next polling cycle.
   */
  async function handleUpload(file: File) {
    const uploaded = await api.uploadDocument(file);

    setDocuments((prev) => [
      {
        _id: uploaded.id,
        originalName: uploaded.originalName,
        status: uploaded.status as DocumentItem["status"],
        pageCount: 0,
        chunkCount: 0,
        fileSizeBytes: file.size,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;

    setIsDeleting(true);

    try {
      await api.deleteDocument(pendingDeleteId);

      setDocuments((prev) =>
        prev.filter((doc) => doc._id !== pendingDeleteId)
      );
    } catch {
      // Keep the UI in sync if deletion fails.
      fetchDocuments(false);
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  }

  const readyCount = documents.filter(
    (doc) => doc.status === "ready"
  ).length;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="container-page py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <h1 className="font-display text-[28px] font-medium text-ink">
              {user
                ? `${user.name.split(" ")[0]}'s documents`
                : "Your documents"}
            </h1>

            <p className="mt-1 text-sm text-ink-soft">
              {documents.length === 0
                ? "Upload a PDF to start asking it questions."
                : `${documents.length} ${
                    documents.length === 1 ? "document" : "documents"
                  } · ${readyCount} ready to ask`}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-10"
        >
          <UploadDropzone onUpload={handleUpload} />
        </motion.div>

        {loadError && (
          <p className="mb-6 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
            {loadError}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-card border border-paper-line bg-white/60"
              />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={<FileStack size={20} />}
            title="No documents yet"
            description="Once you upload a PDF, it'll show up here with its processing status — and you can open it to start asking questions."
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.06,
                },
              },
            }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {documents.map((doc) => (
              <motion.div
                key={doc._id}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <DocumentCard
                  doc={doc}
                  onDelete={setPendingDeleteId}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {documents.length > 0 && (
          <div className="mt-10 flex items-center gap-2 text-sm text-ink-faint">
            <MessagesSquare size={14} />
            Looking for past conversations? Open any ready document to see its
            chat history.
          </div>
        )}
      </main>

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this document?"
        description="This removes the document and everything derived from it — chunks, summaries, and chat history. This can't be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}