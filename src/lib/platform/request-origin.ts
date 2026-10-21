import "server-only";

import { headers } from "next/headers";

/**
 * The origin used to build the OAuth callback URL.
 *
 * `APP_ORIGIN` is the SRS Appendix D value and wins when it is set (production
 * and staging). Local development falls back to the forwarded request host.
 * The value is never read from user input such as `?next=`.
 */
export async function getRequestOrigin(): Promise<string> {
  const configured = process.env.APP_ORIGIN?.trim();

  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Fall through to the request host rather than failing sign-in.
    }
  }

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headerList.get("host");

  if (!host) {
    throw new Error(
      "Cannot determine the request origin. Set APP_ORIGIN in the environment.",
    );
  }

  const forwardedProto = headerList
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  const protocol = forwardedProto === "https" ? "https" : "http";

  return `${protocol}://${host}`;
}
