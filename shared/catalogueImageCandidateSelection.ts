export type CatalogueImageResearch = {
  productId: number;
  productName: string;
  directImageUrl: string | null;
  sourcePageUrl: string | null;
  sourceName: string;
  matchStatus: "verified" | "unresolved";
  reason: string;
};

export type CandidateDecision = {
  candidate: CatalogueImageResearch;
  eligible: boolean;
  reason: string;
};

export function selectVerifiedCatalogueImageCandidates(
  candidates: CatalogueImageResearch[],
  excludedProductIds: number[] = [],
): CandidateDecision[] {
  const usedUrls = new Set<string>();
  const excluded = new Set(excludedProductIds);

  return candidates.map((candidate) => {
    if (excluded.has(candidate.productId)) {
      return { candidate, eligible: false, reason: "manually_excluded_for_variant_safety" };
    }
    if (candidate.matchStatus !== "verified" || !candidate.directImageUrl) {
      return { candidate, eligible: false, reason: "not_verified" };
    }
    if (!candidate.directImageUrl.startsWith("https://")) {
      return { candidate, eligible: false, reason: "non_https_source" };
    }
    if (usedUrls.has(candidate.directImageUrl)) {
      return { candidate, eligible: false, reason: "duplicate_image_source" };
    }
    usedUrls.add(candidate.directImageUrl);
    return { candidate, eligible: true, reason: "verified_unique_source" };
  });
}
