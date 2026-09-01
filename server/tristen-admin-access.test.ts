import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("administrator account navigation", () => {
  it("keeps the shared user menu links for both My Account and Admin Panel", () => {
    const navbar = readFileSync(resolve(process.cwd(), "client/src/components/Navbar.tsx"), "utf8");
    expect(navbar).toContain('href="/account"');
    expect(navbar).toContain('href="/admin"');
    expect(navbar).toContain("isAdmin &&");
  });
});
