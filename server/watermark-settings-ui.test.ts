import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const readSource = (path: string) => readFileSync(new URL(path, root), "utf8");

const productImage = readSource("client/src/components/ProductImage.tsx");
const dashboard = readSource("client/src/pages/admin/AdminDashboard.tsx");
const settingsPage = readSource("client/src/pages/admin/AdminWatermark.tsx");
const app = readSource("client/src/App.tsx");

describe("watermark settings UI", () => {
  it("uses globally loaded settings to control text, custom logo, and enablement", () => {
    expect(productImage).toContain("useWatermark");
    expect(productImage).toContain("isEnabled &&");
    expect(productImage).toContain("logoUrl ?");
    expect(productImage).toContain("{watermarkText}");
    expect(app).toContain("WatermarkProvider");
  });

  it("exposes a dashboard toggle and a dedicated administrator configuration route", () => {
    expect(dashboard).toContain('aria-label="Enable product image watermark"');
    expect(dashboard).toContain('href="/admin/watermark"');
    expect(settingsPage).toContain('aria-label="Enable product image watermark across the site"');
    expect(settingsPage).toContain("uploadLogo");
    expect(settingsPage).toContain("removeLogo");
  });
});
