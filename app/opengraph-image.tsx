import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

// Link-preview card (iMessage, Slack, etc.). Next.js serves this at
// /opengraph-image and adds the og:image meta tag automatically.

export const alt = "Mayank & Cayley's Baby Shower — turn yourself into a baby caricature!";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const baby = await readFile(path.join(process.cwd(), "assets", "og-baby.jpg"));
  const babySrc = `data:image/jpeg;base64,${baby.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "50px 70px",
          background: "linear-gradient(180deg, #7dd3fc 0%, #0ea5e9 55%, #0369a1 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 660 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
              textShadow: "0 4px 14px rgba(3, 62, 100, 0.55)",
            }}
          >
            Mayank &amp; Cayley&apos;s Baby Shower
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 700,
              color: "#e0f2fe",
              marginTop: 28,
              textShadow: "0 2px 8px rgba(3, 62, 100, 0.5)",
            }}
          >
            🌊 Turn yourself into a baby caricature!
          </div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 30 }}>🐳 🐙 🐠 🐢 🦀</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={babySrc}
          width={400}
          height={400}
          alt=""
          style={{
            borderRadius: 48,
            border: "12px solid rgba(255, 255, 255, 0.9)",
            boxShadow: "0 20px 50px rgba(3, 62, 100, 0.5)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
