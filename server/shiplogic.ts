import { ENV } from "./_core/env";

const SHIPLOGIC_TRACKING_URL = "https://api.shiplogic.com/tracking/shipments";
const SHIPLOGIC_SHIPMENTS_URL = "https://api.shiplogic.com/shipments";
const TRACKING_REFERENCE_PATTERN = /^[A-Za-z0-9._/-]{1,128}$/;

export type NormalizedShippingStatus = "pending" | "packed" | "dispatched" | "in_transit" | "out_for_delivery" | "delivered" | "returned";

export type ShiplogicTrackingEvent = {
  providerEventId: string | null;
  providerStatus: string;
  normalizedStatus: NormalizedShippingStatus;
  message: string | null;
  location: string | null;
  occurredAt: Date | null;
};

export type ShiplogicTrackingResult = {
  trackingReference: string;
  providerStatus: string;
  normalizedStatus: NormalizedShippingStatus;
  events: ShiplogicTrackingEvent[];
};

export type ShiplogicBookingInput = {
  orderId: number;
  customerName: string;
  customerEmail?: string | null;
  customerMobile?: string | null;
  shipping: {
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    postalCode: string;
    country?: string | null;
  };
  declaredValue?: number;
};

export type ShiplogicBookingResult = {
  shipmentId: string | null;
  trackingReference: string;
  providerStatus: string;
};

export class ShiplogicError extends Error {
  code: "not_configured" | "not_ready" | "already_booked" | "invalid_reference" | "provider_unavailable" | "provider_rejected" | "invalid_response";

  constructor(code: ShiplogicError["code"], message: string) {
    super(message);
    this.name = "ShiplogicError";
    this.code = code;
  }
}

function cleanStatus(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replaceAll("_", "-");
}

export function normalizeShiplogicStatus(value: unknown): NormalizedShippingStatus {
  const status = cleanStatus(value);
  if (status === "delivered") return "delivered";
  if (["cancelled", "returned-to-sender", "undeliverable", "returned-to-hub", "return-to-hub"].includes(status)) return "returned";
  if (["out-for-delivery", "delivery-assigned", "delivery-unassigned", "delivery-rejected", "delivery-scheduled", "in-locker", "ready-for-pickup"].includes(status)) return "out_for_delivery";
  if (["in-transit", "at-destination-hub", "at-hub", "manifested", "ready-for-dispatch", "on-hold", "on-hold-internal", "floor-check", "damaged", "under-query", "inbound-customs-and-vat"].includes(status)) return "in_transit";
  if (["collected", "collection-assigned", "collection-unassigned", "collection-rejected", "collection-exception", "collection-failed-attempt", "collection-accepted"].includes(status)) return "dispatched";
  if (["delivery-exception", "delivery-failed-attempt", "swad-dimensions", "swad-imaging"].includes(status)) return "in_transit";
  return "pending";
}

function firstText(...values: unknown[]) {
  const value = values.find((candidate) => typeof candidate === "string" && candidate.trim());
  return typeof value === "string" ? value.trim().slice(0, 512) : null;
}

function firstNonEmpty(...values: unknown[]) {
  const value = values.find((candidate) => candidate !== undefined && candidate !== null && String(candidate).trim());
  return value === undefined || value === null ? null : String(value).trim();
}

function eventLocation(event: Record<string, unknown>) {
  const location = event.location;
  if (typeof location === "string") return location.trim().slice(0, 255) || null;
  if (location && typeof location === "object") {
    const record = location as Record<string, unknown>;
    return firstText(record.name, record.city, record.address, record.description)?.slice(0, 255) ?? null;
  }
  return firstText(event.city, event.hub, event.depot)?.slice(0, 255) ?? null;
}

