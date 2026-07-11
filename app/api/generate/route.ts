import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import fs from "fs/promises";
import path from "path";
import { deliver } from "@/lib/delivery";

export const runtime = "nodejs";
export const maxDuration = 300; // image generation can take a couple of minutes

function buildPrompt(attributes: string[]): string {
  const attrText = attributes.length > 0 ? attributes.join(", ") : "";
  const attrSentence = attrText
    ? `Add items to reflect that they're known for ${attrText}. `
    : "";
  return (
    "Transform this photo into a cute Pixar/Disney-style baby caricature: " +
    "keep the person's key facial features (hairstyle, hair color, eye shape, skin tone, notable expressions, and glasses or facial hair if present) " +
    "but render them as an adorable cartoon infant. Big round eyes, soft chubby cheeks, " +
    "oversized head-to-body ratio, warm pastel color palette. " +
    attrSentence +
    "Clean simple background, soft studio lighting, high-quality illustration style, no text."
  );
}

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; attributes?: string[]; imageDataUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const attributes = (body.attributes || []).map((a) => a.trim()).filter(Boolean);
  const imageDataUrl = body.imageDataUrl || "";

  if (!name || !email || !imageDataUrl.startsWith("data:image/")) {
    return NextResponse.json({ ok: false, error: "Missing name, email, or photo" }, { status: 400 });
  }
  const apiKey = process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "OPENAI_API_KEY is not set" }, { status: 500 });
  }

  const photoBuffer = Buffer.from(imageDataUrl.split(",")[1], "base64");

  let generated: Buffer;
  try {
    const openai = new OpenAI({ apiKey });
    const model = process.env.IMAGE_MODEL || "gpt-image-2";
    const params: Record<string, unknown> = {
      model,
      image: await toFile(photoBuffer, "photo.png", { type: "image/png" }),
      prompt: buildPrompt(attributes),
      size: "1024x1024",
      quality: (process.env.IMAGE_QUALITY as "low" | "medium" | "high") || "high",
    };
    // gpt-image-1 / 1.5 need this to preserve the person's face well;
    // gpt-image-2 always uses high input fidelity and rejects the param.
    if (model.startsWith("gpt-image-1")) params.input_fidelity = "high";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await openai.images.edit(params as any);
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image data");
    generated = Buffer.from(b64, "base64");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[generate] OpenAI generation failed for ${name}:`, message);
    return NextResponse.json(
      { ok: false, error: `Image generation failed: ${message}` },
      { status: 502 }
    );
  }

  // Always keep a local copy on the server, regardless of delivery outcome.
  try {
    const dir = path.join(process.cwd(), "generated");
    await fs.mkdir(dir, { recursive: true });
    const safeName = name.replace(/[^a-z0-9 _-]/gi, "").trim().replace(/\s+/g, "-").toLowerCase();
    await fs.writeFile(path.join(dir, `${safeName}-${Date.now()}.png`), generated);
  } catch (err) {
    console.error(`[generate] Could not save local copy for ${name}:`, err);
  }

  const problems = await deliver({ guestName: name, email, image: generated });
  for (const p of problems) console.error(`[generate] Delivery issue for ${name}: ${p}`);

  return NextResponse.json({ ok: true, problems });
}
