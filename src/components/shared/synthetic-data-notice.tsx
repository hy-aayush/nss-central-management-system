import { cn } from "@/lib/utils";

/**
 * The flask is inlined rather than imported from the icon package: this banner
 * renders inside the server tree of every office route, and one literal path is
 * cheaper than threading a package import through that render.
 */
function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" />
      <path d="M6.453 15h11.094" />
      <path d="M8.5 2h7" />
    </svg>
  );
}

/**
 * Synthetic-data disclosure banner (SRS rule 20: development and staging use
 * synthetic data only). Rendered once in the office layout so every screen
 * carries the same honest notice instead of only the dashboard.
 *
 * Server component — no client boundary, no data.
 */
export function SyntheticDataNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-warning/20 bg-warning-container/30 px-3 py-1.5 text-[0.6875rem] text-on-warning-container",
        className,
      )}
    >
      <FlaskIcon className="size-3.5 shrink-0 text-warning" />
      <span className="font-medium">Demonstration mode</span>
      <span aria-hidden="true" className="text-warning/40">
        ·
      </span>
      <span className="text-on-warning-container/80">
        Volunteer records, attendance, rosters and audit entries are synthetic
        fixtures. No production or personal data is stored.
      </span>
      <span className="ml-auto hidden text-[0.5625rem] font-medium tracking-[0.08em] uppercase opacity-70 sm:inline">
        Synthetic sandbox
      </span>
    </div>
  );
}
