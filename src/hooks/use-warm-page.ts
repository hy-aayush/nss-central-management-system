"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/**
 * Warms the next page once the end of the current one is on screen.
 *
 * This is deliberately not a hover prefetch: someone reading the last rows of a
 * page has already decided they are in this table, so the next page of the same
 * view is the likely destination. Waiting for idle means the prefetch cannot
 * compete with the render that put those rows there, and the `warmed` ref means
 * a page that stays in view warms exactly one route rather than refetching in a
 * loop.
 *
 * Attach the returned ref to the sentinel that sits at the end of the list.
 */
export function useWarmPage(href: string | null) {
  const router = useRouter();
  const [sentinel, setSentinel] = React.useState<HTMLElement | null>(null);
  const warmed = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!sentinel || !href || warmed.current === href) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        if (warmed.current === href) return;

        warmed.current = href;
        observer.disconnect();

        const run = () => router.prefetch(href);

        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(run, { timeout: 1500 });
        } else {
          setTimeout(run, 300);
        }
      },
      // A little early: the next page should be ready as the eye reaches the
      // pager, not start fetching there.
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [href, router, sentinel]);

  return setSentinel;
}
