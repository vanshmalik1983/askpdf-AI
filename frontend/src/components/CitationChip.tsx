import { useState } from "react";
import { FileText, ChevronDown } from "lucide-react";
import type { Citation } from "@/lib/api";

export function CitationChip({ citation }: { citation: Citation }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-paper-line bg-paper">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-paper-dim"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-ink">
          <FileText size={13} className="text-cobalt" />
          Page {citation.pageNumber}
          <span className="font-mono text-[10px] font-medium text-ink-faint">
            {Math.round(citation.score * 100)}%
          </span>
        </span>
        <ChevronDown size={14} className={`text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="marker-underline border-t border-paper-line bg-white px-3 py-2.5 text-[13px] leading-relaxed text-ink-soft">
          &ldquo;{citation.snippet}&rdquo;
        </p>
      )}
    </div>
  );
}
