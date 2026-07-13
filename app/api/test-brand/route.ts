// TEMPORARY route for verifying the footer strip — delete before deploying.
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { addFooterStrip } from "@/lib/branding";

export const runtime = "nodejs";

export async function GET() {
  const dir = path.join(process.cwd(), "generated");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".png")).sort();
  if (files.length === 0) return NextResponse.json({ error: "no generated images" }, { status: 404 });
  const image = await fs.readFile(path.join(dir, files[files.length - 1]));
  const branded = await addFooterStrip(image);
  return new NextResponse(new Uint8Array(branded), { headers: { "Content-Type": "image/png" } });
}
