import { NextRequest, NextResponse } from "next/server";
import { getGuests, saveGuests, storageBackend } from "@/lib/guestStore";
import type { Guest } from "@/lib/guests";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // never serve a cached guest list

export async function GET() {
  const guests = await getGuests();
  return NextResponse.json({ guests, backend: storageBackend() });
}

/** Validate and clean the posted guest list; null means malformed input. */
function sanitize(input: unknown): Guest[] | null {
  if (!Array.isArray(input)) return null;
  const out: Guest[] = [];
  for (const g of input) {
    if (!g || typeof g !== "object") return null;
    const record = g as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name.trim() : "";
    if (!name) continue; // silently drop empty rows from the admin form
    const attributes = Array.isArray(record.attributes)
      ? record.attributes.map((a) => String(a).trim()).filter(Boolean)
      : [];
    const email =
      typeof record.email === "string" && record.email.trim() ? record.email.trim() : undefined;
    out.push({ name, attributes, ...(email ? { email } : {}) });
  }
  return out;
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD is not set on the server, so guest editing is disabled" },
      { status: 500 }
    );
  }
  if (req.headers.get("x-admin-password") !== adminPassword) {
    return NextResponse.json({ ok: false, error: "Wrong admin password" }, { status: 401 });
  }

  let body: { guests?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const guests = sanitize(body.guests);
  if (!guests) {
    return NextResponse.json({ ok: false, error: "Malformed guest list" }, { status: 400 });
  }

  await saveGuests(guests);
  const backend = storageBackend();
  console.log(`[guests] saved ${guests.length} guests (backend: ${backend})`);
  return NextResponse.json({ ok: true, count: guests.length, backend });
}
