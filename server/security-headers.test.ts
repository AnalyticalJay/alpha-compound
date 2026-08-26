import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const serverSource = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");

describe("production security headers", () => {
  it("permits only the verified PayFast processing and hosted-payment domains for payment form navigation", () => {
    expect(serverSource).toContain("form-action 'self' https://www.payfast.co.za https://payment.payfast.io");
    expect(serverSource).not.toContain("form-action *");
  });
});
