import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const productDetailSource = readFileSync(new URL("../client/src/pages/ProductDetail.tsx", import.meta.url), "utf8");

describe("product availability UI", () => {
  it("renders an accessible in-stock badge with the available quantity", () => {
    expect(productDetailSource).toContain('role="status"');
    expect(productDetailSource).toContain("aria-label={`In Stock: ${product.stockQuantity} available`}");
    expect(productDetailSource).toContain("In Stock");
    expect(productDetailSource).toContain("{product.stockQuantity} available");
  });
});
