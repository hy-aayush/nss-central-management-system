"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard error boundary caught:", error);
  }, [error]);

  return (
    <div className="space-y-6">
      <PageHeader
        badge={
          <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
            <span className="size-1.5 rounded-full bg-destructive" />
            <span className="uppercase tracking-wider">System Exception</span>
          </div>
        }
        title="Dashboard Unavailable"
        description="We encountered an unexpected error while loading the operational overview."
      />

      <Card className="border-destructive/30 bg-destructive/5 max-w-2xl mx-auto my-12">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertTriangle className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Failed to compile dashboard metrics
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              {error.message || "An unexpected error occurred while rendering synthetic operational metrics."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={() => reset()} size="sm" className="gap-1.5">
              <RefreshCw className="size-3.5" />
              Retry Loading
            </Button>
            <Link
              href="/volunteers"
              className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}
            >
              <Home className="size-3.5" />
              Go to Volunteers
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
