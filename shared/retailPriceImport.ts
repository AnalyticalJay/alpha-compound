export type PriceSourceTab = "HD" | "BP" | "PHARMA";

export type RetailPriceRow = {
  sourceTab: PriceSourceTab;
  productName: string;
  retailPrice: string;
  sourceRow: number;
};

export type PriceProduct = {
  id: number;
  name: string;
  categoryName?: string | null;
};

export type PriceMatch = {
  row: RetailPriceRow;
  product: PriceProduct;
  strategy: "exact" | "normalized" | "alias";
};

export type PriceMatchResult = {
  matches: PriceMatch[];
  unmatchedRows: RetailPriceRow[];
  ambiguousRows: Array<{ row: RetailPriceRow; candidates: PriceProduct[] }>;
  conflictingPrices: Array<{ product: PriceProduct; matches: PriceMatch[] }>;
  unmatchedProducts: PriceProduct[];
};

const aliasPairs: Array<[PriceSourceTab, string, string]> = [
  ["HD", "SUS250MG1MLAMP", "SUSTAJECT"],
  ["HD", "DECA DURABOLIN100MG1MLAMP", "DECA"],
  ["HD", "TESTOVIRON250MG1MLAMP", "TESTOVIRON"],
  ["HD", "HCGPREGNYL", "PREGNYL"],
  ["HD", "HGH RDNA ORIGIN GROWTH HORMONE", "HGH"],
  ["HD", "LOVERS PEPTIDE PT141", "PT141"],
  ["HD", "TIRSEMA44PEN", "TIRZEPATIDE44PEN"],
  ["HD", "DEPOJECT200TESTCYP", "DEPOJECT200"],
  ["HD", "HELIOSJECT20ML", "HELIOSJECT"],
  ["HD", "MASTAJECT100DROSTANOLONEPROP", "MASTAJECT100"],
  ["HD", "MASTAJECT200DROSTANOLONEPROP", "MASTAJECT200"],
  ["HD", "SUSTAJECTBLENDOF5TESTOSTERONES", "SUSTAJECT"],
  ["HD", "TESTAJECTTESTENANTHATE", "TESTAJECT"],
  ["HD", "TRINAJECTMIX", "TRINAJECT"],
  ["HD", "D3VITAMIND330CAPSULES", "D3VITAMIND3"],
  ["HD", "DNP100MG10TABLETS", "DNP"],
  ["HD", "HELIOST3375MCGCLEN54MGYOHIMBINE25MCGT3", "HELIOST3"],
  ["HD", "PRIMO25", "PRIMO25"],
  ["HD", "SIBUTRAMAX", "SIBUTRAMAX"],
  ["HD", "SIMPLYSHREDDED", "SIMPLYSHREDDED"],
  ["HD", "TAMOX", "TAMOXIFEN"],
  ["HD", "TIGHTANDTONE", "TIGHTANDTONE"],
  ["HD", "ZMA10MGZINC150MGMAGNESIUM35MGVITAMINB62MGBORON90CAPSULES", "ZMA10MGZINC"],
  ["HD", "SUPERBULK600", "SUPERBULK600"],
  ["HD", "SUPERCUTMIX300", "SUPERCUTMIX300"],
  ["HD", "SUPERSIZE500", "SUPERSIZE500"],
  ["HD", "SUPERTEST500", "SUPERTEST500"],
  ["HD", "TIRZEPATIDE10MG", "HDTIRZEPATIDE10MG"],
  ["BP", "BPCLENBUTEROL80INJ", "BPCLENBUTEROL80MGINJ"],
  ["BP", "BPSIBUTRAMINE2050TABLETS", "BPSIBUTRAMINE20MG"],
  ["BP", "BPTEST300", "BPTESTE300MG"],
  ["BP", "BPANAPOLAN25", "BPANAPOLIN25MG"],
  ["BP", "BPLIGANDROL10ANABOLICUM", "BPLIGANDROL10MG"],
  ["BP", "BPIBUTAMOREN10NUTROBAL", "BPIBUTAMOREN10MG"],
  ["PHARMA", "EPOEPREXSOLDPEN1X04ML4000IU", "EPREX"],
  ["PHARMA", "MYLANALPRAZOLAMXANAXGEN100S", "MYLANALPRAZOLAM"],
  ["PHARMA", "PREDNISONETCPO100TABS", "PREDNISONE"],
  ["PHARMA", "VOLTARENINJECTABLEDICLOFENAC", "VOLTAREN"],
];

