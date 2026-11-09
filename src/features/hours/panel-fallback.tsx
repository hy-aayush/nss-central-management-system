import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder for an hours tab whose code has not loaded yet.
 *
 * It mirrors the shape of the panels (a header strip and a few rows) so the
 * swap reads as content arriving rather than the layout collapsing. The
 * skeleton is static — no shimmer — because it is only on screen for the first
 * activation of a tab, where a moving surface would draw attention to itself.
 */
export function PanelFallback({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="space-y-3 border border-border/70 bg-card/70 p-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-72" />
      <div className="space-y-2 pt-1">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </Card>
  );
}
