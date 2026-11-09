"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Arrow-key navigation over a data table.
 *
 * Cells are `tabIndex={-1}`, so they never enter the tab order — Tab still
 * moves from the table to whatever follows it. Once a cell *is* focused (by
 * clicking it or by arrowing in from another cell) the arrows walk the grid,
 * which is what a spreadsheet-shaped surface is expected to do.
 *
 * Only the cell itself is intercepted. A press inside a button, link, input or
 * select keeps its native meaning, so this can never swallow typing.
 */
const GRID_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
])

function cellFrom(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof HTMLElement)) return null
  const cell = target.closest<HTMLElement>("td,th")
  // Intercept only when the cell itself holds focus.
  return cell && cell === target ? cell : null
}

function moveFocus(
  table: HTMLTableElement,
  cell: HTMLElement,
  key: string
): void {
  const row = cell.parentElement
  if (!row) return

  const cells = Array.from(row.querySelectorAll<HTMLElement>(":scope > td,:scope > th"))
  const column = cells.indexOf(cell)

  if (key === "Home" || key === "End") {
    const target = key === "Home" ? cells[0] : cells[cells.length - 1]
    target?.focus()
    return
  }

  if (key === "ArrowLeft" || key === "ArrowRight") {
    const next = cells[column + (key === "ArrowLeft" ? -1 : 1)]
    next?.focus()
    return
  }

  // Vertical movement stays inside the body rows and keeps the column.
  const rows = Array.from(
    table.querySelectorAll<HTMLTableRowElement>("tbody > tr")
  ).filter((entry) => entry.getClientRects().length > 0)
  const index = rows.indexOf(row as HTMLTableRowElement)
  if (index === -1) return
  const targetRow = rows[index + (key === "ArrowUp" ? -1 : 1)]
  if (!targetRow) return
  const targetCells = Array.from(
    targetRow.querySelectorAll<HTMLElement>(":scope > td,:scope > th")
  )
  targetCells[column]?.focus()
}

function Table({
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<"table">) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !GRID_KEYS.has(event.key)) return
    if (event.altKey || event.ctrlKey || event.metaKey) return
    const cell = cellFrom(event.target)
    if (!cell) return
    event.preventDefault()
    moveFocus(event.currentTarget, cell, event.key)
  }

  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        onKeyDown={handleKeyDown}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  scope = "col",
  tabIndex = -1,
  ...props
}: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      scope={scope}
      tabIndex={tabIndex}
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  tabIndex = -1,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      tabIndex={tabIndex}
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
