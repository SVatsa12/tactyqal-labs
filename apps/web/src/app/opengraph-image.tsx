import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = site.ogImage.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ImageResponse cannot read CSS variables, so the design tokens from globals.css are mirrored here.
const tokens = { brandSoft: "#FFF1EB", brand: "#F2541B", ink: "#0E0E12", muted: "#5B5B66", accent: "#FFD66B" };

/** Home page Open Graph card: wordmark + headline on brand-soft. Also used by pages without their own. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: tokens.brandSoft,
        color: tokens.ink,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="64" height="64" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="9" fill={tokens.brand} />
          <path d="M9 10.5h14v3.6h-5.2V23h-3.6v-8.9H9z" fill={tokens.ink} />
          <circle cx="22.5" cy="21.5" r="2.2" fill={tokens.accent} />
        </svg>
        <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>{site.brand.name}</span>
      </div>
      <div
        style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}
      >
        {site.ogImage.headline}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, color: tokens.muted }}>
        <span style={{ width: 48, height: 10, borderRadius: 999, background: tokens.accent }} />
        {site.ogImage.tagline}
      </div>
    </div>,
    size,
  );
}
