"use client";

import * as React from "react";

/**
 * Mounts `children` only once the wrapper approaches the viewport.
 *
 * The dashboard charts are the single heaviest client dependency in the app
 * (recharts, ~93 KB gzip). Fetching that chunk right after hydration spends
 * bandwidth on cards the visitor may never scroll to, and it competes with
 * the content that *is* on screen. The wrapper keeps the card's final size
 * (fixed-height placeholder) so nothing shifts when the chart arrives, and it
 * observes with a generous root margin so the swap is already done by the time
 * the card is readable.
 *
 * No observer support (or a server render) falls back to mounting immediately,
 * so the charts never fail to appear.
 */
export function DeferredChart({
  children,
  placeholder,
  className,
  rootMargin = "320px",
}: {
  children: React.ReactNode;
  placeholder: React.ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      return;
    }

    const node = ref.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : placeholder}
    </div>
  );
}
