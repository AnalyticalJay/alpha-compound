import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { matchesBrand } from "../client/src/lib/productFilters";

const productEditor = readFileSync(resolve(process.cwd(), "client/src/pages/admin/AdminProductEdit.tsx"), "utf8");

describe("catalogue verified-brand filters", () => {
  const products = [
    { id: 1, name: "Aquaject 100", brand: "hd_labs" as const },
    { id: 2, name: "BP Anapolin 25mg", brand: "bp_pharma" as const },
    { id: 3, name: "Pharmaceutical item", brand: "other" as const },
  ];

  it("keeps the complete active catalogue in the All products state", () => {
    expect(products.filter((product) => matchesBrand(product, "all"))).toHaveLength(3);
  });

  it("includes every persisted HD Labs product regardless of title wording", () => {
    expect(products.filter((product) => matchesBrand(product, "HD Labs"))).toEqual([products[0]]);
  });

  it("includes every persisted BP Pharma product regardless of title wording", () => {
    expect(products.filter((product) => matchesBrand(product, "BP Pharma"))).toEqual([products[1]]);
  });

  it("allows administrators to set an explicit brand on future product entries", () => {
    expect(productEditor).toContain('brand: "hd_labs" | "bp_pharma" | "other"');
    expect(productEditor).toContain('<SelectItem value="hd_labs">HD Labs</SelectItem>');
    expect(productEditor).toContain('<SelectItem value="bp_pharma">BP Pharma</SelectItem>');
  });
});
