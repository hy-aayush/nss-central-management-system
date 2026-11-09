"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["Ctrl", "K"], label: "Open the command palette" },
  { keys: ["Ctrl", "B"], label: "Collapse or expand the sidebar" },
  { keys: ["?"], label: "Show this sheet" },
  { keys: ["Tab"], label: "Step through a page; rows highlight on focus" },
  {
    keys: ["J", "K"],
    label: "Next and previous row in the audit ledger; Enter opens it",
  },
  { keys: ["Esc"], label: "Close the palette, a dialog or a popover" },
];

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border/80 bg-surface-container-low px-1.5 font-mono text-[0.6875rem] font-medium text-foreground shadow-[inset_0_-1px_0_var(--border)]">
      {children}
    </kbd>
  );
}

export function ShortcutSheetContent() {
  const [open, setOpen] = React.useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-title-md">Keyboard shortcuts</DialogTitle>
          <DialogDescription className="text-body-sm text-muted-foreground">
            Everything below works anywhere in the office shell.
          </DialogDescription>
        </DialogHeader>

        <ul className="divide-y divide-border/60">
          {SHORTCUTS.map((shortcut) => (
            <li
              key={shortcut.label}
              className="flex items-center justify-between gap-4 py-2.5"
            >
              <span className="text-body-sm text-foreground">
                {shortcut.label}
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {shortcut.keys.map((key) => (
                  <Key key={key}>{key}</Key>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-label-xs text-muted-foreground">
          Shortcuts are inert while you are typing in a field.
        </p>
      </DialogContent>
    </Dialog>
  );
}
