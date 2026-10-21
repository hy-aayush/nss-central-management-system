import { connection } from "next/server";

import { requireOfficeAccess } from "@/lib/auth/actor";

/** Every office navigation waits for the server-side access check. */
export const instant = false;

/**
 * Per-navigation access check for every office page.
 *
 * A layout is rendered once and reused across client-side navigations, so it
 * cannot be the only page-level guard. A template re-renders on each
 * navigation; running the same server check here means a revoked, suspended or
 * signed-out person cannot receive a private page payload mid-session
 * (SRS 4.4 and 16.2).
 *
 * This is still not a substitute for authorization inside data functions:
 * repositories/services must call `requireOfficeAccess()` too, and they will
 * enforce row scope in SQL.
 */
export default async function OfficeTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  await requireOfficeAccess();

  return children;
}
