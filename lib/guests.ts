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
    name: "Allison Chou",
    attributes: ["wedding dresses", "comedy", "traveling"],
  },
  {
    name: "Michael Chan",
    attributes: ["tennis"],
  },
  {
    name: "Deets",
    attributes: ["soccer", "JP Morgan", ],
  },
  {
    name: "Nehal",
    attributes: ["baking", "crochet"],
  },
  {
    name: "Sonia Xu",
    attributes: ["pharmacy benefits management", "Small Pomsky dog"],
  },
  {
    name: "Jacob Simon",
    attributes: ["technology", "small Pomsky dog", "Nathan Fielder"],
  },
  {
    name: "Arushi",
    attributes: ["modular synthesizer and making music"],
  },
  {
    name: "Hareesh",
    attributes: ["DJing", "playing music", "coding"],
  },
  {
    name: "Katrina",
    attributes: ["Soccer World Cup", "Walking the El Camino", "dancing", "scuba diving"],
  },
  {
    name: "Kailyn",
    attributes: ["Fujifilm camera", "Capital One Venture X Credit Card", "red"],
  },
  {
    name: "Josh B",
    attributes: ["Beer", "Small tattoos", "movies", "Miami Heat basketball"],
  },
  {
    name: "Jay B",
    attributes: ["soccer", "35mm film cameras", "skiing"],
  },
  {
    name: "Amy",
    attributes: ["sewing", ""],
  },
  {
    name: "Priyanka",
    attributes: ["Taylor Swift", "Womens health"],
  },
  {
    name: "Nick D",
    attributes: ["Skiing", "Music and DJing"],
  },
  {
    name: "Arjun B",
    attributes: ["Golden State Warriors", "Cryptocurrrency"],
  },
  {
    name: "Jonathan O",
    attributes: ["Marathon running", "taxis"],
  },
  {
    name: "Meredith",
    attributes: ["Hawaii", "comedy", "music"],
  },
  {
    name: "Emon",
    attributes: ["Elon Musk", "cryptocurrency", "concussion protocol"],
  },
  {
    name: "Stacey Zhou",
    attributes: ["Corporate finance", "skiing", "painting", "Australian Shepherd with a copper-brown and white coat"],
  },
  {
    name: "Will Bannister",
    attributes: ["stock market investing", "skiing", "Citibiking", "Australian Shepherd with a copper-brown and white coat"],
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
