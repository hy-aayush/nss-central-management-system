import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number; // e.g. 12.5 or -4.2
  changeType?: "increase" | "decrease" | "neutral";
  changePeriod?: string; // e.g. "vs last month"
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  badgeText?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  changePeriod = "vs last month",
  description,
  icon: Icon,
  iconColor = "text-primary",
  badgeText,
  className,
  ...props
}: StatCardProps) {
  // Determine trend direction if not explicitly supplied
  const trend =
    changeType ||
    (typeof change === "number"
      ? change > 0
        ? "increase"
        : change < 0
        ? "decrease"
        : "neutral"
      : undefined);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/70 bg-card/75 backdrop-blur-sm transition-all duration-200 hover:shadow-sm hover:border-border",
        className
      )}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
        {Icon && (
          <div className={cn("p-2 rounded-lg bg-muted/60 shrink-0", iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </div>
          {badgeText && (
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
              {badgeText}
            </span>
          )}
        </div>

        {(typeof change === "number" || description) && (
          <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            {typeof change === "number" && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded text-[11px]",
                  trend === "increase" && "bg-success/15 text-success",
                  trend === "decrease" && "bg-destructive/15 text-destructive",
                  trend === "neutral" && "bg-muted text-muted-foreground"
                )}
              >
                {trend === "increase" && <TrendingUp className="h-3 w-3" />}
                {trend === "decrease" && <TrendingDown className="h-3 w-3" />}
                {trend === "neutral" && <Minus className="h-3 w-3" />}
                {change > 0 ? `+${change}%` : `${change}%`}
              </span>
            )}
            {changePeriod && typeof change === "number" && (
              <span className="text-muted-foreground/80">{changePeriod}</span>
            )}
            {!change && description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
