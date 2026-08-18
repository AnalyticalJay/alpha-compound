export type ResearchCandidate = {
  product_id: string;
  match_status: "verified" | "unresolved";
  direct_image_url: string;
  source_page_url: string;
  source_name: string;
  confidence: number | string;
  rationale: string;
};

// Candidates reviewed against the catalogue title, known brand, formulation and pack size.
// Similar compounds, unverifiable source mirrors, and variant/strength conflicts stay excluded.
export const approvedSecondPassProductIds = new Set([
  "30017", // HD Labs Aquaject 100, 10ml
  "30021", // HD Labs EquiJect 200, 10ml
  "30023", // HD Labs Heliosject, formulation verified
  "30043", // Cialis 5mg, 30 count
  "30084", // Concerta 18mg
  "30086", // Concerta 36mg, 30 count
  "30087", // Concerta 54mg, 30 count
  "30093", // Dostinex 0.5mg, 4 count
  "30099", // HD D3, 30 caps
  "30104", // HD ZMA formulation
  "30109", // Mylan Alprazolam, 100 count
  "60018", // BP Ostarine 10mg
  "60072", // BP Levitra 20mg
]);

export function selectSecondPassImageCandidate(candidate: ResearchCandidate) {
  if (!approvedSecondPassProductIds.has(candidate.product_id)) {
    return { eligible: false, reason: "not_approved_after_variant_review" };
  }
  if (candidate.match_status !== "verified") {
    return { eligible: false, reason: "research_not_verified" };
  }
  if (!candidate.direct_image_url.startsWith("https://") || !candidate.source_page_url.startsWith("https://")) {
    return { eligible: false, reason: "non_https_source" };
  }
  if (candidate.direct_image_url.includes("files.manuscdn.com")) {
    return { eligible: false, reason: "derived_source_url_not_allowed" };
  }
  return { eligible: true, reason: "exact_candidate_approved" };
}
