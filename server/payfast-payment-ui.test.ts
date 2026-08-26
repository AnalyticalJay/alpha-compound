import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const orderDetailSource = readFileSync(new URL("../client/src/pages/OrderDetail.tsx", import.meta.url), "utf8");
const accountSource = readFileSync(new URL("../client/src/pages/Account.tsx", import.meta.url), "utf8");

describe("PayFast payment UI", () => {
  it("renders a secure payment badge beside the PayFast action", () => {
    expect(orderDetailSource).toContain("Secure PayFast checkout");
    expect(orderDetailSource).toContain("Encrypted payment handoff in ZAR");
    expect(orderDetailSource).toContain("aria-label=\"Secure PayFast payment\"");
    expect(orderDetailSource).toContain("ShieldCheck");
  });

  it("shows a loading handoff state and prevents duplicate payment submissions", () => {
    expect(orderDetailSource).toContain("isPayFastRedirecting");
    expect(orderDetailSource).toContain("Preparing secure payment…");
    expect(orderDetailSource).toContain("Connecting securely to PayFast");
    expect(orderDetailSource).toContain("role=\"status\" aria-live=\"polite\"");
    expect(orderDetailSource).toContain("disabled={paymentPending}");
    expect(orderDetailSource).toContain("window.location.assign(payment.checkoutUrl)");
    expect(orderDetailSource).toContain("PayFast checkout could not be prepared. Please try again.");
    expect(orderDetailSource).toContain("form.requestSubmit()");
    expect(orderDetailSource).not.toContain("window.setTimeout(() => form.submit(), 220)");
  });

  it("keeps payment-ready actions visible and directs EFT selections to PayFast Instant EFT", () => {
    expect(orderDetailSource).toContain("Pay securely with PayFast");
    expect(orderDetailSource).toContain("Pay by Instant EFT");
    expect(orderDetailSource).toContain("PayFast Instant EFT");
    expect(orderDetailSource).toContain("paymentStatus !== \"awaiting_eft\"");
    expect(accountSource).toContain("Pay now");
    expect(accountSource).toContain("isPaymentReadyQuote(order)");
  });

  it("highlights payment-required orders and gives failed payments an explicit recovery action", () => {
    expect(accountSource).toContain("Payment required");
    expect(accountSource).toContain("Payment required for this quote");
    expect(orderDetailSource).toContain("Payment was not completed");
    expect(orderDetailSource).toContain("Retry Payment");
    expect(orderDetailSource).toContain("Retry Payment with PayFast");
  });

  it("requires a retry customer to confirm a PayFast payment method before redirecting", () => {
    expect(orderDetailSource).toContain("isRetryDialogOpen");
    expect(orderDetailSource).toContain("Retry secure payment");
    expect(orderDetailSource).toContain("Choose how you would like to retry payment");
    expect(orderDetailSource).toContain("Continue with PayFast");
    expect(orderDetailSource).toContain("Continue with Instant EFT");
    expect(orderDetailSource).toContain("confirmRetryPayment");
  });

  it("adds explicit visual progress feedback while a secure PayFast handoff is being prepared", () => {
    expect(orderDetailSource).toContain("Preparing secure payment…");
    expect(orderDetailSource).toContain("Preparing secure payment handoff");
    expect(orderDetailSource).toContain("animate-bounce");
  });
});
