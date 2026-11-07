import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

/**
 * Minimal "Access denied" page (SRS 4.4).
 *
 * Shown to anyone who reaches a private route without an approved session. It
 * deliberately discloses nothing: no role, no reason, no email, no roll number
 * and no private reads. `/auth/denied` signs the Supabase session out before
 * redirecting here.
 */

export const metadata = {
  title: "Access denied",
};

export default function AccessDeniedPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-1/3 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-destructive/[0.04] blur-3xl" />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-border/70 bg-card/85 p-6 text-center shadow-[var(--elevation-2)] backdrop-blur-xl sm:p-8">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl border border-destructive/20 bg-error-container/60 text-destructive">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </div>

        <h1 className="mt-4 text-headline-lg text-foreground">
          Access denied
        </h1>
        <p className="mt-2 text-body-sm leading-relaxed text-muted-foreground">
          This portal is for approved NSS office staff only. You are not signed
          in, or your account does not hold an active office role.
        </p>
        <p className="mt-1.5 text-body-sm leading-relaxed text-muted-foreground">
          If you believe this is a mistake, contact a Coordinator or a Tech Team
          member. Access is checked again on every request.
        </p>

        <form action="/auth/signout" method="post" className="mt-6">
          <button
            type="submit"
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
          >
            Sign out
          </button>
        </form>

        <Link
          href="/login"
          className={buttonVariants({
            variant: "ghost",
            className: "mt-1.5 w-full",
          })}
        >
          Back to sign in
        </Link>

        <p className="mt-5 border-t border-border/60 pt-4 text-[0.625rem] text-muted-foreground/70">
          No account details are disclosed on this page.
        </p>
      </div>
    </main>
  );
}
