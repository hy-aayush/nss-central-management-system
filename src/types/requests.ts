/**
 * Approval requests and CSV imports types for NSS Central Management System.
 * Matches docs/SRS.md Sections 4.8, 10.6, 14.
 */

import type { VolunteerBasic } from "./volunteer";

export type RequestKind =
  | "VOLUNTEER_SUSPEND"
  | "VOLUNTEER_REINSTATE"
  | "VOLUNTEER_ARCHIVE"
  | "VOLUNTEER_DELETE"
  | "RETENTION_RUN";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED" | "FAILED";

export interface ApprovalRequest {
  id: number;
  kind: RequestKind;
  status: RequestStatus;
  targets: VolunteerBasic[];             // names for the Coordinator's screen (1-200)
  params: Record<string, unknown>;
  reason: string;
  requestedBy: VolunteerBasic;
  requestedAt: string;
  decidedBy: VolunteerBasic | null;
  decidedAt: string | null;
  decisionNote: string | null;
  executedAt: string | null;
  error: string | null;
}

export type ImportKind = "VOLUNTEERS" | "HISTORY_EVENTS" | "HISTORY_HOURS";

export interface ImportRowIssue {
  row: number;
  field?: string;
  message: string;
}

export interface ImportPreview {
  kind: ImportKind;
  validRows: number;
  duplicateRows: number;
  errorRows: number;
  issues: ImportRowIssue[];              // first 100 only
  willCreate: Record<string, number>;    // e.g. { volunteers: 120 } or { events: 12, attendance: 840 }
  token: string;                         // short-lived (15 min) token that ties Confirm to this exact preview
}
