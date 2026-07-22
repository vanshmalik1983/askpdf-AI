import { useRef, useState, MouseEvent } from "react";
import { Link } from "react-router-dom";
import { FileText, Trash2, ArrowUpRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { DocumentItem } from "@/lib/api";

interface DocumentCardProps {
  doc: DocumentItem;
  onDelete: (id: string) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentCard({ doc, onDelete }: DocumentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  const isReady = doc.status === "ready";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
      }}
      className="card group relative flex flex-col justify-between p-5 transition-shadow duration-200 hover:shadow-paper-lg"
    >
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-marker-soft text-ink">
            <FileText size={18} strokeWidth={2} />
          </div>
          <StatusBadge status={doc.status} />
        </div>

        <h3 className="mb-1 line-clamp-2 font-display text-[17px] font-medium leading-snug text-ink">
          {doc.originalName}
        </h3>
        <p className="font-mono text-xs text-ink-faint">
          {formatSize(doc.fileSizeBytes)}
          {doc.pageCount ? ` · ${doc.pageCount} pages` : ""}
        </p>

        {doc.status === "failed" && doc.failureReason && (
          <p className="mt-2 text-xs leading-relaxed text-danger">{doc.failureReason}</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-paper-line pt-4">
        {isReady ? (
          <Link
            to={`/documents/${doc._id}`}
            state={{ name: doc.originalName }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-cobalt transition-colors hover:text-cobalt-dark"
          >
            Open workspace
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </Link>
        ) : (
          <span className="text-sm text-ink-faint">
            {doc.status === "failed" ? "Processing failed" : "Preparing…"}
          </span>
        )}

        <button
          onClick={() => onDelete(doc._id)}
          aria-label={`Delete ${doc.originalName}`}
          className="rounded-md p-1.5 text-ink-faint opacity-0 transition-all duration-150 hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
