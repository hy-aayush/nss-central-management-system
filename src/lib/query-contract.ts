/**
 * Typed read contract for the queries the office screens issue.
 *
 * Today the fixtures are filtered in memory, so nothing enforces that a screen's
 * filters match an index. When the tables come from PostgreSQL, a filter with no
 * index stops being a slow array scan and becomes a sequential scan over every
 * volunteer — and that is discovered in production, under load, not here.
 *
 * Each entry names the read it describes, the entity, the columns it filters on,
 * and the index that has to cover it. A unit test (`tests/db/query-contract.test.ts`)
 * checks those index names against both the Drizzle schema and the generated SQL,
 * so renaming or dropping an index fails a check instead of quietly un-covering a
 * screen.
 */

const COLUMNS = {
  volunteers: [
    "id",
    "rollNumber",
    "projectId",
    "status",
    "year",
    "allocatedHours",
    "attendanceRateEvents",
  ],
  volunteer_domains: ["id", "volunteerId", "domain"],
  office_assignments: ["id", "rollNumber", "projectId", "role", "endsAt"],
} as const;

export type QueryEntity = keyof typeof COLUMNS;
export type QueryColumn<E extends QueryEntity> = (typeof COLUMNS)[E][number];

export interface ReadContract<E extends QueryEntity = QueryEntity> {
  /** How the screen refers to this read, for failure messages. */
  name: string;
  entity: E;
  /** Equality filters, in the order the screen applies them. */
  filters: readonly QueryColumn<E>[];
  /** Optional ordering the index can serve without a sort step. */
  order?: readonly QueryColumn<E>[];
  /** The index that must exist for this read to stay cheap. */
  index: string;
}

export const READ_CONTRACTS: readonly ReadContract[] = [
  {
    name: "volunteers by project and status",
    entity: "volunteers",
    filters: ["projectId", "status"],
    index: "volunteers_project_status_idx",
  },
  {
    name: "volunteers by status",
    entity: "volunteers",
    filters: ["status"],
    index: "volunteers_status_idx",
  },
  {
    name: "volunteers by creative domain",
    entity: "volunteer_domains",
    filters: ["domain"],
    index: "volunteer_domains_domain_idx",
  },
  {
    name: "active office assignment by roll number",
    entity: "office_assignments",
    filters: ["rollNumber", "endsAt"],
    index: "oa_roll_active_idx",
  },
];

/** Every column a contract may name, so a typo fails at compile time. */
export function columnsFor<E extends QueryEntity>(entity: E): readonly string[] {
  return COLUMNS[entity];
}
