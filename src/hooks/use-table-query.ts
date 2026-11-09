"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

type QueryState = Record<string, string>;

/**
 * Mirrors table state (search, filters, sort, page, size) into the address bar.
 *
 * The write never goes through the router: the rows are already on screen, and a
 * navigation would cost a server render plus another access-gate query. It is
 * debounced so typing produces one history entry, and default values are omitted
 * so a plain view keeps a clean URL. The result is a view that can be bookmarked,
 * shared or reloaded with the table exactly where the reader left it.
 */
export function useTableQuery(defaults: QueryState, state: QueryState) {
  const pathname = usePathname();
  // The caller's defaults are constant for the life of the table; keeping the
  // first copy avoids re-running the effect when a literal object is recreated.
  const [initialDefaults] = React.useState(defaults);

  const query = React.useMemo(() => {
    const parts: string[] = [];
    for (const key of Object.keys(initialDefaults)) {
      const fallback = initialDefaults[key];
      const value = state[key] ?? fallback;
      if (value === fallback) continue;
      parts.push(`${key}=${encodeURIComponent(value)}`);
    }
    return parts.join("&");
  }, [initialDefaults, state]);

  React.useEffect(() => {
    const url = query ? `${pathname}?${query}` : pathname;
    const timer = setTimeout(() => {
      const current = `${window.location.pathname}${window.location.search}`;
      if (current === url) return;
      window.history.replaceState(null, "", url);
    }, 220);

    return () => clearTimeout(timer);
  }, [pathname, query]);
}
