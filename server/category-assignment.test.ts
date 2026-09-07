import { describe, expect, it } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { categories, products } from "../drizzle/schema";

const expectedCategoryByProductId = {
  30011: "PEPTIDES",
  30012: "PEPTIDES",
  30014: "PEPTIDES",
  30015: "PEPTIDES",
  30018: "FAT LOSS",
  30023: "FAT LOSS",
  30039: "ORALS",
  30041: "POST CYCLE",
  30042: "PHARMA",
  30043: "ORALS",
  30045: "POST CYCLE",
  30046: "ORALS",
  30048: "POST CYCLE",
  30049: "ORALS",
  30051: "FAT LOSS",
  30052: "ORALS",
  30053: "ORALS",
  30054: "ORALS",
  30055: "ORALS",
  30057: "ORALS",
  30058: "PHARMA",
  30060: "ORALS",
  30061: "ORALS",
  30063: "SARMS",
  30064: "SARMS",
  30065: "SARMS",
  30066: "SARMS",
  30067: "SARMS",
  30068: "SARMS",
  30069: "SARMS",
} as const;

describe("catalogue category assignments", () => {
  it("keeps highlighted products in their verified categories", async () => {
    const db = await getDb();
    const rows = await db
      .select({ id: products.id, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(inArray(products.id, [30039, 30063, 30064]));

    expect(Object.fromEntries(rows.map((row) => [row.id, row.categoryName]))).toEqual({
      30039: "ORALS",
      30063: "SARMS",
      30064: "SARMS",
    });
  });

  it("keeps only explicit HD Labs AMP names in the AMPS category", async () => {
    const db = await getDb();
    const rows = await db
      .select({ id: products.id, name: products.name, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.brand, "hd_labs"));

    const hdAmpRows = rows.filter((row) => row.categoryName === "AMPS");
    expect(hdAmpRows.length).toBeGreaterThan(0);
    expect(hdAmpRows.every((row) => /amp/i.test(row.name))).toBe(true);
    expect(rows.find((row) => row.id === 30009)?.categoryName).toBe("INJECTABLES");
    expect(rows.find((row) => row.id === 30017)?.categoryName).toBe("INJECTABLES");
    expect(rows.find((row) => row.id === 30033)?.categoryName).toBe("INJECTABLES");
  });

  it("matches every audited high-confidence correction", async () => {
    const db = await getDb();
    const ids = Object.keys(expectedCategoryByProductId).map(Number);
    const rows = await db
      .select({ id: products.id, categoryName: categories.name })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(inArray(products.id, ids));

    const actual = Object.fromEntries(rows.map((row) => [row.id, row.categoryName]));
    expect(Object.keys(actual)).toHaveLength(ids.length);
    for (const [id, expected] of Object.entries(expectedCategoryByProductId)) {
      expect(actual[id]).toBe(expected);
    }
  });
});
