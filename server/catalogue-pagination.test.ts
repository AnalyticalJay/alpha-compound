import { describe, expect, it } from "vitest";
import {
  CATALOGUE_PAGE_SIZE,
  getNextCatalogueVisibleCount,
  getVisibleCatalogueItems,
} from "../client/src/lib/cataloguePagination";

describe("catalogue pagination helpers", () => {
  const products = Array.from({ length: 230 }, (_, index) => `product-${index + 1}`);

  it("starts with a focused first set instead of rendering the entire catalogue", () => {
    expect(CATALOGUE_PAGE_SIZE).toBe(12);
    expect(getVisibleCatalogueItems(products, CATALOGUE_PAGE_SIZE)).toEqual(products.slice(0, 12));
  });

  it("reveals the next set without exceeding the filtered result count", () => {
    expect(getNextCatalogueVisibleCount(products.length, 12)).toBe(24);
    expect(getNextCatalogueVisibleCount(products.length, 228)).toBe(230);
    expect(getNextCatalogueVisibleCount(5, 12)).toBe(5);
  });

  it("handles an empty or reduced filtered result set safely", () => {
    expect(getVisibleCatalogueItems(products, 0)).toEqual([]);
    expect(getVisibleCatalogueItems(products.slice(0, 3), CATALOGUE_PAGE_SIZE)).toEqual(products.slice(0, 3));
  });
});
