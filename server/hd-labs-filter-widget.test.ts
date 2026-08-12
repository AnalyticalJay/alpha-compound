import { describe, expect, it } from "vitest";
import { matchesBrand } from "../client/src/lib/productFilters";

describe("dedicated HD Labs filter behavior", () => {
  it("filters out non-HD Labs brands when HD Labs is selected", () => {
    const hdProduct = { name: "Testosterone Enanthate 250mg — HD Labs" };
    const bpProduct = { name: "BP Pharma Superdrol 10mg" };

    expect(matchesBrand(hdProduct, "HD Labs")).toBe(true);
    expect(matchesBrand(bpProduct, "HD Labs")).toBe(false);
  });

  it("resets back to all brands when toggled off", () => {
    const bpProduct = { name: "BP Pharma Superdrol 10mg" };
    expect(matchesBrand(bpProduct, "all")).toBe(true);
  });
});
