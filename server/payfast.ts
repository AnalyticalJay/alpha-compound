import { createHash, timingSafeEqual } from "node:crypto";
import { markPayfastItnAttemptFailed, markPayfastItnAttemptInvalid, markPayfastItnAttemptProcessed, markPayfastItnAttemptValidated, recordPayfastItnAttempt, updateOrderPayment } from "./db";
import { ENV } from "./_core/env";
import { bookShiplogicOrder } from "./shiplogicBooking";

const PAYFAST_PROCESS_URL = "https://www.payfast.co.za/eng/process";
const PAYFAST_ITN_VALIDATE_URL = "https://www.payfast.co.za/eng/query/validate";
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

export async function validatePayFastNotification(payload: PayFastItnPayload) {
  const validationPayload = Object.entries(payload)
    .filter(([key, value]) => key !== "signature" && value !== undefined)
    .map(([key, value]) => `${key}=${formEncode(String(value))}`)
    .join("&");
  let response: Response;
  try {
    response = await fetch(PAYFAST_ITN_VALIDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "text/plain" },
      body: validationPayload,
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new Error("PayFast validation service could not be reached");
  }
  if (!response.ok) throw new Error(`PayFast validation returned HTTP ${response.status}`);
  if ((await response.text()).trim() !== "VALID") throw new Error("PayFast server validation failed");
  return true;
}

export async function handlePayFastItn(payload: PayFastItnPayload) {
  const paymentStatus = payload.payment_status === "COMPLETE" ? "paid" : "failed";
  const reference = payload.m_payment_id?.trim() || null;
  const rawAmount = payload.amount_gross?.trim() || null;
  let amount: string | null = null;
  try {
    amount = rawAmount ? normalizeAmount(rawAmount) : null;
  } catch {
    amount = null;
  }
  const attemptId = await recordPayfastItnAttempt({
    payfastReference: reference,
    pfPaymentId: payload.pf_payment_id?.trim() || null,
    merchantId: payload.merchant_id?.trim() || null,
    paymentStatus: payload.payment_status?.trim() || "UNKNOWN",
    amountGross: amount,
    validationStatus: "pending",
  });
  try {
    if (!verifyPayFastSignature(payload)) throw new Error("Invalid PayFast signature");
    const { merchantId } = getPayFastCredentials();
    if (payload.merchant_id?.trim() !== merchantId) throw new Error("Invalid PayFast merchant");
    if (!reference) throw new Error("Missing PayFast payment reference");
    if (!amount) throw new Error("Missing PayFast payment amount");
    await validatePayFastNotification(payload);
    if (attemptId) await markPayfastItnAttemptValidated(attemptId);
    const paymentResult = await updateOrderPayment(reference, paymentStatus, amount);
    if (paymentStatus === "paid" && !paymentResult.alreadyPaid && ENV.shiplogicAutoBookAfterPayment) {
      await bookShiplogicOrder(paymentResult.orderId).catch((bookingError) => {
        console.error("[Shiplogic] Automatic post-payment booking failed:", bookingError instanceof Error ? bookingError.message : bookingError);
      });
    }
    if (attemptId) await markPayfastItnAttemptProcessed(attemptId);
    return { success: true, paymentStatus } as const;
  } catch (error) {
    if (attemptId) {
      const message = error instanceof Error ? error.message : "PayFast ITN processing failed";
      if (message.includes("signature") || message.includes("merchant") || message.includes("Missing PayFast payment reference") || message.includes("Missing PayFast payment amount")) await markPayfastItnAttemptInvalid(attemptId, message);
      else await markPayfastItnAttemptFailed(attemptId, message);
    }
    throw error;
  }
}
