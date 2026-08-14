import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { selectCategoryPromotion } from "../shared/categoryPromotion";

const product = (id: number, categoryId: number, primaryImage: string | null, isFeatured = false) => ({ id, categoryId, primaryImage, isFeatured });

describe("category promotion selection", () => {
  const products = [
    product(1, 10, "/product-a.webp", false),
    product(2, 10, "/product-b.webp", true),
    product(3, 11, "/product-c.webp", true),
    product(4, 10, null, true),
  ];

  it("uses the administrator's valid image-backed product selection before automatic fallback", () => {
    expect(selectCategoryPromotion(10, 1, products)?.id).toBe(1);
  });

  it("rejects cross-category or image-less manual choices by safely using the best eligible fallback", () => {
    expect(selectCategoryPromotion(10, 3, products)?.id).toBe(2);
    expect(selectCategoryPromotion(10, 4, products)?.id).toBe(2);
  });

  it("returns no recommendation when a category has no eligible product imagery", () => {
    expect(selectCategoryPromotion(99, null, products)).toBeUndefined();
  });

  it("enforces category ownership and primary-image validation in the protected promotion path", () => {
    const db = readFileSync(resolve(import.meta.dirname, "db.ts"), "utf8");
    const router = readFileSync(resolve(import.meta.dirname, "routers.ts"), "utf8");
    const admin = readFileSync(resolve(import.meta.dirname, "../client/src/pages/admin/AdminCategories.tsx"), "utf8");
    expect(db).toContain("Select an active product from this category with a primary image");
    expect(db).toContain("eq(products.categoryId, categoryId)");
    expect(db).toContain("eq(productImages.isPrimary, true)");
    expect(router).toContain("setPromotedProduct: adminProcedure");
    expect(admin).toContain("Home category promotion");
    expect(admin).toContain("Automatic image-backed selection");
  });
});
