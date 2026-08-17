export type BpCategoryKey =
  | "ORALS"
  | "SARMS"
  | "INJECTABLES"
  | "FAT LOSS"
  | "POST CYCLE"
  | "ANCILLARIES"
  | "PEPTIDES";

export type BpNormalizedProduct = {
  sourceName: string;
  name: string;
  slug: string;
  dosageInfo?: string;
  categoryKey: BpCategoryKey;
  reviewReason?: "missing_strength";
};

export const BP_HEADING_CATEGORY_MAP: Record<string, BpCategoryKey> = {
  "ORAL STEROIDS": "ORALS",
  SARMS: "SARMS",
  "INJECTABLE STEROIDS": "INJECTABLES",
  "FAT LOSS": "FAT LOSS",
  "ANTI-ESTROGENS AND POST CYCLE THERAPY": "POST CYCLE",
  ANCILLARIES: "ANCILLARIES",
  "PEPTIDES PENS": "PEPTIDES",
  PEPTIDES: "PEPTIDES",
};

const UPPERCASE_TOKENS = new Set([
  "A", "AOD9604", "AQ", "BP", "BPC", "BPC157", "C", "CJC1295", "DAC", "DHEA", "DNP", "E", "F-CARDARINE", "GHK-CU", "GHRP-6", "HCG", "HGH", "IGF", "II", "IPAMORELIN", "LR3", "M1T", "MOTS-C", "MT2", "MTREN", "NAD+", "NPP", "P", "PT141", "RAD140", "RAD150", "S23", "TB500", "T3", "YK",
]);

const SOURCE_ALIASES: Record<string, string> = {
  ANAPOLAN: "Anapolin",
};

const COMPACT_STRENGTH_PATTERN = /^(BP (?:TEST [APCE]|BOLD C|TREN [AE]|MAST [PE]|PRIMO E|ULTRA(?:CUT|GAIN|TMT|GROW|MASS)))(\d+(?:\.\d+)?)(.*)$/i;

function titleToken(token: string) {
  const upper = token.toUpperCase();
  if (UPPERCASE_TOKENS.has(upper) || /^\d/.test(token)) return upper;
  if (SOURCE_ALIASES[upper]) return SOURCE_ALIASES[upper];
  return `${token.charAt(0).toUpperCase()}${token.slice(1).toLowerCase()}`;
}

function titleProductPart(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((token) => titleToken(token))
    .join(" ");
}

function normalizeUnit(value: string, unit: string) {
  return `${value}${unit.toUpperCase() === "IU" ? "IU" : "mg"}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryKeyFromBpHeading(rawHeading: string) {
  return BP_HEADING_CATEGORY_MAP[rawHeading.trim().replace(/:$/, "").toUpperCase()];
}

export function normalizeBpProduct(sourceName: string, categoryKey: BpCategoryKey): BpNormalizedProduct {
  const source = sourceName.trim().replace(/\s+/g, " ");
  const remainder = source.replace(/^BP\s+/i, "");
  const parentheticalMatch = remainder.match(/\s*(\([^)]*\))\s*$/);
  const core = parentheticalMatch ? remainder.slice(0, parentheticalMatch.index).trim() : remainder;

  const explicit = core.match(/^(.*?)(?:\s+)(\d+(?:\.\d+)?)(MG|IU)(?:\s+(.*))?$/i);
  if (explicit) {
    const [, base, amount, unit, trailing] = explicit;
    const normalizedBase = titleProductPart(base);
    const normalizedStrength = normalizeUnit(amount, unit);
    const normalizedTrailing = trailing ? ` ${titleProductPart(trailing)}` : "";
    const name = `BP ${normalizedBase} ${normalizedStrength}${normalizedTrailing}`.trim();
    return { sourceName: source, name, slug: slugify(name), dosageInfo: normalizedStrength, categoryKey };
  }

  const bareWithTrailing = core.match(/^(.*?)(?:\s+)(\d+(?:\.\d+)?)(?:\s+)([A-Za-z]+)$/);
  if (bareWithTrailing) {
    const [, base, amount, trailing] = bareWithTrailing;
    const normalizedStrength = normalizeUnit(amount, "MG");
    const name = `BP ${titleProductPart(base)} ${normalizedStrength} ${titleProductPart(trailing)}`.trim();
    return { sourceName: source, name, slug: slugify(name), dosageInfo: normalizedStrength, categoryKey };
  }

  const bare = core.match(/^(.*?)(?:\s+)(\d+(?:\.\d+)?)$/);
  if (bare) {
    const [, base, amount] = bare;
    const normalizedStrength = normalizeUnit(amount, "MG");
    const name = `BP ${titleProductPart(base)} ${normalizedStrength}`.trim();
    return { sourceName: source, name, slug: slugify(name), dosageInfo: normalizedStrength, categoryKey };
  }

  const compact = source.match(COMPACT_STRENGTH_PATTERN);
  if (compact) {
    const [, base, amount, trailing] = compact;
    const normalizedStrength = normalizeUnit(amount, "MG");
    const name = `${titleProductPart(base)} ${normalizedStrength}${titleProductPart(trailing ?? "") ? ` ${titleProductPart(trailing ?? "")}` : ""}`.trim();
    return { sourceName: source, name, slug: slugify(name), dosageInfo: normalizedStrength, categoryKey };
  }

  const name = `BP ${titleProductPart(core)}`.trim();
  return { sourceName: source, name, slug: slugify(name), categoryKey, reviewReason: "missing_strength" };
}
