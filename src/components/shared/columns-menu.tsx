"use client";

import { Columns3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ColumnSpec {
  id: string;
  label: string;
  /** Columns that identify the row cannot be hidden. */
  locked?: boolean;
}

interface ColumnsMenuProps {
  columns: ColumnSpec[];
  hidden: string[];
  onChange: (hidden: string[]) => void;
}

/**
 * Column visibility, as a menu over the same list the table renders from.
 *
 * The hidden set is owned by the caller because it belongs in the URL: a table
 * someone trimmed down for a screen-share should come back trimmed when they
 * reload or send the link. This component only decides what can be toggled.
 */
export function ColumnsMenu({ columns, hidden, onChange }: ColumnsMenuProps) {
  const toggleable = columns.filter((column) => !column.locked);
  const visibleCount = toggleable.length - hidden.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          />
        }
      >
        <Columns3 className="size-3.5" />
        Columns
        <span className="font-mono text-[10px] text-muted-foreground/80">
          {visibleCount}/{toggleable.length}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* The label is a group label in this menu primitive, so it has to sit
            inside a group; without one it throws when the menu opens. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
            Visible columns
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.locked ? true : !hidden.includes(column.id)}
              disabled={column.locked}
              onCheckedChange={(checked) => {
                if (column.locked) return;
                onChange(
                  checked
                    ? hidden.filter((id) => id !== column.id)
                    : [...hidden, column.id],
                );
              }}
              className="text-xs"
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>

        {hidden.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onChange([])}
              className="text-xs text-muted-foreground"
            >
              Show all columns
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
