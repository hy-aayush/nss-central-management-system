import { ClipboardCheck, ScrollText, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithDevCredentials, signInWithGoogle } from "@/lib/auth/actions";
import { loadOfficeAccess } from "@/lib/auth/actor";
import { devLoginAccounts } from "@/lib/auth/dev-login";
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
  dev: "Those test credentials did not match a seeded test account.",
};

const CAPABILITIES = [
  {
    icon: Users,
    title: "One register for every wing",
    description:
      "Volunteer records, project affiliations, and creative domains in a single audited directory.",
  },
  {
    icon: ClipboardCheck,
    title: "Attendance that holds up",
    description:
      "Roll call, lock deadlines, and audited corrections — no retrospective edits without a trail.",
  },
  {
    icon: ScrollText,
    title: "Every action accounted for",
    description:
      "An append-only ledger of sensitive changes, role grants, and emergency access.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = sanitizeReturnTo(params.next);
  const errorCode = typeof params.error === "string" ? params.error : null;
  const configured = isSupabaseConfigured();
  // A bad test credential is a field problem, not a page problem: it belongs
  // under the inputs where the person is looking, not in a banner above them.
  const credentialError = errorCode === "dev" ? ERROR_MESSAGES.dev : null;

  // TEMPORARY: one example account per office role, for the dev sign-in form.
  // `devLoginAccounts()` is empty in production and when dev login is disabled.
  const devExamples = [
    ...new Map(devLoginAccounts().map((account) => [account.label, account])).values(),
  ];

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
    <main className="relative flex min-h-screen flex-col bg-background text-foreground antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-primary/[0.055] blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
        {/* Editorial side */}
        <div className="hidden flex-col gap-8 lg:flex">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center overflow-hidden rounded-xl bg-primary text-[0.6875rem] font-semibold tracking-wide text-primary-foreground">
              <span className="relative z-10">NSS</span>
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent"
              />
            </div>
            <div className="leading-tight">
              <p className="text-[0.875rem] font-semibold tracking-[-0.01em]">
                NSS Central
              </p>
              <p className="text-[0.6875rem] text-muted-foreground">
                KIIT University Unit
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-eyebrow">Internal office workspace</p>
            <h1 className="text-display max-w-lg text-foreground">
              The operations desk for National Service Scheme.
            </h1>
            <p className="max-w-md text-body-md leading-relaxed text-muted-foreground">
              Records, drives, attendance, and service hours for the entire unit
              — kept in one place, checked on every request, and written to an
              immutable audit trail.
            </p>
          </div>

          <ul className="grid gap-4">
            {CAPABILITIES.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card/70 text-muted-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-[0.8125rem] font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="max-w-sm text-[0.75rem] leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="text-[0.625rem] tracking-[0.03em] text-muted-foreground/70">
            Synthetic demonstration data only · Asia/Kolkata (IST)
          </p>
        </div>

        {/* Sign-in card */}
        <div className="mx-auto w-full max-w-[26rem]">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-[0.625rem] font-semibold text-primary-foreground">
              NSS
            </div>
            <div className="leading-tight">
              <p className="text-[0.8125rem] font-semibold">NSS Central</p>
              <p className="text-[0.6875rem] text-muted-foreground">
                KIIT University Unit
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/85 p-6 shadow-[var(--elevation-2)] backdrop-blur-xl sm:p-7">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-surface-container-low/70 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>

            <h2 className="mt-4 text-headline-lg text-foreground">
              Staff sign-in
            </h2>
            <p className="mt-1.5 text-body-sm leading-relaxed text-muted-foreground">
              For approved office staff only — Coordinators, Tech Team, Project
              Representatives, and Builders. Use your institute account
              (@kiit.ac.in).
            </p>

            {errorCode && errorCode !== "dev" && ERROR_MESSAGES[errorCode] ? (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-destructive/25 bg-error-container/50 px-3 py-2 text-[0.75rem] leading-relaxed text-on-error-container"
              >
                {ERROR_MESSAGES[errorCode]}
              </p>
            ) : null}

            <form action={signInWithGoogle} className="mt-5">
              <input type="hidden" name="next" value={next} />
              <Button
                type="submit"
                size="lg"
                disabled={!configured}
                className="w-full justify-center gap-2"
              >
                <GoogleMark />
                Continue with Google
              </Button>
            </form>

            <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted-foreground">
              {configured
                ? "You must already hold an active office post. Access is re-checked on every request, and a signed-in account without a post is signed out."
                : "Google sign-in is not configured in this build yet. An administrator must set the Supabase environment variables before sign-in can work."}
            </p>

            {devExamples.length > 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-border/70 bg-surface-container-low/40 p-4">
                <p className="text-[0.625rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Temporary test sign-in
                </p>
                <p className="mt-1 text-[0.6875rem] leading-relaxed text-muted-foreground">
                  Development only. Username is the roll number; the password
                  depends on the role. Remove these accounts, and this form,
                  before production.
                </p>

                <form action={signInWithDevCredentials} className="mt-3 space-y-2">
                  <input type="hidden" name="next" value={next} />
                  <label className="block space-y-1">
                    <span className="text-[0.6875rem] font-medium text-foreground">
                      Username (roll number)
                    </span>
                    <Input
                      name="username"
                      autoComplete="username"
                      placeholder="2328051"
                      aria-invalid={credentialError ? true : undefined}
                      aria-describedby={
                        credentialError ? "dev-credential-error" : undefined
                      }
                      required
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[0.6875rem] font-medium text-foreground">
                      Password
                    </span>
                    <Input
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      aria-invalid={credentialError ? true : undefined}
                      aria-describedby={
                        credentialError ? "dev-credential-error" : undefined
                      }
                      required
                    />
                  </label>
                  {credentialError ? (
                    <p
                      id="dev-credential-error"
                      role="alert"
                      className="rounded-md border border-destructive/25 bg-error-container/40 px-2.5 py-1.5 text-[0.6875rem] leading-relaxed text-on-error-container"
                    >
                      {credentialError}
                    </p>
                  ) : null}
                  <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    className="w-full justify-center"
                  >
                    Sign in with test account
                  </Button>
                </form>

                <dl className="mt-3 space-y-1 text-[0.625rem] leading-relaxed text-muted-foreground">
                  {devExamples.map((account) => (
                    <div
                      key={account.label}
                      className="flex flex-wrap items-baseline justify-between gap-x-2"
                    >
                      <dt className="text-foreground">{account.label}</dt>
                      <dd className="font-mono">
                        {account.username} · {account.password}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <div className="mt-5 border-t border-border/60 pt-4">
              <p className="text-[0.6875rem] leading-relaxed text-muted-foreground">
                Volunteers do not sign in — the office keeps this record on
                their behalf.
              </p>
              <form action="/auth/signout" method="post" className="mt-2">
                <button
                  type="submit"
                  className="text-[0.6875rem] font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Sign out of another session
                </button>
              </form>
            </div>
          </div>

          <p className="mt-4 text-center text-[0.625rem] text-muted-foreground/70">
            Private internal system · not indexed · SRS 4.4 access gate
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1a5.9 5.9 0 0 1 0-11.8c1.68 0 2.81.71 3.46 1.32l2.36-2.27C16.28 3.98 14.3 3.1 12 3.1a8.9 8.9 0 0 0 0 17.8c5.14 0 8.54-3.6 8.54-8.68 0-.58-.06-1.02-.19-1.12Z"
      />
    </svg>
  );
}
