/**
 * Safe post-sign-in return paths.
 *
 * `?next=` comes from the URL, so it is untrusted input. Only a same-origin,
 * absolute *path* is allowed: anything with a scheme, a protocol-relative
 * prefix, a backslash, control characters, auth pages or an unreasonable
 * length falls back to the dashboard (SRS 16.2).
 */

export const DEFAULT_RETURN_TO = "/dashboard";

const MAX_LENGTH = 512;

const DISALLOWED_PREFIXES = ["/login", "/access-denied", "/auth"];

function isDisallowedPath(pathname: string): boolean {
  return DISALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Returns a safe internal path for redirects, or the dashboard fallback. */
export function sanitizeReturnTo(
  value: string | readonly string[] | null | undefined,
): string {
  if (typeof value !== "string") {
    return DEFAULT_RETURN_TO;
  }

  const candidate = value.trim();

  if (
    candidate.length === 0 ||
    candidate.length > MAX_LENGTH ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return DEFAULT_RETURN_TO;
  }

  let url: URL;

  try {
    // Parsing against a fixed origin rejects anything that escapes it, such as
    // `/\evil.com` or an absolute URL.
    url = new URL(candidate, "https://nss.invalid");
  } catch {
    return DEFAULT_RETURN_TO;
  }

  if (url.origin !== "https://nss.invalid" || isDisallowedPath(url.pathname)) {
    return DEFAULT_RETURN_TO;
  }

  return `${url.pathname}${url.search}`;
}
