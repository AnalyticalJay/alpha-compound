import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("persistent theme toggle", () => {
  it("enables switchable persisted themes at the application root", () => {
    const app = source("client/src/App.tsx");
    const context = source("client/src/contexts/ThemeContext.tsx");
    expect(app).toContain('<ThemeProvider defaultTheme="dark" switchable>');
    expect(context).toContain('localStorage.getItem("theme")');
    expect(context).toContain("root.dataset.theme = theme");
  });

  it("exposes accessible controls in storefront and administrator navigation", () => {
    const navbar = source("client/src/components/Navbar.tsx");
    const adminLayout = source("client/src/pages/admin/AdminLayout.tsx");
    const toggle = source("client/src/components/ThemeToggle.tsx");
    expect(navbar).toContain("<ThemeToggle />");
    expect(navbar).toContain("<ThemeToggle showLabel />");
    expect(adminLayout).toContain("<ThemeToggle />");
    expect(adminLayout).toContain("<ThemeToggle showLabel />");
    expect(toggle).toContain("Switch to ${nextTheme} mode");
    expect(toggle).toContain("aria-pressed");
  });

  it("defines a branded light-mode semantic token layer", () => {
    const css = source("client/src/index.css");
    expect(css).toContain(':root[data-theme="light"]');
    expect(css).toContain("--background:");
    expect(css).toContain("--sidebar:");
    expect(css).toContain(".theme-toggle");
  });
});
