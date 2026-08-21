export type FinalGapImageCandidate = {
  product_id: string;
  product_name: string;
  match_status: string;
  source_page_url: string;
  direct_image_url: string;
  source_title: string;
  match_basis: string;
  confidence: string;
};

// Each listed candidate was reviewed for product identity, form, strength, and source quality.
// Candidates backed only by a temporary mirror or with a material pack/form mismatch remain excluded.
export const finalGapApprovedIds = new Set([
  "30005", "30007", "30008", "30010", "30012", "30014", "30019", "30020", "30021", "30022", "30025", "30042", "30078", "30080", "30083", "30092", "30094", "30096", "30097", "30102", "30116", "30117", "30119", "30127", "30132", "60021", "60026", "60064", "60074", "120001", "120002", "120003", "120004", "120005", "120006", "120007", "120008", "120018",
]);

export function selectFinalGapImageCandidate(candidate: FinalGapImageCandidate) {
  if (!finalGapApprovedIds.has(candidate.product_id)) {
    return { eligible: false, reason: "not_in_reviewed_allowlist" } as const;
  }
  if (candidate.match_status !== "verified" || candidate.confidence !== "high") {
    return { eligible: false, reason: "unverified_or_insufficient_confidence" } as const;
  }
  if (!candidate.source_page_url.startsWith("https://") || !candidate.direct_image_url.startsWith("https://")) {
    return { eligible: false, reason: "non_https_source" } as const;
  }
  if (candidate.direct_image_url.includes("files.manuscdn.com")) {
    return { eligible: false, reason: "temporary_mirror_not_permitted" } as const;
  }
  return { eligible: true, candidate } as const;
}