function eventDate(event: Record<string, unknown>) {
  const candidate = firstText(event.occurred_at, event.occurredAt, event.created_at, event.createdAt, event.timestamp, event.date, event.event_time);
  if (!candidate) return null;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toEvent(event: unknown): ShiplogicTrackingEvent | null {
  if (!event || typeof event !== "object") return null;
  const record = event as Record<string, unknown>;
  const providerStatus = firstText(record.status, record.shipment_status, record.shipmentStatus, record.tracking_status) ?? "unknown";
  return {
    providerEventId: firstText(record.id, record.event_id, record.eventId),
    providerStatus,
    normalizedStatus: normalizeShiplogicStatus(providerStatus),
    message: firstText(record.message, record.description, record.note),
    location: eventLocation(record),
    occurredAt: eventDate(record),
  };
}

function requiredBookingConfiguration() {
  const missing = [
    ["SHIPLOGIC_API_KEY", ENV.shiplogicApiKey],
    ["SHIPLOGIC_SERVICE_LEVEL_CODE", ENV.shiplogicServiceLevelCode],
    ["SHIPLOGIC_COLLECTION_NAME", ENV.shiplogicCollectionName],
    ["SHIPLOGIC_COLLECTION_ADDRESS", ENV.shiplogicCollectionAddress],
    ["SHIPLOGIC_COLLECTION_CITY", ENV.shiplogicCollectionCity],
    ["SHIPLOGIC_COLLECTION_POSTAL_CODE", ENV.shiplogicCollectionPostalCode],
    ["SHIPLOGIC_COLLECTION_EMAIL or SHIPLOGIC_COLLECTION_MOBILE", ENV.shiplogicCollectionEmail || ENV.shiplogicCollectionMobile],
  ].filter(([, value]) => !String(value ?? "").trim()).map(([name]) => name);
  if (missing.length) throw new ShiplogicError("not_ready", `Shiplogic booking is not ready. Missing: ${missing.join(", ")}.`);
  if (![ENV.shiplogicParcelLengthCm, ENV.shiplogicParcelWidthCm, ENV.shiplogicParcelHeightCm, ENV.shiplogicParcelWeightKg].every((value) => Number.isFinite(value) && value > 0)) {
    throw new ShiplogicError("not_ready", "Shiplogic booking is not ready. Configure positive parcel dimensions and weight.");
  }
}

export async function createShiplogicShipment(input: ShiplogicBookingInput): Promise<ShiplogicBookingResult> {
  requiredBookingConfiguration();
  const customerEmail = input.customerEmail?.trim() || undefined;
  const customerMobile = input.customerMobile?.trim() || undefined;
  if (!customerEmail && !customerMobile) throw new ShiplogicError("not_ready", "Shiplogic requires the customer email or mobile number for delivery contact.");
  const deliveryStreet = [input.shipping.addressLine1, input.shipping.addressLine2].filter(Boolean).join(", ").slice(0, 255);
  const payload = {
    collection_address: {
      type: "business",
      company: "Anabolics Africa",
      street_address: ENV.shiplogicCollectionAddress.trim(),
      city: ENV.shiplogicCollectionCity.trim(),
      ...(ENV.shiplogicCollectionZone.trim() ? { zone: ENV.shiplogicCollectionZone.trim() } : {}),
      country: "ZA",
      code: ENV.shiplogicCollectionPostalCode.trim(),
    },
    collection_contact: {
      name: ENV.shiplogicCollectionName.trim(),
      ...(ENV.shiplogicCollectionMobile.trim() ? { mobile_number: ENV.shiplogicCollectionMobile.trim() } : {}),
      ...(ENV.shiplogicCollectionEmail.trim() ? { email: ENV.shiplogicCollectionEmail.trim() } : {}),
    },
    delivery_address: {
      type: "residential",
      street_address: deliveryStreet,
      city: input.shipping.city.trim(),
      country: input.shipping.country?.trim() || "ZA",
      code: input.shipping.postalCode.trim(),
    },
    delivery_contact: {
      name: input.customerName.trim().slice(0, 255),
      ...(customerMobile ? { mobile_number: customerMobile } : {}),
      ...(customerEmail ? { email: customerEmail } : {}),
    },
    parcels: [{
      parcel_description: `Anabolics Africa order #${input.orderId}`,
      submitted_length_cm: ENV.shiplogicParcelLengthCm,
      submitted_width_cm: ENV.shiplogicParcelWidthCm,
      submitted_height_cm: ENV.shiplogicParcelHeightCm,
      submitted_weight_kg: ENV.shiplogicParcelWeightKg,
    }],
    service_level_code: ENV.shiplogicServiceLevelCode.trim(),
    customer_reference_name: "Order no.",
    customer_reference: `AA-${input.orderId}`,
    declared_value: input.declaredValue && input.declaredValue > 0 ? input.declaredValue : undefined,
    mute_notifications: false,
  };

  let response: Response;
  try {
    response = await fetch(SHIPLOGIC_SHIPMENTS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${ENV.shiplogicApiKey}`, Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ShiplogicError("provider_unavailable", "Shiplogic could not be reached. No waybill was created.");
  }
  if (response.status === 401 || response.status === 403) throw new ShiplogicError("provider_rejected", "Shiplogic rejected the configured API credential.");
  let body: unknown = null;
  try { body = await response.json(); } catch { /* handled below */ }
  if (!response.ok) {
    const message = body && typeof body === "object" ? firstNonEmpty((body as Record<string, unknown>).message, (body as Record<string, unknown>).error, (body as Record<string, unknown>).detail) : null;
    throw new ShiplogicError("provider_unavailable", `Shiplogic could not book the shipment${message ? `: ${message}` : ` (HTTP ${response.status})`}.`);
  }
  if (!body || typeof body !== "object") throw new ShiplogicError("invalid_response", "Shiplogic returned an invalid booking response.");
  const result = body as Record<string, unknown>;
  const shipment = result.shipment && typeof result.shipment === "object" ? result.shipment as Record<string, unknown> : result;
  const parcels = Array.isArray(shipment.parcels) ? shipment.parcels : [];
  const parcel = parcels[0] && typeof parcels[0] === "object" ? parcels[0] as Record<string, unknown> : {};
  const trackingReference = firstNonEmpty(shipment.custom_tracking_reference, shipment.tracking_reference, shipment.short_tracking_reference, parcel.tracking_reference, parcel.custom_tracking_reference);
  if (!trackingReference || !TRACKING_REFERENCE_PATTERN.test(trackingReference)) throw new ShiplogicError("invalid_response", "Shiplogic booked the shipment but did not return a usable tracking reference.");
  return {
    shipmentId: firstNonEmpty(shipment.id, shipment.shipment_id),
    trackingReference,
    providerStatus: firstNonEmpty(shipment.status, result.status) ?? "submitted",
  };
}

export async function trackShiplogicShipment(trackingReference: string): Promise<ShiplogicTrackingResult> {
  if (!ENV.shiplogicApiKey) throw new ShiplogicError("not_configured", "Shiplogic tracking is not configured.");
  const reference = trackingReference.trim();
  if (!TRACKING_REFERENCE_PATTERN.test(reference)) throw new ShiplogicError("invalid_reference", "The tracking reference contains unsupported characters.");

  let response: Response;
  try {
    response = await fetch(`${SHIPLOGIC_TRACKING_URL}?tracking_reference=${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${ENV.shiplogicApiKey}`, Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new ShiplogicError("provider_unavailable", "Shiplogic could not be reached. Please try again shortly.");
  }

  if (response.status === 401 || response.status === 403) throw new ShiplogicError("provider_rejected", "Shiplogic rejected the configured API credential.");
  if (!response.ok) throw new ShiplogicError("provider_unavailable", `Shiplogic tracking is temporarily unavailable (HTTP ${response.status}).`);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ShiplogicError("invalid_response", "Shiplogic returned an unreadable tracking response.");
  }
  if (!payload || typeof payload !== "object") throw new ShiplogicError("invalid_response", "Shiplogic returned an invalid tracking response.");

  const body = payload as Record<string, unknown>;
  const shipment = body.shipment && typeof body.shipment === "object" ? body.shipment as Record<string, unknown> : {};
  const rawEvents = Array.isArray(body.tracking_events) ? body.tracking_events : Array.isArray(body.events) ? body.events : Array.isArray(shipment.tracking_events) ? shipment.tracking_events : [];
  const events = rawEvents.map(toEvent).filter((event): event is ShiplogicTrackingEvent => Boolean(event));
  const providerStatus = firstText(body.status, body.shipment_status, body.shipmentStatus, shipment.status, events[0]?.providerStatus) ?? "submitted";
  return {
    trackingReference: reference,
    providerStatus,
    normalizedStatus: normalizeShiplogicStatus(providerStatus),
    events,
  };
}

export const shiplogicTrackingUrl = (trackingReference: string) => `${SHIPLOGIC_TRACKING_URL}?tracking_reference=${encodeURIComponent(trackingReference)}`;
