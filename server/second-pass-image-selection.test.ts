import { describe, expect, it } from "vitest";
import { selectSecondPassImageCandidate } from "../shared/secondPassImageSelection";

describe("selectSecondPassImageCandidate", () => {
  it("accepts a reviewed exact candidate with authoritative HTTPS source URLs", () => {
    expect(selectSecondPassImageCandidate({
      product_id: "30017",
      match_status: "verified",
      direct_image_url: "https://supplier.example/aquaject.jpg",
      source_page_url: "https://supplier.example/aquaject",
      source_name: "Supplier",
      confidence: 1,
      rationale: "Exact",
    })).toEqual({ eligible: true, reason: "exact_candidate_approved" });
  });

  it("rejects unreviewed variants and derived source mirrors", () => {
    expect(selectSecondPassImageCandidate({
      product_id: "30116",
      match_status: "verified",
      direct_image_url: "https://supplier.example/prednisone.jpg",
      source_page_url: "https://supplier.example/prednisone",
      source_name: "Supplier",
      confidence: 1,
      rationale: "Strength unclear",
    })).toMatchObject({ eligible: false, reason: "not_approved_after_variant_review" });

    expect(selectSecondPassImageCandidate({
      product_id: "30017",
      match_status: "verified",
      direct_image_url: "https://files.manuscdn.com/session/aquaject.jpg",
      source_page_url: "https://supplier.example/aquaject",
      source_name: "Supplier",
      confidence: 1,
      rationale: "Mirror",
    })).toMatchObject({ eligible: false, reason: "derived_source_url_not_allowed" });
  });
});
