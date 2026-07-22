import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-paper-line bg-paper">
      <div className="container-page flex flex-col items-start justify-between gap-6 py-10 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="max-w-xs text-sm text-ink-faint">
            Answers grounded in the page you uploaded — never in a guess.
          </p>
        </div>
        <p className="text-xs text-ink-faint">
          Built as a portfolio project. Not affiliated with any document-storage provider.
        </p>
      </div>
    </footer>
  );
}
