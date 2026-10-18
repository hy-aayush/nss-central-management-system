// Defaults for every limit in Section 17 and for the settings in Appendix A.4.
// settings.limits (editable in the UI) overrides these. settings.limits_mode = "strict" applies STRICT_OVERRIDES.
// Matches docs/SRS.md Appendix C.

export const LIMITS = {
  readPerMinute: 120,
  writePerMinute: 30,
  writePerDay: 1000,
  bulkPerMinute: 10,
  staffMultiplier: 3,                // Coordinator and Tech: x3 on read, write and bulk; no cooldown
  exportsConcurrent: 1,
  exportsPerHour: 3,
  exportsPerDay: 10,
  exportMaxRows: 2000,
  importsPerDay: 3,
  importMaxRows: 1000,
  importHistoryMaxEvents: 200,
  importHistoryMaxAttendanceRows: 5000,
  csvMaxBytes: 1_000_000,
  bodyMaxBytes: 1_000_000,
  createsPerDay: 20,
  maxOpenDrafts: 10,
  heavyJobCooldownSeconds: 300,
  deniedLoginsPerIpPer10Min: 20,
  deniedLoginAuditPerIdentityPerHour: 1,
  deniedLoginAuditPerDay: 200,
  auditRowsPerActorPerDay: 1000,
  auditMaxRows: 50000,
  rollsPerCall: { attendance: 500, fcfs: 100, hoursAdjust: 100 },
  pendingRequestsPerTech: 10,
  emergency: { activePerGrantee: 3, activePerGrantor: 10, maxHours: 24 },
  adjustmentsPerVolunteerPerYear: 50,
  tripsBeforeCooldown: 3,
  tripWindowMinutes: 10,
  cooldownMinutes: 5,
  editBudgetRevisions: 2,
  momEditDays: 7,
  fcfsDefaultWindowMinutes: 60,
  maxCollabProjects: 3,
  meetingAbsenceYears: [2, 3],
  requestExpireDays: 14,
  retentionMonths: 42,
  auditRetentionDays: 30,
  dbSizeWarnMB: 350,
  dbSizeReadOnlyMB: 425,
  edgeRateLimitPerIpPerMinute: 600,  // the Vercel firewall rule (17.2); kept here so the number is written down
} as const;

export const STRICT_OVERRIDES = {
  readPerMinute: 60,
  writePerMinute: 15,
  exportsPerHour: 1,
  cacheTtlMultiplier: 2,
} as const;
