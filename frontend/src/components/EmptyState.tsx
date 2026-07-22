import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-paper-line bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper-dim text-ink-soft">
        {icon}
      </div>
      <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-faint">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
