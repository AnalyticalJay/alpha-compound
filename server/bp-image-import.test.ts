import { describe, expect, it } from "vitest";
import { BP_IMAGE_ASSIGNMENTS, validateBpImageAssignments } from "../shared/bpImageImport";

describe("BP Pharma image assignments", () => {
  it("maps every supplied Body Pharm attachment to one distinct normalized BP product slug", () => {
    expect(BP_IMAGE_ASSIGNMENTS).toHaveLength(9);
    expect(BP_IMAGE_ASSIGNMENTS).toContainEqual({ fileName: "AOD960410BP.jpeg", productSlug: "bp-aod9604-10mg" });
    expect(BP_IMAGE_ASSIGNMENTS).toContainEqual({ fileName: "BPC15710BP.jpeg", productSlug: "bp-bpc-157-10mg" });
    expect(BP_IMAGE_ASSIGNMENTS).toContainEqual({ fileName: "TB500BPPHARMA.jpeg", productSlug: "bp-tb500-10mg" });
    expect(BP_IMAGE_ASSIGNMENTS).toContainEqual({ fileName: "TESAMORELIN10BP.jpeg", productSlug: "bp-tesamorelin-10mg" });
  });

  it("rejects duplicate file or product assignments before storage upload", () => {
    expect(validateBpImageAssignments(BP_IMAGE_ASSIGNMENTS)).toEqual({ duplicateFiles: [], duplicateProducts: [] });
    expect(validateBpImageAssignments([
      { fileName: "first.jpeg", productSlug: "bp-first" },
      { fileName: "first.jpeg", productSlug: "bp-second" },
      { fileName: "third.jpeg", productSlug: "bp-second" },
    ])).toMatchObject({
      duplicateFiles: [{ fileName: "first.jpeg", productSlug: "bp-second" }],
      duplicateProducts: [{ fileName: "third.jpeg", productSlug: "bp-second" }],
    });
  });
});
