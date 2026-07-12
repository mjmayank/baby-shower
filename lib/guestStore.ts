// Guest list storage. With Upstash Redis attached (Vercel Marketplace →
// Upstash for Redis), the list lives in Redis under one key and is editable
// from /admin without a deploy. Without Redis (e.g. local dev), it falls back
// to the hardcoded list in lib/guests.ts, and admin edits last until restart.

import { Redis } from "@upstash/redis";
import { GUESTS as SEED, type Guest } from "./guests";

const KEY = "babyshower:guests";

function redis(): Redis | null {
  // The Vercel marketplace integration injects KV_-prefixed names; a manual
  // Upstash setup uses UPSTASH_-prefixed ones. Accept either.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function storageBackend(): "redis" | "memory" {
  return redis() ? "redis" : "memory";
}

const globalStore = globalThis as unknown as { __guests?: Guest[] };

export async function getGuests(): Promise<Guest[]> {
  const r = redis();
  if (!r) return globalStore.__guests ?? SEED;
  const stored = await r.get<Guest[]>(KEY);
  if (!stored) {
    // First run against a fresh Redis: seed it with the hardcoded list.
    await r.set(KEY, SEED);
    return SEED;
  }
  return stored;
}

export async function saveGuests(guests: Guest[]): Promise<void> {
  const r = redis();
  if (!r) {
    globalStore.__guests = guests;
    return;
  }
  await r.set(KEY, guests);
}
