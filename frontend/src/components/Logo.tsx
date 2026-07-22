interface LogoProps {
  className?: string;
  withWordmark?: boolean;
}

/**
 * The mark is a simplified "flagged page" — a document corner with a
 * citation tab, echoing the product's core idea (an answer with a
 * page marker attached) rather than a generic abstract glyph.
 */
export function Logo({ className = "", withWordmark = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5 2.5H16L21 7.5V23.5H5V2.5Z"
          fill="#FFFFFF"
          stroke="#1B1B1F"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M16 2.5V7.5H21" stroke="#1B1B1F" strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="8" y="12.5" width="8.5" height="3" fill="#FFD447" />
        <path d="M8 17.5H14.5" stroke="#1B1B1F" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M21 11L25 11L25 15L21 13.2Z" fill="#3355FF" />
      </svg>
      {withWordmark && (
        <span className="font-display text-[19px] font-semibold tracking-tight text-ink">
          AskPDF <span className="text-cobalt">AI</span>
        </span>
      )}
    </div>
  );
}
