import { createHash, timingSafeEqual } from "node:crypto";
import { updateOrderPayment } from "./db";

const PAYFAST_PROCESS_URL = "https://www.payfast.co.za/eng/process";
const TRUSTED_CHECKOUT_ORIGINS = new Set([
  "https://anabolicsafrica.co.za",
  "https://www.anabolicsafrica.co.za",
  "https://alphashop-fvmuktca.manus.space",
]);

export type PayFastFormInput = {
  origin: string;
  orderId: number;
  payfastReference: string;
  total: string;
  email: string;
  fullName: string;
  paymentMethod?: "ef";
};

export type PayFastItnPayload = Record<string, string | undefined>;

function formEncode(value: string) {
  return encodeURIComponent(value.trim())
    .replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, "+");
}

export function getPayFastCredentials() {
  const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim();
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY?.trim();
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();

  if (!merchantId || !merchantKey || !passphrase) {
    throw new Error("PayFast credentials are not configured");
  }

  return { merchantId, merchantKey, passphrase };
}

function normalizeOrigin(origin: string) {
  const parsed = new URL(origin);
  return parsed.origin;
}

export function assertTrustedPayFastOrigin(origin: string) {
  const normalized = normalizeOrigin(origin);
  if (TRUSTED_CHECKOUT_ORIGINS.has(normalized)) return normalized;

  const hostname = new URL(normalized).hostname;
  const isLocalDevelopmentOrigin = process.env.NODE_ENV !== "production"
    && (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".manus.computer"));

  if (!isLocalDevelopmentOrigin) {
    throw new Error("Untrusted checkout origin");
  }

  return normalized;
}

function normalizeAmount(amount: string | undefined) {
  const parsed = Number.parseFloat(amount ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Invalid PayFast payment amount");
  }
  return parsed.toFixed(2);
}

export function buildPayFastFormConfig(input: PayFastFormInput) {
  const { merchantId, merchantKey } = getPayFastCredentials();
  const origin = assertTrustedPayFastOrigin(input.origin);
  const [firstName, ...lastNameParts] = input.fullName.trim().split(/\s+/).filter(Boolean);

  // PayFast requires this exact documented field order when computing the checkout signature.
  // Do not alphabetize these fields: checkout and API signature formats are different.
  const fields: PayFastItnPayload = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${origin}/order-success/${input.orderId}`,
    cancel_url: `${origin}/orders/${input.orderId}`,
    notify_url: `${origin}/api/payfast/itn`,
    name_first: firstName ?? "",
    name_last: lastNameParts.join(" ") || ".",
    email_address: input.email,
    m_payment_id: input.payfastReference,
    amount: Number.parseFloat(input.total).toFixed(2),
    item_name: `Anabolics Africa Approved Quote #${input.orderId}`,
    ...(input.paymentMethod ? { payment_method: input.paymentMethod } : {}),
  };

  return {
    action: PAYFAST_PROCESS_URL,
    fields: {
      ...fields,
      signature: createPayFastSignature(fields),
    },
  };
}

export function createPayFastSignature(payload: PayFastItnPayload, passphrase = getPayFastCredentials().passphrase) {
  const query = Object.entries(payload)
    .filter(([key, value]) => key !== "signature" && value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${formEncode(String(value))}`)
    .join("&");
  const suffix = passphrase ? `${query ? "&" : ""}passphrase=${formEncode(passphrase)}` : "";
  return createHash("md5").update(`${query}${suffix}`).digest("hex");
}

export function verifyPayFastSignature(payload: PayFastItnPayload) {
  const received = payload.signature?.trim();
  if (!received) return false;
  const expected = createPayFastSignature(payload);
  const receivedBuffer = Buffer.from(received, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function handlePayFastItn(payload: PayFastItnPayload) {
  if (!verifyPayFastSignature(payload)) {
    throw new Error("Invalid PayFast signature");
  }
  const { merchantId } = getPayFastCredentials();
  if (payload.merchant_id?.trim() !== merchantId) {
    throw new Error("Invalid PayFast merchant");
  }
  const reference = payload.m_payment_id?.trim();
  if (!reference) throw new Error("Missing PayFast payment reference");

  const amount = normalizeAmount(payload.amount_gross);
  const paymentStatus = payload.payment_status === "COMPLETE" ? "paid" : "failed";
  await updateOrderPayment(reference, paymentStatus, amount);
  return { success: true, paymentStatus } as const;
}
