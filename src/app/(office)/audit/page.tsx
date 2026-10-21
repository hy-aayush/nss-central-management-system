import { requireOfficeAccess } from "@/lib/auth/actor";

import AuditLogsPage from "../audit-logs/page";

/** Alias route for the audit ledger; gated before the shared page renders. */
export const instant = false;

export default async function AuditPage() {
  await requireOfficeAccess();

  return <AuditLogsPage />;
}
