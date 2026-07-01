export type Platform = "linkedin" | "instagram" | "x";

export type CoreIdea = {
  thesis: string;
  points: string[];
};

export type PlatformMeta = {
  id: Platform;
  name: string;
  limit: number;
};

export type RefineAction =
  | "hook"
  | "shorten"
  | "formal"
  | "casual"
  | "cta"
  | "hashtags";

export const PLATFORM_ORDER: Platform[] = ["linkedin", "instagram", "x"];

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  linkedin: { id: "linkedin", name: "LinkedIn", limit: 3000 },
  instagram: { id: "instagram", name: "Instagram", limit: 2200 },
  x: { id: "x", name: "X (Twitter)", limit: 280 },
};

const FILLER = new Set([
  "i",
  "oraz",
  "ale",
  "że",
  "się",
  "jest",
  "był",
  "była",
  "the",
  "and",
  "of",
  "to",
  "in",
  "is",
  "was",
  "it",
  "that",
]);

const LINKEDIN_HOOKS = [
  "Oto czego nauczył mnie ostatni sprint:",
  "Mały, szczery update z budowania w realu:",
  "Najtrudniejsza noc tego tygodnia dała najwięcej:",
];

const INSTAGRAM_HOOKS = [
  "Nocny grind 🌙",
  "Kulisy budowania 👇",
  "Tak wygląda prawdziwa praca 💻",
];

const X_HOOKS = [
  "szczerze? najwięcej uczy najtrudniejszy sprint.",
  "build in public, dzień kolejny:",
  "mały próg, duża lekcja:",
];

const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;

function capitalize(value: string): string {
  const trimmed = value.trim();
  return trimmed ? trimmed[0].toUpperCase() + trimmed.slice(1) : trimmed;
}

function scoreFragment(fragment: string): number {
  const words = fragment.toLowerCase().split(/\s+/).filter(Boolean);
  const meaningful = words.filter((w) => w.length > 3 && !FILLER.has(w));
  return meaningful.length * 2 + fragment.length / 12;
}

function pick(list: string[], avoid?: string): string {
  const pool = avoid ? list.filter((item) => item !== avoid) : list;
  const source = pool.length > 0 ? pool : list;
  return source[Math.floor(Math.random() * source.length)];
}

function hashtagsFrom(core: CoreIdea, extra: string[]): string {
  const text = [core.thesis, ...core.points].join(" ");
  const words = text.match(/[a-ząćęłńóśźż]{5,}/gi) ?? [];
  const tags: string[] = [];
  for (const word of words) {
    const lower = word.toLowerCase();
    if (FILLER.has(lower)) continue;
    const tag = "#" + lower[0].toUpperCase() + lower.slice(1);
    if (!tags.includes(tag)) tags.push(tag);
    if (tags.length === 2) break;
  }
  return [...tags, ...extra].join(" ");
}

function clamp(text: string, limit: number): string {
  return text.length > limit ? text.slice(0, limit - 1).trimEnd() + "…" : text;
}

export function extractCore(raw: string): CoreIdea {
  const fragments = raw
    .split(/[\n.,;!?]+/)
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.length > 2);

  if (fragments.length === 0) {
    return { thesis: "Krótki update z tego, nad czym pracuję", points: [] };
  }

  const ranked = [...fragments].sort(
    (a, b) => scoreFragment(b) - scoreFragment(a),
  );

  return {
    thesis: capitalize(ranked[0]),
    points: ranked.slice(1, 4).map(capitalize),
  };
}

export function composePost(platform: Platform, core: CoreIdea): string {
  if (platform === "linkedin") {
    const body = core.points.length
      ? core.points.map((point) => `• ${point}`).join("\n")
      : core.thesis;
    return [
      LINKEDIN_HOOKS[0],
      "",
      `${core.thesis}.`,
      "",
      body,
      "",
      "A Wy jak do tego podchodzicie?",
      "",
      hashtagsFrom(core, ["#BuildInPublic", "#Programowanie"]),
    ].join("\n");
  }

  if (platform === "instagram") {
    return [
      INSTAGRAM_HOOKS[0],
      "",
      `${core.thesis}.`,
      "",
      "Zapisz na później 📌 i napisz, co o tym myślisz.",
      "",
      hashtagsFrom(core, ["#nightowl", "#codinglife", "#buildinpublic"]),
    ].join("\n");
  }

  return clamp([X_HOOKS[0], "", `${core.thesis}.`].join("\n"), PLATFORM_META.x.limit);
}

export function refine(
  platform: Platform,
  text: string,
  action: RefineAction,
): string {
  const blocks = text.split("\n\n");

  if (action === "hook") {
    const hooks =
      platform === "linkedin"
        ? LINKEDIN_HOOKS
        : platform === "instagram"
          ? INSTAGRAM_HOOKS
          : X_HOOKS;
    blocks[0] = pick(hooks, blocks[0]);
    return blocks.join("\n\n");
  }

  if (action === "shorten") {
    const kept = blocks.slice(0, Math.max(1, Math.ceil(blocks.length / 2)));
    return kept.join("\n\n");
  }

  if (action === "formal") {
    return text
      .replace(EMOJI, "")
      .replace(/!+/g, ".")
      .replace(/\bWy\b/g, "Państwo")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  if (action === "casual") {
    EMOJI.lastIndex = 0;
    return EMOJI.test(text) ? text : `Szczerze? ${text}`;
  }

  if (action === "cta") {
    const cta =
      platform === "linkedin"
        ? "Jeśli też tak macie — dajcie znać w komentarzu. 👇"
        : platform === "instagram"
          ? "Obserwuj po więcej takich kulis ✨"
          : "RT jeśli się zgadzasz.";
    return `${text}\n\n${cta}`;
  }

  const extra =
    platform === "linkedin"
      ? "#BuildInPublic #Programowanie #TechCareer"
      : platform === "instagram"
        ? "#codinglife #nightowl #devvibe #buildinpublic"
        : "#buildinpublic";
  const withoutTags = blocks
    .filter((block) => !block.trim().startsWith("#"))
    .join("\n\n");
  return `${withoutTags}\n\n${extra}`;
}
