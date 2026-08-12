import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Products catalog dedicated HD Labs quick filter", () => {
  const productsCode = readFileSync(
    resolve(import.meta.dirname, "../client/src/pages/Products.tsx"),
    "utf8"
  );

  it("contains the dedicated HD Labs filter button and active styling", () => {
    expect(productsCode).toContain("Filter HD Labs");
    expect(productsCode).toContain("Showing HD Labs Only");
    expect(productsCode).toContain("setSelectedBrand");
    expect(productsCode).toContain("selectedBrand === \"HD Labs\"");
  });

  it("preserves search, category, clear-filters, and mobile drawer support", () => {
    expect(productsCode).toContain("product-search");
    expect(productsCode).toContain("selectedCategory");
    expect(productsCode).toContain("clearFilters");
    expect(productsCode).toContain("mobileFiltersOpen");
  });
});
