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
        className="relative h-9 w-full max-w-sm justify-start rounded-full border-border/60 bg-surface-container-low/60 pl-3 text-[0.75rem] text-muted-foreground shadow-none transition-colors hover:border-border hover:bg-surface-container-low hover:text-foreground sm:w-56 md:w-72 lg:w-80"
        aria-label="Search records, events, or navigate (Press Ctrl+K)"
      >
        <Search className="mr-2 size-3.5 shrink-0 text-muted-foreground/70" />
        <span className="truncate">Search or jump to…</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-0.5 rounded-full border border-border/60 bg-card px-2 font-mono text-[0.625rem] font-medium text-muted-foreground sm:flex">
          <span className="text-[0.6875rem]">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="border border-border/70 bg-popover/95 shadow-[var(--elevation-3)] backdrop-blur-2xl sm:max-w-lg"
      >
        <CommandInput placeholder="Search records, pages, or run a command…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={`${item.title} ${item.description ?? ""} ${(item.keywords ?? []).join(" ")}`}
                  onSelect={() => runCommand(() => router.push(item.href))}
                  className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[0.8125rem]">{item.title}</span>
                    {item.description ? (
                      <span className="truncate text-[0.6875rem] text-muted-foreground">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  {item.badge && (
                    <span className="ml-auto font-mono text-[0.625rem] text-muted-foreground">
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
