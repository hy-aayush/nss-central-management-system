"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { MAIN_NAV_ITEMS } from "@/lib/navigation";
import {
  Laptop,
  Moon,
  Sun,
  Search,
  UserPlus,
  CalendarPlus,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative h-9 w-full max-w-sm justify-start rounded-lg bg-surface-container-low text-xs text-muted-foreground hover:bg-surface-container hover:text-foreground sm:w-64 md:w-80 lg:w-96"
        aria-label="Search records, events, or navigate (Press Ctrl+K)"
      >
        <Search className="mr-2 size-4 shrink-0 text-muted-foreground/80" />
        <span className="truncate">Search records, events, rosters…</span>
        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-surface-container-high px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search workspace..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={item.title}
                  onSelect={() => runCommand(() => router.push(item.href))}
                  className="cursor-pointer gap-2"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                      {item.badge}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Office Actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/volunteers"))}
              className="cursor-pointer gap-2"
            >
              <UserPlus className="size-4 text-muted-foreground" />
              <span>Add Volunteer Record</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/events"))}
              className="cursor-pointer gap-2"
            >
              <CalendarPlus className="size-4 text-muted-foreground" />
              <span>Create Event Draft</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/audit-logs"))}
              className="cursor-pointer gap-2"
            >
              <Download className="size-4 text-muted-foreground" />
              <span>Export Bounded Audit Records</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() => runCommand(() => setTheme("light"))}
              className="cursor-pointer gap-2"
            >
              <Sun className="size-4 text-muted-foreground" />
              <span>Light Mode</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme("dark"))}
              className="cursor-pointer gap-2"
            >
              <Moon className="size-4 text-muted-foreground" />
              <span>Dark Mode</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme("system"))}
              className="cursor-pointer gap-2"
            >
              <Laptop className="size-4 text-muted-foreground" />
              <span>System Preference</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
