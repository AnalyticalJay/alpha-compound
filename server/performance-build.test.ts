import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

describe("public route performance boundaries", () => {
  it("lazy-loads route screens so public entries do not eagerly load administration tooling", () => {
    const app = fs.readFileSync(path.join(root, "client", "src", "App.tsx"), "utf8");
    expect(app).toContain('import { lazy, Suspense } from "react"');
    expect(app).toContain('const Home = lazy(() => import("./pages/Home"))');
    expect(app).toContain('const AdminBulkImport = lazy(() => import("./pages/admin/AdminBulkImport"))');
    expect(app).toContain("<Suspense fallback=");
  });

  it("caches immutable static assets while revalidating the SPA document", () => {
    const staticServer = fs.readFileSync(path.join(root, "server", "_core", "vite.ts"), "utf8");
    expect(staticServer).toContain('maxAge: "1y"');
    expect(staticServer).toContain("immutable: true");
    expect(staticServer).toContain('res.setHeader("Cache-Control", "no-cache")');
  });
});
