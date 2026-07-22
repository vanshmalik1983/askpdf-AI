import { Loader2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import type { DocumentItem } from "@/lib/api";

const STATUS_CONFIG: Record<
  DocumentItem["status"],
  { label: string; className: string; icon: typeof Clock }
> = {
  uploaded: { label: "Uploaded", className: "bg-paper-dim text-ink-soft", icon: Clock },
  queued: { label: "Queued", className: "bg-paper-dim text-ink-soft", icon: Clock },
  processing: { label: "Processing", className: "bg-cobalt-soft text-cobalt-dark", icon: Loader2 },
  ready: { label: "Ready", className: "bg-verified-soft text-verified", icon: CheckCircle2 },
  failed: { label: "Failed", className: "bg-danger-soft text-danger", icon: AlertTriangle },
};

export function StatusBadge({ status }: { status: DocumentItem["status"] }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const isSpinning = status === "processing" || status === "queued";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon size={12} strokeWidth={2.5} className={isSpinning && status === "processing" ? "animate-spin" : ""} />
      {config.label}
    </span>
  );
}
