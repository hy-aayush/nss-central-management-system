"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function OfficeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Office error boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-headline-md text-foreground">Something went wrong</h2>
      <p className="mt-2 text-body-sm text-muted-foreground">
        An error occurred while loading this section.
      </p>
      <Button onClick={() => reset()} className="mt-4" variant="outline">
        Try again
      </Button>
    </div>
  );
}
