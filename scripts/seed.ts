/**
 * Seed CLI — fixed project reference data, plus optional synthetic fixtures.
 *
 * SRS Appendix A.1 and A.7. This script is never run automatically: it is not
 * part of `dev`, `build`, `start` or a postinstall hook, and it refuses a
 * production target (see `src/db/seed/targets.ts`).
 *
 * Usage:
 *   npm run db:seed                              # dry run against ADMIN_DATABASE_URL
 *   npm run db:seed -- --apply                   # write the nine fixed projects
 *   npm run db:seed -- --apply --fixtures        # also write synthetic dev/test rows
 *   npm run db:seed -- --url postgresql://...    # explicit local database
 *
 * Behaviour:
 * - Default is a dry run that writes nothing.
 * - `--apply` inserts missing rows. Existing rows are never updated or deleted,
 *   so the command is safe to run repeatedly (SRS Appendix A.5).
 * - `--fixtures` adds clearly synthetic volunteers from `src/db/seed/fixtures.ts`.
 *   It requires the project rows to exist first.
 * - Output never includes a password or a personal field value.
 */

import { createDatabase } from "../src/db/client";
import {
  EXPECTED_PROJECT_COUNT,
  SeedValidationError,
  countSyntheticFixtures,
  planProjectSeed,
  seedProjectReferenceData,
  seedSyntheticFixtures,
} from "../src/db/seed";
import {
  SYNTHETIC_VOLUNTEER_DOMAINS,
  SYNTHETIC_VOLUNTEERS,
} from "../src/db/seed/fixtures";
import {
  assertSeedTargetAllowed,
  formatSeedTarget,
} from "../src/db/seed/targets";
import { loadDotEnv } from "./lib/env";

const USAGE = `Seed the NSS database with fixed reference data.

Usage:
  npm run db:seed [-- --apply] [-- --fixtures] [-- --url <postgresql://...>]

Options:
  --apply      Write rows. Without it the command is a read-only dry run.
  --fixtures   Also insert the synthetic development/test volunteers.
               Requires the fixed projects to exist (run without --fixtures first).
  --url <url>  Database to use instead of ADMIN_DATABASE_URL.
  --help       Show this message.

Safety:
  - Nothing runs the seed automatically.
  - NODE_ENV=production and SEED_TARGET=production are always refused.
  - A remote host needs SEED_TARGET=staging and SEED_ALLOW_REMOTE=1.
  - Running twice inserts nothing new; existing rows are never overwritten.
`;

interface SeedCliOptions {
  apply: boolean;
  fixtures: boolean;
  help: boolean;
  url?: string;
}

function parseArgs(argv: readonly string[]): SeedCliOptions {
  const options: SeedCliOptions = { apply: false, fixtures: false, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--apply":
        options.apply = true;
        break;
      case "--fixtures":
        options.fixtures = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--url": {
        const value = argv[index + 1];
        if (!value || value.startsWith("--")) {
          throw new Error("--url needs a postgresql:// value.");
        }
        options.url = value;
        index += 1;
        break;
      }
      default:
        if (arg.startsWith("--url=")) {
          options.url = arg.slice("--url=".length);
        } else {
          throw new Error(`Unknown argument "${arg}". Run with --help.`);
        }
    }
  }

  return options;
}

async function main(): Promise<void> {
  loadDotEnv();

  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(USAGE);
    return;
  }

  const connectionString = (options.url ?? process.env.ADMIN_DATABASE_URL ?? "").trim();

  if (!connectionString) {
    throw new Error(
      "ADMIN_DATABASE_URL is not set. Keep the admin/session connection in .env (see .env.example), or pass --url for a local database.",
    );
  }

  const target = assertSeedTargetAllowed({
    connectionString,
    nodeEnv: process.env.NODE_ENV,
    seedTarget: process.env.SEED_TARGET,
    allowRemote: process.env.SEED_ALLOW_REMOTE === "1",
  });

  console.log(`Seed target: ${formatSeedTarget(target)}`);
  console.log(
    options.apply
      ? "Mode: APPLY — missing rows will be written."
      : "Mode: DRY RUN — nothing will be written (pass --apply to write).",
  );

  const { client, db } = createDatabase(connectionString);

  try {
    if (!options.apply) {
      const plan = await planProjectSeed(db);
      console.log(
        `Projects: ${plan.present.length}/${EXPECTED_PROJECT_COUNT} present; ${plan.missing.length} would be inserted.`,
      );

      if (options.fixtures) {
        const existing = await countSyntheticFixtures(db);
        console.log(
          `Fixtures: ${existing.volunteers}/${SYNTHETIC_VOLUNTEERS.length} volunteers present; ${existing.domains}/${SYNTHETIC_VOLUNTEER_DOMAINS.length} domain rows present.`,
        );
      } else {
        console.log(
          "Fixtures: not requested (add --fixtures for synthetic development/test volunteers).",
        );
      }

      console.log("Dry run complete.");
      return;
    }

    const report = await seedProjectReferenceData(db);
    console.log(
      `Projects: ${report.inserted} inserted, ${report.skipped} already present (${report.total}/${EXPECTED_PROJECT_COUNT} total).`,
    );

    for (const drift of report.drift) {
      console.warn(
        `WARNING: project ${drift.id} ${drift.field} is "${drift.actual}", Appendix A.1 specifies "${drift.expected}". The seed did not overwrite it; fix the row in the app or with a reviewed migration.`,
      );
    }

    if (options.fixtures) {
      const fixtureReport = await seedSyntheticFixtures(db);
      console.log(
        `Fixtures: ${fixtureReport.volunteersInserted} volunteers inserted, ${fixtureReport.volunteersSkipped} already present; ${fixtureReport.domainsInserted} domain rows inserted, ${fixtureReport.domainsSkipped} already present.`,
      );
    }

    console.log("Seed complete.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

main().catch((error: unknown) => {
  if (error instanceof SeedValidationError) {
    console.error(error.message);
    for (const issue of error.issues) {
      console.error(`  ${issue.row} ${issue.field}: ${issue.message}`);
    }
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }

  process.exitCode = 1;
});