export function normalizePriceName(value: string): string {
  return value
    .toUpperCase()
    .replace(/["'`]/g, "")
    .replace(/\bMG\b/g, "MG")
    .replace(/\bML\b/g, "ML")
    .replace(/\bTABS?\b/g, "TABLETS")
    .replace(/\bCAPS?\b/g, "CAPSULES")
    .replace(/\bAMP\b/g, "AMPOULE")
    .replace(/[^A-Z0-9]+/g, "")
    .replace(/^HD/, "")
    .trim();
}

export function parseRetailPrice(rawValue: string): string | null {
  const cleaned = rawValue.replace(/[\s,R]/g, "").replace(/,/g, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value.toFixed(2);
}

function isInSourceCohort(product: PriceProduct, sourceTab: PriceSourceTab): boolean {
  if (sourceTab === "BP") return /^BP\s/i.test(product.name);
  const isBp = /^BP\s/i.test(product.name);
  if (sourceTab === "HD") return !isBp;
  return !isBp;
}

function aliasKey(sourceTab: PriceSourceTab, sourceKey: string): string | undefined {
  return aliasPairs.find(([tab, source]) => tab === sourceTab && source === sourceKey)?.[2];
}

export function matchRetailPrices(rows: RetailPriceRow[], products: PriceProduct[]): PriceMatchResult {
  const matches: PriceMatch[] = [];
  const unmatchedRows: RetailPriceRow[] = [];
  const ambiguousRows: Array<{ row: RetailPriceRow; candidates: PriceProduct[] }> = [];
  const matchedProductIds = new Set<number>();

  for (const row of rows) {
    const cohort = products.filter((product) => isInSourceCohort(product, row.sourceTab));
    const sourceKey = normalizePriceName(row.productName);
    const exactCandidates = cohort.filter((product) => product.name.toUpperCase() === row.productName.toUpperCase());
    const normalizedCandidates = cohort.filter((product) => normalizePriceName(product.name) === sourceKey);
    const omittedUnitCandidates = cohort.filter((product) => {
      const productKey = normalizePriceName(product.name);
      return ["MG", "MCG", "ML"].some((unit) => productKey === `${sourceKey}${unit}`);
    });
    const alias = aliasKey(row.sourceTab, sourceKey);
    const aliasCandidates = alias
      ? cohort.filter((product) => normalizePriceName(product.name).includes(alias))
      : [];
    const candidateSet = exactCandidates.length
      ? exactCandidates
      : normalizedCandidates.length
        ? normalizedCandidates
        : omittedUnitCandidates.length
          ? omittedUnitCandidates
          : aliasCandidates;
    const strategy: PriceMatch["strategy"] = exactCandidates.length
      ? "exact"
      : normalizedCandidates.length || omittedUnitCandidates.length
        ? "normalized"
        : "alias";

    if (candidateSet.length === 1) {
      matches.push({ row, product: candidateSet[0], strategy });
      matchedProductIds.add(candidateSet[0].id);
    } else if (candidateSet.length > 1) {
      ambiguousRows.push({ row, candidates: candidateSet });
    } else {
      unmatchedRows.push(row);
    }
  }

  const groupedMatches = new Map<number, PriceMatch[]>();
  for (const match of matches) {
    const existing = groupedMatches.get(match.product.id) ?? [];
    existing.push(match);
    groupedMatches.set(match.product.id, existing);
  }
  const conflictingPrices = Array.from(groupedMatches.values())
    .filter((productMatches) => new Set(productMatches.map((match) => match.row.retailPrice)).size > 1)
    .map((productMatches) => ({ product: productMatches[0].product, matches: productMatches }));
  const conflictIds = new Set(conflictingPrices.map(({ product }) => product.id));
  const safeMatches = matches.filter((match) => !conflictIds.has(match.product.id));
  const safeMatchedProductIds = new Set(safeMatches.map((match) => match.product.id));

  return {
    matches: safeMatches,
    unmatchedRows,
    ambiguousRows,
    conflictingPrices,
    unmatchedProducts: products.filter((product) => !safeMatchedProductIds.has(product.id)),
  };
}
