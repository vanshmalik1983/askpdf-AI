import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm rounded-card border border-paper-line bg-white p-6 shadow-paper-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft text-danger">
              <AlertTriangle size={18} />
            </div>
            <h3 className="mt-4 font-display text-lg font-medium text-ink">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onCancel} className="btn-secondary !px-4 !py-2 text-sm">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="inline-flex items-center rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isLoading ? "Deleting…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
