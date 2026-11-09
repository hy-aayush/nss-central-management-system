import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { READ_CONTRACTS, columnsFor } from "@/lib/query-contract";

/**
 * The read contract against the schema.
 *
 * No database needed: this is a naming and coverage check, which is exactly the
 * kind of drift that survives review. If an index is renamed in a migration and
 * the contract is not updated, the screen that depended on it has silently lost
 * its index — and nothing else in the build would notice.
 */

const root = process.cwd();

const schemaSource = readdirSync(join(root, "src/db/schema"))
  .filter((file) => file.endsWith(".ts"))
  .map((file) => readFileSync(join(root, "src/db/schema", file), "utf8"))
  .join("\n");

const migrationSql = readdirSync(join(root, "drizzle"))
  .filter((file) => file.endsWith(".sql"))
  .map((file) => readFileSync(join(root, "drizzle", file), "utf8"))
  .join("\n");

describe("read contract", () => {
  it("declares at most one contract per name", () => {
    const names = READ_CONTRACTS.map((contract) => contract.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("only filters on columns the entity declares", () => {
    for (const contract of READ_CONTRACTS) {
      const allowed = columnsFor(contract.entity);
      expect(contract.filters.length).toBeGreaterThan(0);

      for (const filter of contract.filters) {
        expect(allowed).toContain(filter);
      }
      for (const column of contract.order ?? []) {
        expect(allowed).toContain(column);
      }
    }
  });

  it("names an index that exists in the schema and the migrations", () => {
    for (const contract of READ_CONTRACTS) {
      expect(
        schemaSource.includes(`"${contract.index}"`),
        `${contract.index} is missing from src/db/schema`,
      ).toBe(true);

      expect(
        migrationSql.includes(`"${contract.index}"`),
        `${contract.index} is missing from the generated migrations`,
      ).toBe(true);
    }
  });

  it("covers the first filter with the leading index column", () => {
    // A composite index only helps a read that filters on its leading column;
    // the rest of this check is deliberately not heuristic, because a second
    // column can be covered by a different index the contract also names.
    const leading: Record<string, string> = {
      volunteers_project_status_idx: "projectId",
      volunteers_status_idx: "status",
      volunteer_domains_domain_idx: "domain",
      oa_roll_active_idx: "rollNumber",
    };

    for (const contract of READ_CONTRACTS) {
      expect(contract.filters[0]).toBe(leading[contract.index]);
    }
  });
});
