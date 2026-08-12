import { describe, expect, it } from "vitest";

import {
  getHdSourceAssetId,
  getHdSourceImageUrl,
  getHdSourceProductSlug,
  matchHdSourceToProduct,
  normalizeHdSourceName,
} from "../shared/hdImageImport";

describe("HD Labs source image matching", () => {
  const products = [
    { id: 30003, name: "HD SUS 250mg 1ml AMP", slug: "hd-sus-250mg-1ml-amp" },
    { id: 30002, name: "HD DECA DURABOLIN 100mg 1ml AMP", slug: "hd-deca-durabolin-100mg-1ml-amp" },
    { id: 30046, name: "DHEA25 (SUPER-DHEA)", slug: "dhea25-super-dhea" },
  ];

  it("normalizes source labels without losing the compound identity", () => {
    expect(normalizeHdSourceName("DHEA 25mg")).toBe("dhea");
    expect(normalizeHdSourceName("Testoviron 250")).toBe("testoviron 250");
  });

  it("maps corrected Sustanon and Deca source assets to the verified asset IDs", () => {
    expect(getHdSourceAssetId("Sustanon 250", "https://example.test/cm8prhvxq000703l1gofx4x1z.png")).toBe(
      "cm8prkijv000003jpc0d6hik8",
    );
    expect(getHdSourceAssetId("Deca-Durabolin 100", "https://example.test/cm8prkijv000003jpc0d6hik8.png")).toBe(
      "cm8prhvxq000703l1gofx4x1z",
    );
    expect(getHdSourceImageUrl("Sustanon 250", "https://example.test/cm8prhvxq000703l1gofx4x1z.png")).toContain(
      "cm8prkijv000003jpc0d6hik8.png",
    );
  });

  it("uses explicit aliases rather than fuzzy cross-product matching", () => {
    expect(getHdSourceProductSlug("DHEA 25mg")).toBe("dhea25-super-dhea");
    expect(getHdSourceProductSlug("Winstrol (Stanozolol)")).toBe("winstrol10");
    expect(getHdSourceProductSlug("Anadrol50")).toBeNull();
  });

  it("returns a verified match only when the explicit target exists", () => {
    const result = matchHdSourceToProduct(
      { source: "injectables", sourceName: "Sustanon 250", imageUrl: "source" },
      products,
    );
    expect(result).toMatchObject({ status: "matched", product: { id: 30003 }, score: 100 });
  });

  it("keeps duplicate source labels in review instead of assigning both to one product", () => {
    const counts = new Map([["clenbuterol", 2]]);
    const result = matchHdSourceToProduct(
      { source: "orals", sourceName: "Clenbuterol", imageUrl: "source" },
      [{ id: 30018, name: "CLENBUTEROL", slug: "clenbuterol" }],
      counts,
    );
    expect(result.status).toBe("review");
  });
});
