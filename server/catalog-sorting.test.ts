import { describe, expect, it } from "vitest";
import { sortCatalogProducts } from "../client/src/lib/catalogSorting";

describe("catalog sorting", () => {
  const products = [
    { name: "Popular middle", price: "200", salesCount: 12, isFeatured: false },
    { name: "Featured low", price: "100", salesCount: 2, isFeatured: true },
    { name: "No price", price: null, salesCount: 30, isFeatured: false },
  ];

  it("sorts priced products low to high and keeps missing prices last", () => {
    expect(sortCatalogProducts(products, "price-asc").map((product) => product.name)).toEqual([
      "Featured low",
      "Popular middle",
      "No price",
    ]);
  });

  it("sorts priced products high to low and keeps missing prices last", () => {
    expect(sortCatalogProducts(products, "price-desc").map((product) => product.name)).toEqual([
      "Popular middle",
      "Featured low",
      "No price",
    ]);
  });

  it("sorts by real sales quantity and uses featured/name as deterministic tie-breakers", () => {
    expect(sortCatalogProducts(products, "popularity").map((product) => product.name)).toEqual([
      "No price",
      "Popular middle",
      "Featured low",
    ]);
  });
});
