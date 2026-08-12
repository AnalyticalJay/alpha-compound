export type HdSourceKind = "injectables" | "orals";

export type HdSourceImage = {
  source: HdSourceKind;
  sourceName: string;
  imageUrl: string;
};

export type HdProductCandidate = {
  id: number;
  name: string;
  slug: string;
  categoryName?: string | null;
};

export type HdImageMatch =
  | { status: "matched"; product: HdProductCandidate; score: 100 }
  | { status: "review"; product: HdProductCandidate | null; score: number; reason: string }
  | { status: "unmatched"; product: null; score: 0; reason: string };

const sourceProductAliases: Record<string, string> = {
  "testoviron 250": "hd-testoviron-250mg-1ml-amp",
  "sustanon 250": "hd-sus-250mg-1ml-amp",
  "deca durabolin 100": "hd-deca-durabolin-100mg-1ml-amp",
  "superbulk 600": "superbulk-600-200mg-ml-test-cyp",
  "supercutmix 300": "supercutmix-300-100mg-ml-tren-acetate",
  "supersize 500": "supersize-500-100mg-ml-test-cyp",
  "supertest 500": "supertest-500-150mg-ml-enanthate",
  "trestolone ment": "trestolone-ment-trestolone-acetate-ment",
  trinaject: "trinaject-50mg-ml-tren-acetate",
  "tren acetate": "trenaject-100-tren-acetate",
  "tren enanthate": "trenaject-200-tren-enanthate",
  "testaject 250": "testaject-test-enanthate",
  "sustaject 325": "sustaject-blend-of-5-testosterones",
  "stanoject 50": "stanoject-50-stanozol-water-solution",
  "propioject 100": "propioject-100-test-prop",
  "nebidoject 250": "nebidoject-250-test-undecanoate",
  "primoject 100": "primoject-100-methanolone-enanthate",
  "primoject 200": "primoject-200-methanolone-enanthate",
  "nandroject 300": "nandroject-300-nandrolone-decanoate",
  "mastaject 100": "mastaject-100-drostanolone-prop",
  "anabolicum lgd 4033": "anabolicum-lgd-4033",
  "andarine s4": "andarine-s4",
  "cardarine gw 501516": "cardarine-gw-501516",
  "nutrobal mk 677": "nutrobal-mk677",
  "ostarine mk 2866": "ostarine-mk-2866",
  "stenabolic sr 9009": "stenabolic-sr9009",
  "testolone rad 140": "testlonement-rad-140",
  "anavar oxandrolone": "anavar",
  dianabol: "dianabol10",
  "winstrol stanozolol": "winstrol10",
  "clomid clomiphene citrate": "clomid",
  dhea: "dhea25-super-dhea",
  "femara letrozole": "famara-letrozole",
  "halotest fluoxymesterone": "halotest-fluoxymesterone",
  "helios t3 clen yohimbine t3": "heliost3-37-5mcg-clen",
};

const correctedAssetIds: Record<string, string> = {
  "sustanon 250": "cm8prkijv000003jpc0d6hik8",
  "deca durabolin 100": "cm8prhvxq000703l1gofx4x1z",
};

export function normalizeHdSourceName(value: string): string {
  return value
    .replace(/\b(hd|labs|amp|amps|vial|vials|box|pack|capsules|capsule|tablets|tablet|oral|injectable|injections?)\b/gi, " ")
    .replace(/\b\d+\s*(mg|ml)\b/gi, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getHdSourceProductSlug(sourceName: string): string | null {
  return sourceProductAliases[normalizeHdSourceName(sourceName)] ?? null;
}

export function getHdSourceAssetId(sourceName: string, imageUrl: string): string | null {
  const correctedId = correctedAssetIds[normalizeHdSourceName(sourceName)];
  if (correctedId) return correctedId;
  const decodedUrl = decodeURIComponent(imageUrl);
  const match = decodedUrl.match(/media\/([^./?]+)/i);
  return match?.[1] ?? null;
}

export function getHdSourceImageUrl(sourceName: string, imageUrl: string): string {
  const assetId = getHdSourceAssetId(sourceName, imageUrl);
  if (!assetId) return imageUrl;
  const decodedUrl = decodeURIComponent(imageUrl);
  const extension = decodedUrl.match(/\.([a-z0-9]{2,5})(?:$|[?#])/i)?.[1]?.toLowerCase() ?? "png";
  return `https://emofly.b-cdn.net/hbd_exvhac6ayb3ZKT/width:1080/plain/https%3A%2F%2Fstorage.googleapis.com%2Ftakeapp%2Fmedia%2F${assetId}.${extension}`;
}

export function matchHdSourceToProduct(
  source: HdSourceImage,
  products: HdProductCandidate[],
  sourceNameCounts: ReadonlyMap<string, number> = new Map(),
): HdImageMatch {
  const sourceKey = normalizeHdSourceName(source.sourceName);
  const sourceSlug = getHdSourceProductSlug(source.sourceName);
  const duplicateSourceName = (sourceNameCounts.get(sourceKey) ?? 0) > 1;

  if (duplicateSourceName) {
    return {
      status: "review",
      product: null,
      score: 0,
      reason: "The source contains multiple cards with this label; the existing catalogue has no separate verified target for each asset.",
    };
  }

  if (!sourceSlug) {
    return {
      status: "unmatched",
      product: null,
      score: 0,
      reason: "No explicit source-to-catalogue alias exists for this product name.",
    };
  }

  const product = products.find((candidate) => candidate.slug === sourceSlug);
  if (!product) {
    return {
      status: "unmatched",
      product: null,
      score: 0,
      reason: `The source alias points to ${sourceSlug}, but that catalogue record does not exist.`,
    };
  }

  return { status: "matched", product, score: 100 };
}
