export const PUBLISHER_TIERS = ["major", "independent", "self"] as const;

export type PublisherTier = (typeof PUBLISHER_TIERS)[number];

export const PUBLISHER_TIER_LABELS: Record<PublisherTier, string> = {
  major: "Major trade",
  independent: "Independent",
  self: "Self-published",
};

export const SELF_PATTERNS = [
  "independently published",
  "amazon digital services",
  "kdp",
  "createspace",
  "lulu",
  "draft2digital",
  "smashwords",
];

export const KNOWN_INDEPENDENT_PATTERNS = [
  "bookouture",
  "inkubator",
  "joffe",
  "amazon publishing",
  "thomas & mercer",
  "thomas and mercer",
  "storyfire",
  "storm publishing",
  "bloodhound",
  "boldwood",
  "hera books",
  "canelo",
  "black rose writing",
  "second sky",
  "embla",
  "sapere books",
];

export const MAJOR_PATTERNS = [
  "penguin",
  "random house",
  "knopf",
  "doubleday",
  "viking",
  "riverhead",
  "ballantine",
  "bantam",
  "dutton",
  "putnam",
  "berkley",
  "harpercollins",
  "harper",
  "william morrow",
  "avon",
  "simon and schuster",
  "simon & schuster",
  "scribner",
  "atria",
  "gallery books",
  "pocket books",
  "hachette",
  "little brown",
  "little, brown",
  "grand central",
  "mulholland",
  "orbit",
  "macmillan",
  "st. martin",
  "minotaur",
  "flatiron",
  "celadon",
  "farrar",
  "picador",
  "henry holt",
  "tor ",
  "bloomsbury",
  "faber",
  "hodder",
  "headline",
  "orion",
  "transworld",
  "kensington",
  "sourcebooks",
  "poisoned pen",
  "harlequin",
  "mira",
  "park row",
  "quercus",
  "pan books",
  "wildfire",
];

export function classifyImprint(imprint: string | null): PublisherTier | null {
  if (!imprint) return null;
  const value = imprint.toLowerCase();
  if (SELF_PATTERNS.some((p) => value.includes(p))) return "self";
  if (MAJOR_PATTERNS.some((p) => value.includes(p))) return "major";
  return "independent";
}
