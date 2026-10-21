import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth/actions";
import { loadOfficeAccess } from "@/lib/auth/actor";
import { sanitizeReturnTo } from "@/lib/auth/return-to";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Staff sign-in (SRS 16.2 step 1).
 *
 * Google only. Volunteers do not sign in, and there is no email/password path
 * (SRS 2.3). The provider button posts to a Server Action that starts the
 * Supabase OAuth flow; the callback re-checks the domain, verification flag and
 * office assignment on the server before letting anyone in.
 *
 * The page is safe to render when Supabase env is absent (clean checkout or a
 * preview without secrets): it explains that sign-in is not configured
 * instead of pretending to work.
 */

/** Reads the request query and any existing session; never prerendered. */
export const instant = false;

export const metadata = {
  title: "Staff sign-in",
};

const ERROR_MESSAGES: Record<string, string> = {
  config:
    "Sign-in is not configured in this environment yet. Contact a Tech Team member.",
  start: "Sign-in could not be started. Please try again.",
  callback: "Sign-in could not be completed. Please try again.",
  session: "Your session could not be verified. Please sign in again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = sanitizeReturnTo(params.next);
  const errorCode = typeof params.error === "string" ? params.error : null;
  const configured = isSupabaseConfigured();

  if (configured) {
    // A valid office member who reaches /login goes straight on. A signed-in
    // person without access stays here with an honest notice instead of a
    // redirect loop.
    try {
      const access = await loadOfficeAccess();

      if (access.status === "granted") {
        redirect(next);
      }
    } catch {
      // Rendering the login form is always safe.
    }
  }

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

        {errorCode && ERROR_MESSAGES[errorCode] ? (
          <p
            role="alert"
            className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-body-sm text-destructive"
          >
            {ERROR_MESSAGES[errorCode]}
          </p>
        ) : null}

        <form action={signInWithGoogle} className="mt-6">
          <input type="hidden" name="next" value={next} />
          <Button
            type="submit"
            disabled={!configured}
            className="w-full"
          >
            Continue with Google
          </Button>
        </form>

        {configured ? (
          <p className="mt-3 text-label-sm text-muted-foreground">
            You must already hold an active office post. Access is checked on
            every request.
          </p>
        ) : (
          <p className="mt-3 text-label-sm text-muted-foreground">
            Google sign-in is not configured in this build yet.
          </p>
        )}

        <form action="/auth/signout" method="post" className="mt-4">
          <button
            type="submit"
            className="text-label-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Sign out of another session
          </button>
        </form>
      </div>
    </main>
  );
}
