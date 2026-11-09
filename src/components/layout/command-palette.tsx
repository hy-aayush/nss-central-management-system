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
  UserPlus,
  CalendarPlus,
  Download,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The palette body, split out of `command-menu.tsx` so `cmdk` and the dialog
 * primitives are fetched only when someone actually opens it. The topbar (and
 * therefore every office route) previously carried that chunk on first load.
 */
export default function CommandPalette({
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
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
                  <span className="truncate text-[0.8125rem]">
                    {item.title}
                  </span>
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
  );
}
