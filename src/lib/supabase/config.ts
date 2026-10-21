/**
 * Supabase public configuration.
 *
 * SRS 2.4 and Appendix D: the app may read only the project URL and the anon
 * key. The anon key is public by design; the service-role key must never exist
 * in this application (SRS 16.3). The Google client secret lives in the
 * Supabase dashboard, never here.
 *
 * `NEXT_PUBLIC_*` values are inlined at build time. A missing or malformed
 * pair is not a crash: the login page explains that sign-in is not configured
 * and the gate denies access by default. That keeps `next build` usable on a
 * clean checkout without secrets.
 */

export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

/** Returns the validated public config, or `null` when it is absent/invalid. */
export function readSupabaseConfig(): SupabasePublicConfig | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!rawUrl || !anonKey) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  return { url: rawUrl.replace(/\/+$/, ""), anonKey };
}

/** True when sign-in can be started in this build. */
export function isSupabaseConfigured(): boolean {
  return readSupabaseConfig() !== null;
}
