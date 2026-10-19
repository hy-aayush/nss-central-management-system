import { sql } from "drizzle-orm";
import {
  date,
  index,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";

import { creativeDomainEnum } from "./enums";
import { volunteers } from "./volunteers";

/**
 * SRS Section 8.2 — `volunteer_domains`.
 *
 * A volunteer may belong to zero or more of the four creative domains. General
 * volunteering is implicit and is never stored here. The combination of
 * volunteer + domain is unique through the composite primary key.
 *
 * The `since` date supports the Domain Lead tenure rule in the application
 * layer (SRS D-05).
 */
export const volunteerDomains = pgTable(
  "volunteer_domains",
  {
    /** Restrict matches SRS 8.8; permanent deletion is handled by the DB function. */
    rollNumber: text("roll_number")
      .notNull()
      .references(() => volunteers.rollNumber, { onDelete: "restrict" }),

    /** One of the four stored creative specialisations. */
    domain: creativeDomainEnum("domain").notNull(),

    /**
     * IST calendar day the volunteer joined this domain. The SRS specifies
     * `DEFAULT current_date`; PostgreSQL evaluates it in the session timezone,
     * so callers needing an exact IST day should pass `since` explicitly.
     */
    since: date("since").notNull().default(sql`current_date`),
  },
  (t) => [
    /**
     * `primary key (roll_number, domain)` from SRS 8.2. The explicit name
     * matches PostgreSQL's default name for this constraint, keeping the
     * generated migration easy to compare with the SRS DDL.
     */
    primaryKey({
      name: "volunteer_domains_pkey",
      columns: [t.rollNumber, t.domain],
    }),

    /** SRS 8.2 index for grouping/filtering by domain. */
    index("volunteer_domains_domain_idx").on(t.domain),
  ],
);
