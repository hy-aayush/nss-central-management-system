import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

/**
 * Minimal "Access denied" page (SRS 4.4).
 *
 * Shown to anyone who reaches a private route without an approved session.
 * Deliberately discloses nothing: no roles, no reasons beyond the basics, no
 * private reads. Authentication itself lands in a later task; this page is
 * static and contains no auth logic.
 */

export const metadata = {
  title: "Access denied",
};

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground antialiased">
      <div className="w-full max-w-sm rounded-xl border border-border/70 bg-card p-6 text-center shadow-xs sm:p-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-headline-lg font-semibold tracking-tight">
          Access denied
        </h1>
        <p className="mt-2 text-body-sm text-muted-foreground">
          This portal is for approved NSS office staff only. You are not signed
          in, or your account does not hold an active office role.
        </p>
        <p className="mt-1 text-body-sm text-muted-foreground">
          If you believe this is a mistake, contact a Coordinator or a Tech Team
          member.
        </p>
        <Link
          href="/login"
          className={buttonVariants({
            variant: "outline",
            className: "mt-6 w-full",
          })}
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}

