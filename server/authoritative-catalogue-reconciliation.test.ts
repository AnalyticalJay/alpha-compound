import { describe, expect, it } from "vitest";
import { matchRetailPrices } from "../shared/retailPriceImport";

describe("authoritative catalogue reconciliation", () => {
  it("uses the user-confirmed Retail row to produce a single safe Clenbuterol match", () => {
    const result = matchRetailPrices(
      [{ sourceTab: "HD", productName: "CLENBUTEROL", retailPrice: "350.00", sourceRow: 33 }],
      [{ id: 30018, name: "CLENBUTEROL", categoryName: "INJECTABLES" }],
    );
    expect(result.conflictingPrices).toEqual([]);
    expect(result.matches[0]?.row.retailPrice).toBe("350.00");
  });

  it("surfaces source rows with no current catalogue record for controlled creation", () => {
    const result = matchRetailPrices(
      [{ sourceTab: "PHARMA", productName: "NEUROBIAN", retailPrice: "630.00", sourceRow: 23 }],
      [],
    );
    expect(result.unmatchedRows[0]?.productName).toBe("NEUROBIAN");
  });
});
