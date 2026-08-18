import { describe, expect, it } from "vitest";
import { selectVerifiedCatalogueImageCandidates } from "../shared/catalogueImageCandidateSelection";

describe("selectVerifiedCatalogueImageCandidates", () => {
  it("accepts unique verified HTTPS sources and rejects unresolved records", () => {
    const decisions = selectVerifiedCatalogueImageCandidates([
      { productId: 1, productName: "A", directImageUrl: "https://example.com/a.png", sourcePageUrl: "https://example.com/a", sourceName: "Supplier", matchStatus: "verified", reason: "exact" },
      { productId: 2, productName: "B", directImageUrl: null, sourcePageUrl: null, sourceName: "", matchStatus: "unresolved", reason: "missing" },
    ]);

    expect(decisions.map((item) => item.eligible)).toEqual([true, false]);
    expect(decisions[1].reason).toBe("not_verified");
  });

  it("never reuses one source image for two product variants", () => {
    const decisions = selectVerifiedCatalogueImageCandidates([
      { productId: 1, productName: "Cialis 20mg", directImageUrl: "https://example.com/cialis.jpg", sourcePageUrl: "https://example.com/cialis", sourceName: "Supplier", matchStatus: "verified", reason: "exact" },
      { productId: 2, productName: "Cialis 5mg", directImageUrl: "https://example.com/cialis.jpg", sourcePageUrl: "https://example.com/cialis", sourceName: "Supplier", matchStatus: "verified", reason: "exact" },
    ]);

    expect(decisions[0].eligible).toBe(true);
    expect(decisions[1]).toMatchObject({ eligible: false, reason: "duplicate_image_source" });
  });
});
