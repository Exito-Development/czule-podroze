import { ImageResponse } from "next/og";
import { site } from "@/lib/data/site";

/**
 * Obrazek podglądu linku (Facebook, WhatsApp, LinkedIn, Slack).
 *
 * Generowany, a nie wrzucony jako plik — dzięki temu trzyma się palety
 * strony i nie trzeba pamiętać o podmianie grafiki przy zmianie hasła marki.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          background: "linear-gradient(135deg, #faf6ef 0%, #f3d6d7 55%, #eaeee2 100%)",
          color: "#3a342c",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#76856a",
          }}
        >
          Wyjazdy dla kobiet
        </div>
        <div style={{ fontSize: 104, marginTop: 18, lineHeight: 1.05 }}>
          {site.name}
        </div>
        <div style={{ fontSize: 40, marginTop: 20, color: "#6b6356" }}>
          {site.tagline}
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 44, fontSize: 26 }}>
          {["Tajlandia & Bali", "Zanzibar", "Portugalia"].map((label) => (
            <div
              key={label}
              style={{
                padding: "12px 26px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.65)",
                color: "#3a342c",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
