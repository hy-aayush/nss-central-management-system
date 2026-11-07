"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type ColumnVisibilityState,
  type RowSelectionState,
  type RowData,
  stockFeatures,
  useTable,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<typeof stockFeatures, TData, unknown>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  toolbarActions?: React.ReactNode;
  batchActions?: (selectedRows: TData[]) => React.ReactNode;
  onRowClick?: (row: TData) => void;
  className?: string;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "No data matches your current search or filter criteria.",
  pageSize = 10,
  toolbarActions,
  batchActions,
  onRowClick,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useTable<typeof stockFeatures, TData>({
    features: stockFeatures,
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Table Toolbar */}
      <div className="flex flex-col items-stretch justify-between gap-2.5 sm:flex-row sm:items-center">
        <div className="flex max-w-sm flex-1 items-center gap-2">
          {searchKey && (
            <div className="relative w-full">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                placeholder={searchPlaceholder}
                value={
                  (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="h-9 rounded-full border-border/60 bg-surface-container-low/60 pl-9 text-[0.75rem] shadow-none"
              />
            </div>
          )}
        </div>

        {/* Toolbar Action Slots */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {toolbarActions}
        </div>
      </div>

      {/* Batch Actions Bar (SRS line 1425-1440) */}
      {selectedCount > 0 && batchActions && (
        <div className="flex animate-fade items-center justify-between rounded-lg border border-primary/20 bg-primary/[0.07] px-4 py-2 text-[0.75rem] text-primary">
          <span className="font-medium">
            {selectedCount} {selectedCount === 1 ? "record" : "records"} selected
          </span>
          <div className="flex items-center gap-2">
            {batchActions(selectedRows)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.toggleAllRowsSelected(false)}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 shadow-[var(--elevation-1)] backdrop-blur-[2px]">
        {isLoading ? (
          <LoadingState variant="table" count={pageSize} />
        ) : table.getRowModel().rows?.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              action={
                searchKey && table.getColumn(searchKey)?.getFilterValue() ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
                    className="text-xs"
                  >
                    Clear Search
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-container-low/60">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-border/60 hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-9 px-3 text-[0.625rem] font-semibold tracking-[0.075em] text-muted-foreground uppercase"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "border-border/50 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-surface-container-low/50",
                      row.getIsSelected() && "bg-primary/[0.05]"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-3 py-2.5 text-[0.75rem]"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && table.getPageCount() > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 px-1 text-[0.6875rem] text-muted-foreground sm:flex-row">
          <div className="text-center sm:text-left">
            Showing{" "}
            <span className="font-medium text-foreground">
              {table.state.pagination.pageIndex *
                table.state.pagination.pageSize +
                1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                (table.state.pagination.pageIndex + 1) *
                  table.state.pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {table.getFilteredRowModel().rows.length}
            </span>{" "}
            records
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="First page"
              className="h-8 w-8"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              title="Previous page"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="tnum px-2 text-[0.6875rem] font-medium text-foreground">
              {table.state.pagination.pageIndex + 1} / {table.getPageCount()}
            </span>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              title="Next page"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              title="Last page"
              className="h-8 w-8"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
