import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

describe("public crawl controls and metadata", () => {
  it("serves factual robots and active catalogue sitemap endpoints before the SPA fallback", () => {
    const seoRoutes = fs.readFileSync(path.join(root, "server", "seoRoutes.ts"), "utf8");
    const server = fs.readFileSync(path.join(root, "server", "_core", "index.ts"), "utf8");
    expect(seoRoutes).toContain('app.get("/robots.txt"');
    expect(seoRoutes).toContain('app.get("/sitemap.xml"');
    expect(seoRoutes).toContain("getProducts({ activeOnly: true })");
    expect(seoRoutes).toContain("Disallow: /admin/");
    expect(server.indexOf("registerSeoRoutes(app)")).toBeLessThan(server.indexOf('app.use(\n    "/api/trpc"'));
  });

  it("provides canonical, robots, and social metadata for indexable public routes", () => {
    const template = fs.readFileSync(path.join(root, "client", "index.html"), "utf8");
    const metadata = fs.readFileSync(path.join(root, "client", "src", "components", "SeoMeta.tsx"), "utf8");
    expect(template).toContain('rel="canonical"');
    expect(template).toContain('property="og:title"');
    expect(metadata).toContain('setMeta("robots", isIndexable ? "index,follow" : "noindex,nofollow")');
    expect(metadata).toContain('const PUBLIC_ROUTES');
    expect(metadata).toContain("if (!isProduct)");
  });

  it("uses catalogue data for product detail titles, descriptions, and canonical URLs", () => {
    const productDetail = fs.readFileSync(path.join(root, "client", "src", "pages", "ProductDetail.tsx"), "utf8");
    expect(productDetail).toContain("document.title = `${product.name} | Anabolics Africa`");
    expect(productDetail).toContain('meta[name="description"]');
    expect(productDetail).toContain("https://anabolicsafrica.co.za/products/");
  });
});
