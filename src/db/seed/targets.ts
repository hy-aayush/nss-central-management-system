/**
 * Seed target guard.
 *
 * The seed must never run by itself against a production database. Nothing in
 * `package.json`, the Next.js build, `dev`/`start` or a postinstall hook calls
 * the seed; it is always an explicit operator command. These checks add a
 * second line of defence:
 *
 * 1. `NODE_ENV=production` is refused outright.
 * 2. `SEED_TARGET=production` is refused outright.
 * 3. A remote host is refused unless the operator sets both
 *    `SEED_TARGET=staging` and `SEED_ALLOW_REMOTE=1`.
 *
 * Therefore writing to a loopback database needs no extra opt-in, while a
 * Supabase URL can never be seeded by accident. There is no code path that
 * runs a seed automatically.
 */

/** What the guard verified. Safe to print: never includes credentials. */
export interface SeedTargetInfo {
  host: string;
  port: string;
  database: string;
  isLocal: boolean;
}

export interface SeedTargetOptions {
  connectionString: string;
  /** `process.env.NODE_ENV`. */
  nodeEnv?: string;
  /** `process.env.SEED_TARGET` (`local`, `staging`, ...). */
  seedTarget?: string;
  /** `process.env.SEED_ALLOW_REMOTE === "1"`. */
  allowRemote?: boolean;
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * Describes a PostgreSQL URL without its username, password or query string.
 * Throws a short, credential-free error when the URL cannot be parsed.
 */
export function describeSeedTarget(connectionString: string): SeedTargetInfo {
  if (!connectionString.trim()) {
    throw new Error(
      "A PostgreSQL connection string is required. Set ADMIN_DATABASE_URL (see .env.example).",
    );
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error(
      "The database URL is not a valid URL. Use a postgresql:// URL (see .env.example).",
    );
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error("The database URL must start with postgresql:// or postgres://.");
  }

  const host = url.hostname;
  const port = url.port || "5432";
  const database = decodeURIComponent(url.pathname.replace(/^\//, "")) || "(default)";

  return { host, port, database, isLocal: LOOPBACK_HOSTS.has(host) };
}

/**
 * Returns the target when it is safe to seed, or throws with an explanation.
 *
 * The message names the host and database only. A password in the URL never
 * reaches the terminal or the logs.
 */
export function assertSeedTargetAllowed(options: SeedTargetOptions): SeedTargetInfo {
  const target = describeSeedTarget(options.connectionString);

  if (options.nodeEnv?.trim().toLowerCase() === "production") {
    throw new Error(
      "Refusing to seed: NODE_ENV=production. Seeds are for local development, tests and staging only.",
    );
  }

  const declared = options.seedTarget?.trim().toLowerCase();

  if (declared === "production" || declared === "prod") {
    throw new Error(
      "Refusing to seed: SEED_TARGET=production. Never seed a production database with this script.",
    );
  }

  if (!target.isLocal) {
    const approved =
      options.allowRemote === true && declared === "staging";

    if (!approved) {
      throw new Error(
        `Refusing to seed remote host "${target.host}" (database "${target.database}"). ` +
          "Remote seeding requires SEED_TARGET=staging and SEED_ALLOW_REMOTE=1, and is only for an explicitly approved staging database.",
      );
    }
  }

  return target;
}

/** Human-readable target label for CLI output; contains no credentials. */
export function formatSeedTarget(target: SeedTargetInfo): string {
  return `${target.host}:${target.port}/${target.database}${target.isLocal ? " (local)" : ""}`;
}
