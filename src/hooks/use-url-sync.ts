"use client";

import * as React from "react";

/**
 * Keeps a filtered table's state in the URL without asking the server for a
 * new page.
 *
 * Why not `router.replace`: every office route is access-gated and rendered per
 * request, so a router navigation costs a serverless invocation plus one
 * Supabase query (the gate). Doing that on every keystroke of a search box is
 * the most expensive thing this app could do — a five-letter query would bill
 * five renders.
 *
 * `window.history.replaceState` updates the address bar only. Next's App Router
 * subscribes to the History API, so `useSearchParams()` stays in step and the
 * URL is still shareable, but no RSC request is made: the table already holds
 * every row it needs.
 *
 * Writes are throttled so fast typing produces one history entry, and the
 * *next* navigation (a real link) still performs a normal server render.
 */
export function useUrlSync(delay = 250) {
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = React.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  React.useEffect(() => () => cancel(), [cancel]);

  return React.useCallback(
    (url: string) => {
      cancel();

      timer.current = setTimeout(() => {
        if (typeof window === "undefined") {
          return;
        }

        const next = url.startsWith("?")
          ? `${window.location.pathname}${url}`
          : url || window.location.pathname;
        const current = `${window.location.pathname}${window.location.search}`;

        if (next === current) {
          return;
        }

        window.history.replaceState(null, "", next);
      }, delay);
    },
    [cancel, delay],
  );
}
