import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { categoryKeyFromBpHeading, normalizeBpProduct } from "../shared/bpProductImport";

describe("BP Pharma workbook normalization", () => {
  it("maps supplied workbook headings to live catalogue categories", () => {
    expect(categoryKeyFromBpHeading("ORAL STEROIDS:")).toBe("ORALS");
    expect(categoryKeyFromBpHeading("INJECTABLE STEROIDS:")).toBe("INJECTABLES");
    expect(categoryKeyFromBpHeading("ANTI-ESTROGENS AND POST CYCLE THERAPY:")).toBe("POST CYCLE");
    expect(categoryKeyFromBpHeading("PEPTIDES PENS:")).toBe("PEPTIDES");
  });

  it("applies the requested Anapolan correction and trailing MG strength", () => {
    expect(normalizeBpProduct("BP ANAPOLAN 25", "ORALS")).toMatchObject({
      name: "BP Anapolin 25mg",
      dosageInfo: "25mg",
      categoryKey: "ORALS",
    });
  });

  it("normalizes compact injectables and explicit IU strengths", () => {
    expect(normalizeBpProduct("BP TEST E300", "INJECTABLES")).toMatchObject({
      name: "BP Test E 300mg",
      dosageInfo: "300mg",
    });
    expect(normalizeBpProduct("BP SOMATROPIN 100IU HGH", "PEPTIDES")).toMatchObject({
      name: "BP Somatropin 100IU HGH",
      dosageInfo: "100IU",
    });
  });

  it("keeps source strength notes out of display names while retaining the source row for review", () => {
    expect(normalizeBpProduct("BP BPC 157 10MG (5mg discontinued)", "PEPTIDES")).toMatchObject({
      name: "BP BPC 157 10mg",
      dosageInfo: "10mg",
    });
  });

  it("does not invent dosage when the workbook supplies no strength", () => {
    expect(normalizeBpProduct("BP CY COMBO INJ", "FAT LOSS")).toMatchObject({
      name: "BP Cy Combo Inj",
      reviewReason: "missing_strength",
    });
  });

  it("does not present unconfigured zero-price products as free", () => {
    const source = readFileSync(new URL("../client/src/components/ProductCard.tsx", import.meta.url), "utf8");
    expect(source).toContain("const hasConfiguredPrice");
    expect(source).toContain('"Price pending"');
  });
});
