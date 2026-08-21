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

  it("presents both catalogue brands and all four main compound types in the hero panel", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain("HD Labs <span className=\"text-[#64748B]\">+</span> BP Pharma");
    expect(home).toContain("Controlled Access Catalogue");
    expect(home).toContain('{ icon: Syringe, label: "Injectables"');
    expect(home).toContain('{ icon: Pill, label: "Orals"');
    expect(home).toContain('{ icon: Dna, label: "Peptides"');
    expect(home).toContain('{ icon: FlaskConical, label: "SARMS"');
  });

  it("uses a premium borderless member-benefit list without the removed supplier and grade blocks", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain("const HOME_FEATURE_SPECS");
    expect(home).toContain('title: "Gated Access"');
    expect(home).toContain('title: "Secure Payments"');
    expect(home).toContain('title: "Discreet Delivery"');
    expect(home).toContain('title: "100+ Products"');
    expect(home).not.toContain('title: "Pharmaceutical Grade"');
    expect(home).not.toContain('title: "HD Labs Exclusive"');
    expect(home).toContain("ShieldCheck");
    expect(home).toContain("WalletCards");
    expect(home).toContain("grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-16 md:gap-y-10");
    expect(home).toContain("relative flex gap-5 py-1 sm:gap-6");
  });

  it("uses controlled-access language and a borderless delivery-information section", () => {
    const home = source("client/src/pages/Home.tsx");
    const footer = source("client/src/components/Footer.tsx");
    const hdLabsMark = source("client/src/components/HdLabsMark.tsx");
    expect(home).toContain("transparent quoting, and delivery updates");
    expect(home).toContain('data-testid="delivery-info"');
    expect(home).toContain("Delivery Made");
    expect(home).toContain("Free Delivery");
    expect(home).toContain("R150 Flat Rate");
    expect(home).toContain("MapPin");
    expect(home).toContain("Send");
    expect(home).not.toContain("rounded-lg border border-[#0EA5E9]/20");
    expect(home).not.toMatch(/pharmaceutical/gi);
    expect(footer).not.toMatch(/pharmaceutical/gi);
    expect(hdLabsMark).not.toMatch(/pharmaceutical/gi);
  });

  it("gives each category a dedicated visual banner and keeps decorative images hidden from assistive text", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain("category-injectables-banner_e7d7a02b.png");
    expect(home).toContain("category-orals-banner_c7f566bb.png");
    expect(home).toContain("category-fat-loss-banner_2fb21b2d.png");
    expect(home).toContain("category-sarms-banner_a5d9ec70.png");
    expect(home).toContain("category-peptides-banner_f6cd86ab.png");
    expect(home).toContain("category-amps-banner_336c952f.png");
    expect(home).toContain("category-post-cycle-banner_714b4c58.png");
    expect(home).toContain("category-ancillaries-banner_a0d6f7cf.png");
    expect(home).toContain('alt="" aria-hidden="true"');
  });

  it("uses real image-backed products only when a category has an eligible recommendation", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain("imageBackedProducts");
    expect(home).toContain("selectCategoryPromotion(category?.id, category?.promotedProductId, imageBackedProducts)");
    expect(home).toContain("featuredProduct.primaryImage");
    expect(home).toContain("Browse this category while verified product imagery is being added.");
  });

  it("hydrates the catalog category filter from the category query parameter", () => {
    const products = source("client/src/pages/Products.tsx");
    expect(products).toContain("useLocation");
    expect(products).toContain('new URLSearchParams(window.location.search).get("category")');
    expect(products).toContain("setSelectedCategory(getCategoryFromUrl())");
  });
});
