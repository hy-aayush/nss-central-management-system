/**
 * Loads `.env` for operator scripts.
 *
 * `next dev`/`next build` read `.env` themselves and `drizzle-kit` loads it via
 * its config, but a plain `tsx` script does not. Node 20.12+ ships
 * `process.loadEnvFile`, so no dependency is needed. A missing file is fine
 * (CI exports the variables directly); any other load error is re-thrown.
 *
 * This loader never prints a value and never logs the file contents.
 */
export function loadDotEnv(): void {
  const processWithLoader = process as NodeJS.Process & {
    loadEnvFile?: (path?: string) => void;
  };

  if (typeof processWithLoader.loadEnvFile !== "function") {
    return;
  }

  try {
    processWithLoader.loadEnvFile();
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return;
    }
    throw error;
  }
}
