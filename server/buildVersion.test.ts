import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getBuildVersion } from "./buildVersion";

describe("build version recovery", () => {
  it("returns a stable short fingerprint for the current build entrypoint", async () => {
    const first = await getBuildVersion();
    const second = await getBuildVersion();

    expect(first).toMatch(/^[a-f0-9]{16}$/);
    expect(second).toBe(first);
  });

  it("keeps the client prompt non-destructive and user-controlled", async () => {
    const source = await fs.readFile(path.resolve(process.cwd(), "client/src/components/StaleBuildPrompt.tsx"), "utf8");

    expect(source).toContain("setInterval");
    expect(source).toContain("window.location.reload()");
    expect(source).toContain("Not now");
    expect(source).toContain("sessionStorage");
    expect(source).toContain("onImageError");
    expect(source).toContain("/manus-storage/");
    expect(source).not.toContain("setTimeout(() => window.location.reload()");
  });
});
