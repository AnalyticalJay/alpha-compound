import { describe, expect, it } from "vitest";
import {
  getExternalBpImageReviewReason,
  selectUniqueExternalBpImageCandidates,
  type ExternalBpImageCandidate,
} from "../shared/bpExternalImageCandidates";

const exactCandidate: ExternalBpImageCandidate = {
  productId: 60071,
  productName: "BP Accutane 10mg",
  sourcePageUrl: "https://example.test/products/bp-accutane-10",
  directImageUrl: "https://example.test/images/bp-accutane-10.png",
  verifiedMatch: true,
  confidence: "high",
};

describe("external BP Pharma image candidate safeguards", () => {
  it("accepts an exact, secure, product-specific candidate", () => {
    expect(getExternalBpImageReviewReason(exactCandidate)).toBeNull();
    expect(selectUniqueExternalBpImageCandidates([exactCandidate])[0]).toMatchObject({ eligible: true, reason: null });
  });

  it("holds known dosage-form conflicts for manual review", () => {
    const result = getExternalBpImageReviewReason({
      ...exactCandidate,
      productId: 60056,
      productName: "BP Cy Combo Inj",
    });
    expect(result).toContain("injectable");
  });

  it("rejects a shared image URL rather than assigning it to multiple products", () => {
    const candidates = selectUniqueExternalBpImageCandidates([
      exactCandidate,
      { ...exactCandidate, productId: 60075, productName: "BP Viagra 100mg" },
    ]);
    expect(candidates.every((result) => !result.eligible)).toBe(true);
    expect(candidates[0]?.reason).toContain("multiple products");
  });
});
