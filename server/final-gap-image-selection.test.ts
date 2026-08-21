import { describe, expect, it } from "vitest";
import { selectFinalGapImageCandidate } from "../shared/finalGapImageSelection";

const candidate = {
  product_id: "30019",
  product_name: "DEPOJECT 200",
  match_status: "verified",
  source_page_url: "https://supplier.example/products/depoject-200",
  direct_image_url: "https://supplier.example/images/depoject-200.jpg",
  source_title: "HD Labs Depoject 200",
  match_basis: "Exact product identity, form, strength, and brand.",
  confidence: "high",
};

describe("final gap image selection", () => {
  it("accepts a reviewed, high-confidence, HTTPS direct product image", () => {
    expect(selectFinalGapImageCandidate(candidate)).toEqual({ eligible: true, candidate });
  });

  it("rejects candidates outside the reviewed allowlist and temporary mirrors", () => {
    expect(selectFinalGapImageCandidate({ ...candidate, product_id: "30006" })).toEqual({
      eligible: false,
      reason: "not_in_reviewed_allowlist",
    });
    expect(selectFinalGapImageCandidate({ ...candidate, direct_image_url: "https://files.manuscdn.com/session/image.png" })).toEqual({
      eligible: false,
      reason: "temporary_mirror_not_permitted",
    });
  });
});
