import { createHash, timingSafeEqual } from "node:crypto";
import { updateOrderPayment } from "./db";

const PAYFAST_PROCESS_URL = "https://www.payfast.co.za/eng/process";

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

export function buildPayFastFormConfig(input: PayFastFormInput) {
  const { merchantId, merchantKey } = getPayFastCredentials();
  const origin = normalizeOrigin(input.origin);
  const [firstName, ...lastNameParts] = input.fullName.trim().split(/\s+/).filter(Boolean);

  return {
    action: PAYFAST_PROCESS_URL,
    fields: {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${origin}/order-success/${input.orderId}`,
      cancel_url: `${origin}/orders/${input.orderId}`,
      notify_url: `${origin}/api/payfast/itn`,
      m_payment_id: input.payfastReference,
      amount: Number.parseFloat(input.total).toFixed(2),
      item_name: `Anabolics Africa Approved Quote #${input.orderId}`,
      email_address: input.email,
      name_first: firstName ?? "",
      name_last: lastNameParts.join(" ") || ".",
      ...(input.paymentMethod ? { payment_method: input.paymentMethod } : {}),
    },
  };
}

export function createPayFastSignature(payload: PayFastItnPayload, passphrase = getPayFastCredentials().passphrase) {
  const query = Object.entries(payload)
    .filter(([key, value]) => key !== "signature" && value !== undefined && value !== "")
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value).trim())}`)
    .join("&");
  const suffix = passphrase ? `${query ? "&" : ""}passphrase=${encodeURIComponent(passphrase)}` : "";
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
  const reference = payload.m_payment_id?.trim();
  if (!reference) throw new Error("Missing PayFast payment reference");

  const paymentStatus = payload.payment_status === "COMPLETE" ? "paid" : "failed";
  await updateOrderPayment(reference, paymentStatus);
  return { success: true, paymentStatus } as const;
}
