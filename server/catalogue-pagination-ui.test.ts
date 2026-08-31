import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const productsPage = readFileSync(resolve(process.cwd(), "client/src/pages/Products.tsx"), "utf8");

describe("catalogue progressive loading UI", () => {
  it("uses visible items in the grid and resets the page when filters or sorting change", () => {
    expect(productsPage).toContain("visibleProducts.map");
    expect(productsPage).toContain("setVisibleCount(CATALOGUE_PAGE_SIZE)");
    expect(productsPage).toContain("[search, selectedCategory, selectedBrand, selectedSort]");
  });

  it("exposes an accessible Load more control with a live visible-product count", () => {
    expect(productsPage).toContain("aria-live=\"polite\"");
    expect(productsPage).toContain("Load {Math.min(CATALOGUE_PAGE_SIZE, remainingProductCount)} more products");
    expect(productsPage).toContain("getNextCatalogueVisibleCount(filteredProducts.length, count)");
  });
});
