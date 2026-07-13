// Polaroid-style framing for the generated image: white border all around
// with a thicker bottom strip carrying a handwritten caption. Rendered with
// next/og's ImageResponse — no native image deps, and the caption font is a
// static TTF committed to the repo (assets/fonts/caveat.ttf) and loaded via
// fs.readFile, which Vercel's bundler traces into the deployed function.

import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

const IMAGE_SIZE = 1024;
const BORDER = 44; // white frame on top / left / right
const BOTTOM = 190; // classic thick polaroid bottom, holds the caption

const CAPTION = "Mayank and Cayley's Baby Shower";

// Cache the font across invocations of a warm serverless function.
let fontPromise: Promise<Buffer> | null = null;
function captionFont(): Promise<Buffer> {
  if (!fontPromise) {
    fontPromise = readFile(path.join(process.cwd(), "assets", "fonts", "caveat.ttf"));
  }
  return fontPromise;
}

export async function addFooterStrip(image: Buffer): Promise<Buffer> {
  const src = `data:image/png;base64,${image.toString("base64")}`;
  const font = await captionFont();

  const res = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "white",
          paddingTop: BORDER,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={IMAGE_SIZE} height={IMAGE_SIZE} alt="" />
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Caveat",
            fontSize: 72,
            whiteSpace: "nowrap",
            color: "#134e75",
            transform: "rotate(-2deg)",
          }}
        >
          {CAPTION}
        </div>
      </div>
    ),
    {
      width: IMAGE_SIZE + BORDER * 2,
      height: BORDER + IMAGE_SIZE + BOTTOM,
      fonts: [{ name: "Caveat", data: font, weight: 600, style: "normal" }],
    }
  );
  return Buffer.from(await res.arrayBuffer());
}
