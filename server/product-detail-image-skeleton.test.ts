import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const productDetail = readFileSync(new URL("client/src/pages/ProductDetail.tsx", root), "utf8");

describe("product detail image loading skeleton", () => {
  it("keeps a branded skeleton visible until the eager image settles", () => {
    expect(productDetail).toContain("isPrimaryImageLoaded");
    expect(productDetail).toContain('loading="eager"');
    expect(productDetail).toContain('fetchPriority="high"');
    expect(productDetail).toContain("onLoad={() => setIsPrimaryImageLoaded(true)}");
    expect(productDetail).toContain("onError={() => setIsPrimaryImageLoaded(true)}");
    expect(productDetail).toContain('data-product-image-skeleton="true"');
    expect(productDetail).toContain('isPrimaryImageLoaded ? "opacity-0" : "opacity-100"');
  });

  it("resets the skeleton when the selected gallery image changes", () => {
    expect(productDetail).toContain("setIsPrimaryImageLoaded(false)");
    expect(productDetail).toContain("[currentImage?.imageUrl]");
  });
});
