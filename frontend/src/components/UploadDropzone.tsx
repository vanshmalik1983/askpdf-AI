import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileWarning } from "lucide-react";

interface UploadDropzoneProps {
  onUpload: (file: File) => Promise<void>;
}

const MAX_SIZE_MB = 20;

export function UploadDropzone({ onUpload }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      setError(null);
      if (!file) return;

      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File is too large — the limit is ${MAX_SIZE_MB}MB.`);
        return;
      }

      setIsUploading(true);
      try {
        await onUpload(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-6 py-14 text-center transition-all duration-200 ${
          isDragging
            ? "border-cobalt bg-cobalt-soft"
            : "border-paper-line bg-white hover:border-ink/30 hover:bg-paper-dim/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 group-hover:-translate-y-0.5 ${
            isDragging ? "bg-cobalt text-white" : "bg-marker-soft text-ink"
          }`}
        >
          {isUploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <UploadCloud size={22} strokeWidth={2} />
          )}
        </div>

        <p className="text-[15px] font-semibold text-ink">
          {isUploading ? "Uploading…" : "Drop a PDF here, or click to browse"}
        </p>
        <p className="mt-1 text-sm text-ink-faint">PDF only, up to {MAX_SIZE_MB}MB</p>
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-danger">
          <FileWarning size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
