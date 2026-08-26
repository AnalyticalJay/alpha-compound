import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { assertTrustedPayFastOrigin, buildPayFastFormConfig, createPayFastSignature, verifyPayFastSignature } from "./payfast";

describe("PayFast runtime configuration", () => {
  it("builds the real payment form from managed server credentials without exposing the passphrase", () => {
    const config = buildPayFastFormConfig({
      origin: "https://anabolicsafrica.co.za/",
      orderId: 42,
      payfastReference: "AA-42-123",
      total: "450.00",
      email: "buyer@example.com",
      fullName: "Buyer Example",
    });

    expect(config.action).toBe("https://www.payfast.co.za/eng/process");
    expect(config.fields.merchant_id).toBe(process.env.PAYFAST_MERCHANT_ID);
    expect(config.fields.merchant_key).toBe(process.env.PAYFAST_MERCHANT_KEY);
    expect(config.fields.notify_url).toBe("https://anabolicsafrica.co.za/api/payfast/itn");
    expect(config.fields.amount).toBe("450.00");
    expect(config.fields).not.toHaveProperty("passphrase");
    expect(config.fields.signature).toBe(createPayFastSignature(config.fields));
    expect(Object.keys(config.fields)).toEqual([
      "merchant_id",
      "merchant_key",
      "return_url",
      "cancel_url",
      "notify_url",
      "name_first",
      "name_last",
      "email_address",
      "m_payment_id",
      "amount",
      "item_name",
      "signature",
    ]);

    const instantEftConfig = buildPayFastFormConfig({
      origin: "https://anabolicsafrica.co.za/",
      orderId: 43,
      payfastReference: "AA-43-124",
      total: "450.00",
      email: "buyer@example.com",
      fullName: "Buyer Example",
      paymentMethod: "ef",
    });
    expect(instantEftConfig.fields.payment_method).toBe("ef");
    expect(Object.keys(instantEftConfig.fields).at(-2)).toBe("payment_method");
    expect(Object.keys(instantEftConfig.fields).at(-1)).toBe("signature");
  });

  it("wires OrderDetail to the runtime server configuration path", () => {
    const source = readFileSync(new URL("../client/src/pages/OrderDetail.tsx", import.meta.url), "utf8");
    expect(source).toContain("trpc.orders.payfastForm.useMutation");
    expect(source).toContain("window.location.origin");
    expect(source).toContain("window.location.assign(payment.checkoutUrl)");
    expect(source).not.toContain("VITE_PAYFAST_MERCHANT_ID");
    expect(source).not.toContain("10000100");
    expect(source).not.toContain("46f0cd694581a");
  });

  it("creates and verifies the signature used by the ITN route", () => {
    const payload = {
      amount_gross: "450.00",
      m_payment_id: "AA-42-123",
      payment_status: "COMPLETE",
    };
    const signedPayload = { ...payload, signature: createPayFastSignature(payload) };

    expect(verifyPayFastSignature(signedPayload)).toBe(true);
    expect(verifyPayFastSignature({ ...signedPayload, amount_gross: "451.00" })).toBe(false);
  });

  it("uses documented form ordering and form-style encoding rather than API-style alphabetic ordering", () => {
    const documentedOrder = {
      merchant_id: "10000100",
      merchant_key: "key",
      item_name: "Test item & delivery",
      return_url: "https://example.test/paid order",
    };
    const reorderedFields = {
      item_name: "Test item & delivery",
      merchant_id: "10000100",
      merchant_key: "key",
      return_url: "https://example.test/paid order",
    };

    expect(createPayFastSignature(documentedOrder, "pass phrase")).not.toBe(
      createPayFastSignature(reorderedFields, "pass phrase"),
    );
  });

  it("permits only configured public origins for a production checkout form", () => {
    expect(assertTrustedPayFastOrigin("https://anabolicsafrica.co.za/checkout")).toBe("https://anabolicsafrica.co.za");
    expect(() => assertTrustedPayFastOrigin("https://attacker.example/checkout")).toThrow("Untrusted checkout origin");
  });
});
