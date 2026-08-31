import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const readSource = (path: string) => readFileSync(new URL(path, root), "utf8");

const productImage = readSource("client/src/components/ProductImage.tsx");
const productCard = readSource("client/src/components/ProductCard.tsx");
const productDetail = readSource("client/src/pages/ProductDetail.tsx");
const cart = readSource("client/src/pages/Cart.tsx");
const home = readSource("client/src/pages/Home.tsx");
const adminProducts = readSource("client/src/pages/admin/AdminProducts.tsx");
const adminProductEdit = readSource("client/src/pages/admin/AdminProductEdit.tsx");

describe("product image watermark", () => {
  it("renders a faint, non-interactive configurable watermark over an unmodified source image", () => {
    expect(productImage).toContain("useWatermark");
    expect(productImage).toContain("watermarkText");
    expect(productImage).toContain('data-product-watermark="anabolics-africa"');
    expect(productImage).toContain('aria-hidden="true"');
    expect(productImage).toContain("pointer-events-none");
    expect(productImage).toContain("text-white/35");
    expect(productImage).toContain("object-cover");
    expect(productImage).toContain('loading={loading ?? "lazy"}');
    expect(productImage).toContain('decoding={decoding ?? "async"}');
  });

  it("uses the shared treatment for every current customer and administrator product image display", () => {
    [productCard, productDetail, cart, home, adminProducts, adminProductEdit].forEach((source) => {
      expect(source).toContain("ProductImage");
    });
  });
});
