/**
 * The widths a page header and its loading skeleton must agree on.
 *
 * A skeleton only removes perceived latency while the real content lands inside
 * the boxes it drew. The header is where that used to break: the skeleton drew a
 * 32rem description and the real header rendered 42rem (`max-w-2xl`), so the
 * page shifted sideways the moment it loaded — the exact jolt a skeleton exists
 * to prevent. Both now read these values, so there is one width table rather
 * than two that happen to look similar.
 */
export const PAGE_RHYTHM = {
  /** Matches the eyebrow line in `SectionHeader`. */
  eyebrowWidth: "w-40",
  /** Matches a two-to-four word title at `text-headline-md`. */
  titleWidth: "w-80 max-w-full",
  /** The reading measure of a header description. */
  descriptionWidth: "max-w-2xl",
  /** A header action button. */
  actionWidth: "w-32",
  /** The metric strip's grid, shared with `MetricStrip`. */
  metricGrid: "grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4",
} as const;
