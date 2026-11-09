"use client";

import * as React from "react";
import dynamic from "next/dynamic";

/**
 * The shortcut sheet is documentation, not a feature people need on load, so
 * both its dialog chunk and its markup are fetched the first time someone asks
 * for it with `?` (or Ctrl/Cmd + /). Until then the only cost is one keydown
 * listener.
 */
const ShortcutSheetContent = dynamic(
  () => import("./shortcut-sheet-content").then((m) => m.ShortcutSheetContent),
  { ssr: false },
);

export function ShortcutSheet() {
  const [requested, setRequested] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      const isHelp =
        (event.key === "?" && !typing) ||
        (event.key === "/" && (event.metaKey || event.ctrlKey));

      if (!isHelp || event.repeat) return;
      event.preventDefault();
      setRequested(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return requested ? <ShortcutSheetContent /> : null;
}
