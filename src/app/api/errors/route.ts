import { NextResponse, type NextRequest } from "next/server";

/**
 * Client boundary-error capture.
 *
 * A React error boundary shows the person a retry, and a `digest` in the UI —
 * but the digest alone is useless in a log without the section and the route it
 * happened on. This route joins the three into one line.
 *
 * Nothing here is private: a digest is a hash the framework generated, and the
 * message is deliberately not accepted, because an error message can contain the
 * data a render was handling. That restraint is why this is safe to log.
 */

const MAX_BODY_BYTES = 1_024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return new NextResponse(null, { status: 403 });
      }
    } catch {
      return new NextResponse(null, { status: 403 });
    }
  }

  if (Number(request.headers.get("content-length") ?? "0") > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) return new NextResponse(null, { status: 400 });

  const section =
    typeof body.section === "string" ? body.section.slice(0, 40) : "unknown";
  const digest =
    typeof body.digest === "string" ? body.digest.slice(0, 80) : "no-digest";
  const path = typeof body.path === "string" ? body.path.slice(0, 120) : "/";

  console.error(`[boundary] ${section} · ${path} · ${digest}`);

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}
