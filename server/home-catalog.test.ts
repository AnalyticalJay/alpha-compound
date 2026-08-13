import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("home catalog products and categories", () => {
  it("requests only products with assigned primary images for the home page", () => {
    const home = source("client/src/pages/Home.tsx");
    const router = source("server/routers.ts");
    const db = source("server/db.ts");
    expect(home).toContain("featuredOnly: true, imageOnly: true");
    expect(home).toContain("{ imageOnly: true }");
    expect(home).toContain(".slice(0, 4)");
    expect(router).toContain("imageOnly: z.boolean().optional()");
    expect(db).toContain("opts?.imageOnly");
    expect(db).toContain("imageMap.has(row.id)");
  });

  it("renders live main categories and links each card into the catalog", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain("trpc.categories.list.useQuery()");
    expect(home).toContain('slug: "injectables"');
    expect(home).toContain('slug: "orals"');
    expect(home).toContain('slug: "fat-loss"');
    expect(home).toContain('slug: "sarms"');
    expect(home).toContain('slug: "peptides"');
    expect(home).toContain("/products?category=${category.id}");
  });

  it("hydrates the catalog category filter from the category query parameter", () => {
    const products = source("client/src/pages/Products.tsx");
    expect(products).toContain("useLocation");
    expect(products).toContain('new URLSearchParams(window.location.search).get("category")');
    expect(products).toContain("setSelectedCategory(getCategoryFromUrl())");
  });
});
