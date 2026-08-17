import { describe, expect, it } from "vitest";
import { matchBodyPharmSupplierProducts, normalizeBodyPharmMatchKey } from "../shared/bodyPharmSupplierMatching";

const supplier = (title: string, slug: string) => ({
  title,
  slug,
  productPageUrl: `https://supplier.example/${slug}`,
  imageUrl: `https://supplier.example/${slug}.png`,
});

describe("Body Pharm supplier matching", () => {
  it("normalizes verified supplier naming aliases before matching", () => {
    expect(normalizeBodyPharmMatchKey("Anapolon 25", "supplier")).toBe("anapolin25");
    expect(normalizeBodyPharmMatchKey("BP Anapolin 25mg", "catalogue")).toBe("anapolin25");
    expect(normalizeBodyPharmMatchKey("Aqua TNE 100", "supplier")).toBe("aqtest100");
    expect(normalizeBodyPharmMatchKey("BP AQ Test 100mg", "catalogue")).toBe("aqtest100");
    expect(normalizeBodyPharmMatchKey("Somatropin 40 (Pen)", "supplier")).toBe("somatropin40");
    expect(normalizeBodyPharmMatchKey("BP Somatropin 40IU HGH", "catalogue")).toBe("somatropin40");
    expect(normalizeBodyPharmMatchKey("CB 250", "supplier")).toBe("chequedrops250");
    expect(normalizeBodyPharmMatchKey("BP Cheque Drops 250mcg", "catalogue")).toBe("chequedrops250");
  });

  it("matches only a single verified BP catalogue product and leaves non-matches for review", () => {
    const result = matchBodyPharmSupplierProducts(
      [supplier("Aqua TNE 100", "aqua-tne-100"), supplier("CB 250", "cb-250"), supplier("Methyltest 10", "methyltest-10")],
      [
        { id: 1, name: "BP AQ Test 100mg", slug: "bp-aq-test-100mg" },
        { id: 2, name: "BP Cheque Drops 250mcg", slug: "bp-cheque-drops-250mcg" },
        { id: 3, name: "BP Methyltest 10mg", slug: "bp-methyltest-10mg" },
      ],
    );

    expect(result[0].candidates).toEqual([{ id: 1, name: "BP AQ Test 100mg", slug: "bp-aq-test-100mg" }]);
    expect(result[1].candidates).toEqual([{ id: 2, name: "BP Cheque Drops 250mcg", slug: "bp-cheque-drops-250mcg" }]);
    expect(result[2].candidates).toEqual([{ id: 3, name: "BP Methyltest 10mg", slug: "bp-methyltest-10mg" }]);
  });
});
