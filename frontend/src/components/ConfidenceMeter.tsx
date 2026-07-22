interface ConfidenceMeterProps {
  score: number; // 0 to 1
}

export function ConfidenceMeter({ score }: ConfidenceMeterProps) {
  const pct = Math.round(score * 100);
  const level = score >= 0.85 ? "strong" : score >= 0.72 ? "fair" : "weak";

  const colors = {
    strong: { bar: "bg-verified", text: "text-verified" },
    fair: { bar: "bg-cobalt", text: "text-cobalt-dark" },
    weak: { bar: "bg-ink-faint", text: "text-ink-soft" },
  }[level];

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-paper-dim">
        <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`font-mono text-[11px] font-medium ${colors.text}`}>{pct}% match</span>
    </div>
  );
}
