import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const readSource = (path: string) => readFileSync(new URL(path, new URL("../", import.meta.url)), "utf8");
const router = readSource("server/routers.ts");
const db = readSource("server/db.ts");

describe("PHARMA public visibility", () => {
  it("excludes PHARMA from public category and product-list routes", () => {
    expect(router).toContain('getCategories({ excludeNames: ["PHARMA"] })');
    expect(router).toContain('excludeCategoryNames: ["PHARMA"]');
    expect(db).toContain("excludeCategoryNames?: string[]");
    expect(db).toContain("excluded.has((row.categoryName ?? \"\").trim().toLowerCase())");
  });

  it("hides PHARMA product details publicly while retaining admin list access", () => {
    expect(router).toContain('product.category?.name?.trim().toLowerCase() === "pharma"');
    expect(router).toContain("listAll: adminProcedure");
    expect(router).toContain("listAdmin: adminProcedure");
  });
});
