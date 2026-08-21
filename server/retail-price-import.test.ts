import { describe, expect, it } from "vitest";
import { matchRetailPrices, normalizePriceName, parseRetailPrice } from "../shared/retailPriceImport";

describe("retail price import helpers", () => {
  it("parses only valid positive Retail Price values", () => {
    expect(parseRetailPrice(" 2,200.00 ")).toBe("2200.00");
    expect(parseRetailPrice("0")).toBeNull();
    expect(parseRetailPrice("RETAIL")).toBeNull();
  });

  it("normalizes formats and keeps HD, BP, and Pharma cohorts distinct", () => {
    expect(normalizePriceName('HD TESTOVIRON 250mg 1ml AMP')).toBe("TESTOVIRON250MG1MLAMPOULE");
    const result = matchRetailPrices(
      [
        { sourceTab: "HD", productName: "HD TESTOVIRON 250mg 1ml AMP", retailPrice: "55.00", sourceRow: 5 },
        { sourceTab: "BP", productName: "BP OSTARINE 10", retailPrice: "350.00", sourceRow: 9 },
      ],
      [
        { id: 30006, name: "TESTOVIRON 250mg 1ml AMP", categoryName: "AMPS" },
        { id: 60018, name: "BP Ostarine 10mg", categoryName: "SARMS" },
        { id: 30018, name: "Ostarine 10mg", categoryName: "SARMS" },
        { id: 30104, name: "HD ZMA 90 caps", categoryName: "ANCILLARIES" },
      ],
    );
    expect(result.matches.map((match) => match.product.id)).toEqual([30006, 60018]);
    expect(result.unmatchedRows).toEqual([]);
  });

  it("keeps later-added HD products out of the Pharma cohort", () => {
    const result = matchRetailPrices(
      [{ sourceTab: "HD", productName: "HD ZMA 90 caps", retailPrice: "200.00", sourceRow: 4 }],
      [{ id: 30104, name: "HD ZMA 90 caps", categoryName: "ANCILLARIES" }],
    );
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]?.product.id).toBe(30104);
  });

  it("excludes a product when different source rows provide conflicting Retail Prices", () => {
    const result = matchRetailPrices(
      [
        { sourceTab: "HD", productName: "CLENBUTEROL", retailPrice: "350.00", sourceRow: 33 },
        { sourceTab: "HD", productName: "CLENBUTEROL", retailPrice: "250.00", sourceRow: 58 },
      ],
      [{ id: 30018, name: "CLENBUTEROL", categoryName: "INJECTABLES" }],
    );
    expect(result.matches).toEqual([]);
    expect(result.conflictingPrices).toHaveLength(1);
    expect(result.conflictingPrices[0]?.matches.map((match) => match.row.retailPrice)).toEqual(["350.00", "250.00"]);
  });
});
