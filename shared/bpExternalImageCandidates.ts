export type ExternalBpImageCandidate = {
  productId: number;
  productName: string;
  sourcePageUrl: string;
  directImageUrl: string;
  verifiedMatch: boolean;
  confidence: string;
};

const explicitlyReviewBeforeImport = new Map<number, string>([
  [60054, "The supplier evidence identifies an 80mcg/ml injection while the catalogue strength is recorded as 80mg."],
  [60056, "The available CY Combo source does not unambiguously establish the injectable variant."],
]);

export function getExternalBpImageReviewReason(candidate: ExternalBpImageCandidate): string | null {
  if (!candidate.verifiedMatch) return "The research record does not confirm an exact product match.";
  if (!candidate.sourcePageUrl.startsWith("https://")) return "A secure source product page is required.";
  if (!candidate.directImageUrl.startsWith("https://")) return "A direct secure product image URL is required.";
  return explicitlyReviewBeforeImport.get(candidate.productId) ?? null;
}

export function selectUniqueExternalBpImageCandidates(candidates: ExternalBpImageCandidate[]) {
  const urlCounts = new Map<string, number>();
  for (const candidate of candidates) {
    if (candidate.directImageUrl.startsWith("https://")) {
      urlCounts.set(candidate.directImageUrl, (urlCounts.get(candidate.directImageUrl) ?? 0) + 1);
    }
  }

  return candidates.map((candidate) => {
    const reviewReason = getExternalBpImageReviewReason(candidate);
    if (reviewReason) return { candidate, eligible: false, reason: reviewReason };
    if ((urlCounts.get(candidate.directImageUrl) ?? 0) > 1) {
      return {
        candidate,
        eligible: false,
        reason: "The same source image URL was proposed for multiple products and requires manual product-specific confirmation.",
      };
    }
    return { candidate, eligible: true, reason: null };
  });
}
