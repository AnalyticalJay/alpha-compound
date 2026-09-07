import { describe, expect, it } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { productImages, products } from "../drizzle/schema";

describe("named uploaded product images", () => {
  it("keeps EQUIJECT 200 and HD BPC-157 on primary uploaded storage images", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable for named product image regression");
    const rows = await db
      .select({
        productId: products.id,
        productName: products.name,
        imageUrl: productImages.imageUrl,
        imageKey: productImages.imageKey,
        isPrimary: productImages.isPrimary,
      })
      .from(products)
      .innerJoin(productImages, eq(productImages.productId, products.id))
      .where(inArray(products.id, [30006, 30021]));

    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.isPrimary).toBe(true);
      expect(row.imageUrl).toMatch(/^\/manus-storage\/products\/(30006|30021)\/.+/);
      expect(row.imageKey).toMatch(/^products\/(30006|30021)\/.+/);
    }
  });
});
