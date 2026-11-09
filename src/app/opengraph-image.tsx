import { ImageResponse } from "next/og";

export const alt = "NSS Central Management System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Link previews (WhatsApp, Slack, Teams) are the only place this internal tool
 * is ever seen outside the office, so the card is generated at build time and
 * cached instead of shipping a bitmap.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#111622",
          color: "#f5f6ff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#5b7cfa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: -1,
              color: "#0b0f19",
            }}
          >
            NSS
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#a8b1cd",
            }}
          >
            NSS Central Unit · KIIT
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: -2 }}>
            Central Management System
          </div>
          <div style={{ fontSize: 28, color: "#a8b1cd", maxWidth: 900 }}>
            Volunteer records, service hours, events and office operations in one
            private workspace.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            color: "#8b95b3",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 28,
          }}
        >
          Private internal tool · Synthetic demonstration data
        </div>
      </div>
    ),
    size,
  );
}
