import { describe, expect, it } from "vitest";
import { buildPayFastCheckoutBridgePage } from "./payfastCheckoutBridge";

describe("PayFast checkout bridge", () => {
  it("renders a same-origin continuation form with escaped signed fields", () => {
    const html = buildPayFastCheckoutBridgePage({
      action: "https://www.payfast.co.za/eng/process",
      amount: "10.00",
      fields: {
        merchant_id: "merchant",
        signature: "signed-value",
        item_name: "Quote <test>",
      },
    });

    expect(html).toContain('method="POST" action="https://www.payfast.co.za/eng/process"');
    expect(html).toContain('name="signature" value="signed-value"');
    expect(html).toContain('value="Quote &lt;test&gt;"');
    expect(html).toContain("Continue to secure payment");
    expect(html).not.toContain("<script");
  });
});
