import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const orderDetailSource = readFileSync(new URL("../client/src/pages/OrderDetail.tsx", import.meta.url), "utf8");

describe("PayFast payment UI", () => {
  it("renders a secure payment badge beside the PayFast action", () => {
    expect(orderDetailSource).toContain("Secure PayFast checkout");
    expect(orderDetailSource).toContain("Encrypted payment handoff in ZAR");
    expect(orderDetailSource).toContain("aria-label=\"Secure PayFast payment\"");
    expect(orderDetailSource).toContain("ShieldCheck");
  });

  it("shows a loading handoff state and prevents duplicate payment submissions", () => {
    expect(orderDetailSource).toContain("isPayFastRedirecting");
    expect(orderDetailSource).toContain("Connecting to PayFast");
    expect(orderDetailSource).toContain("Connecting securely to PayFast");
    expect(orderDetailSource).toContain("role=\"status\" aria-live=\"polite\"");
    expect(orderDetailSource).toContain("disabled={paymentPending}");
    expect(orderDetailSource).toContain("window.setTimeout(() => form.submit(), 220)");
  });
});
