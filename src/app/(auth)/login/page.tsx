import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Minimal staff sign-in page.
 *
 * SRS 16.2 defines the real flow (Supabase Auth, Google provider, restricted
 * to the institute domain). None of that is implemented yet — this is a
 * static shell with a disabled action so the route renders something honest
 * instead of a blank screen. The provider button is intentionally disabled:
 * no auth logic, no client, no network calls.
 */

export const metadata = {
  title: "Staff sign-in",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground antialiased">
      <div className="w-full max-w-sm rounded-xl border border-border/70 bg-card p-6 text-center shadow-xs sm:p-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-headline-lg font-semibold tracking-tight">
          Staff sign-in
        </h1>
        <p className="mt-2 text-body-sm text-muted-foreground">
          The NSS Central Management System is for approved office staff:
          Coordinators, Tech Team, Project Representatives and Builders.
          Sign in with your institute account (@kiit.ac.in).
        </p>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Volunteers do not sign in — this portal is kept by the office on
          their behalf.
        </p>
        <Button disabled className="mt-6 w-full">
          Continue with Google
        </Button>
        <p className="mt-3 text-label-sm text-muted-foreground">
          Google sign-in is not enabled in this build yet.
        </p>
      </div>
    </main>
  );
}

