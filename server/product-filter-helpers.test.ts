import { describe, expect, it } from "vitest";
import { getProductBrand, matchesBrand } from "../client/src/lib/productFilters";

describe("product brand filters", () => {
  it("prefers a persisted verified brand over inconsistent legacy product naming", () => {
    expect(getProductBrand({ name: "Aquaject 100", brand: "hd_labs" })).toBe("HD Labs");
    expect(getProductBrand({ name: "Anavar HD", brand: "other" })).toBe("Other");
  });

  it("detects HD Labs from a product name", () => {
    expect(getProductBrand({ name: "Testosterone Enanthate 250mg HD Labs" })).toBe("HD Labs");
  });

  it("detects BP Pharma from a product slug or description", () => {
    expect(getProductBrand({ slug: "bp-pharma-superdrol-10mg" })).toBe("BP Pharma");
    expect(getProductBrand({ description: "BP Pharma oral steroid" })).toBe("BP Pharma");
  });

  it("matches all products when no brand is selected", () => {
    expect(matchesBrand({ name: "Unlabelled compound" }, "all")).toBe(true);
  });

  it("recognizes explicit HD product naming but ignores generic description wording", () => {
    expect(getProductBrand({ name: "HD ZMA 10mg Zinc" })).toBe("HD Labs");
    expect(getProductBrand({ name: "Unlabelled compound", description: "High definition presentation" })).toBe("Other");
  });

  it("filters products to the selected brand", () => {
    expect(matchesBrand({ name: "HD Labs product" }, "HD Labs")).toBe(true);
    expect(matchesBrand({ name: "BP Pharma product" }, "HD Labs")).toBe(false);
  });
});
