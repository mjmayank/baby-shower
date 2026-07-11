// ============================================================================
// GUEST LIST — edit this file before the party!
//
// For each guest, list the things they're known for. These get woven into the
// image prompt ("Add items to reflect that they're known for ...").
//
// - `email` (optional) prefills the email field when the guest picks their
//   name, so they don't have to type it on the booth laptop.
// - Matching is by name, case/whitespace-insensitive. Guests also get
//   tap-to-select suggestions as they type.
// - Guests not on this list get a screen to type their own attributes.
// ============================================================================

export interface Guest {
  name: string;
  attributes: string[];
  email?: string;
}

export const GUESTS: Guest[] = [
  // --- REPLACE THESE SAMPLE ENTRIES WITH YOUR REAL GUEST LIST -------------
  {
    name: "Priya Sharma",
    attributes: ["amazing home cooking", "marathon running", "always carrying a giant water bottle"],
    email: "priya@example.com",
  },
  {
    name: "David Chen",
    attributes: ["board game obsession", "craft coffee snobbery", "dad jokes"],
    email: "david@example.com",
  },
  {
    name: "Sofia Martinez",
    attributes: ["gardening", "salsa dancing", "rescuing stray cats"],
    email: "sofia@example.com",
  },
  {
    name: "James Okafor",
    attributes: ["basketball", "grilling the perfect steak", "loud infectious laugh"],
    email: "james@example.com",
  },
  {
    name: "Emily Nguyen",
    attributes: ["watercolor painting", "hiking every weekend", "matcha lattes"],
    email: "emily@example.com",
  },
  // ------------------------------------------------------------------------
];

/** Normalize a name for matching: lowercase, collapse whitespace. */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findGuest(name: string): Guest | undefined {
  const n = normalizeName(name);
  return GUESTS.find((g) => normalizeName(g.name) === n);
}
