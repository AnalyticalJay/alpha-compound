import { buildPayFastFormConfig } from "../server/payfast.ts";

const config = buildPayFastFormConfig({
  origin: "https://anabolicsafrica.co.za",
  orderId: 150001,
  payfastReference: "AA-150001-1787667474972",
  total: "10.00",
  email: "payment-validation@example.invalid",
  fullName: "Payment Validation",
});

const response = await fetch(config.action, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(config.fields),
  redirect: "manual",
});

const html = await response.text();
const invalidMerchantKey = /invalid merchant key/i.test(html);
const invalidSignature = /signature/i.test(html) && /invalid|mismatch|failed/i.test(html);
const location = response.headers.get("location");

console.log(JSON.stringify({
  status: response.status,
  checkoutUrl: location ? new URL(location, config.action).toString() : null,
  invalidMerchantKey,
  invalidSignature,
  signatureIncluded: Boolean(config.fields.signature),
}));

if (invalidMerchantKey || invalidSignature || response.status >= 400) {
  process.exitCode = 1;
}
