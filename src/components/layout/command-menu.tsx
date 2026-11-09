"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * The command palette is opened occasionally, not on every page load. The
 * dialog body (and `cmdk`, which it pulls in) is therefore a lazily fetched
 * chunk: the trigger here is a few hundred bytes, and the palette code only
 * downloads the first time the shortcut or button is used.
 *
 * `ssr: false` keeps the palette out of the server render and the route's
 * initial client payload entirely.
 */
const CommandPalette = dynamic(() => import("./command-palette"), {
  ssr: false,
  loading: () => null,
});

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  // Once opened, keep the chunk mounted so repeat use is instant.
  const [mounted, setMounted] = React.useState(false);

  const openPalette = React.useCallback(() => {
    setMounted(true);
    setOpen(true);
  }, []);

  /**
   * Warm the palette chunk once the page is idle.
   *
   * The chunk must stay out of the first payload, but the *first* Ctrl+K should
   * still feel instant. Loading it after the browser is idle gives both: the
   * initial load pays nothing, and by the time anyone reaches for the shortcut
   * the module is already in memory (the dynamic import resolves to the same
   * cached module).
   */
  React.useEffect(() => {
    const warm = () => {
      void import("./command-palette");
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(warm, 2500);
    return () => window.clearTimeout(id);
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setMounted(true);
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={openPalette}
        className="relative h-9 w-full max-w-sm justify-start rounded-full border-border/60 bg-surface-container-low/60 pl-3 text-[0.75rem] text-muted-foreground shadow-none transition-colors hover:border-border hover:bg-surface-container-low hover:text-foreground sm:w-56 md:w-72 lg:w-80"
        aria-label="Search records, events, or navigate (Press Ctrl+K)"
      >
        <Search className="mr-2 size-3.5 shrink-0 text-muted-foreground/70" />
        <span className="truncate">Search or jump to…</span>
        <kbd className="pointer-events-none absolute top-1.5 right-1.5 hidden h-6 select-none items-center gap-0.5 rounded-full border border-border/60 bg-card px-2 font-mono text-[0.625rem] font-medium text-muted-foreground sm:flex">
          <span className="text-[0.6875rem]">⌘</span>K
        </kbd>
      </Button>

      {mounted ? <CommandPalette open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
