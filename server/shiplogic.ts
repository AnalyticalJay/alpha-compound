import { ENV } from "./_core/env";

const SHIPLOGIC_TRACKING_URL = "https://api.shiplogic.com/tracking/shipments";
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

export class ShiplogicError extends Error {
  code: "not_configured" | "invalid_reference" | "provider_unavailable" | "provider_rejected" | "invalid_response";

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
  if (["cancelled", "returned-to-sender", "undeliverable", "returned-to-hub"].includes(status)) return "returned";
  if (["out-for-delivery", "delivery-assigned", "delivery-unassigned", "delivery-rejected"].includes(status)) return "out_for_delivery";
  if (["in-transit", "at-destination-hub", "at-hub", "manifested", "ready-for-dispatch", "on-hold", "on-hold-internal", "floor-check"].includes(status)) return "in_transit";
  if (["collected", "collection-assigned", "collection-unassigned", "collection-rejected", "collection-exception", "collection-failed-attempt"].includes(status)) return "dispatched";
  if (["delivery-exception", "delivery-failed-attempt", "swad-dimensions", "swad-imaging"].includes(status)) return "in_transit";
  return "pending";
}

function firstText(...values: unknown[]) {
  const value = values.find((candidate) => typeof candidate === "string" && candidate.trim());
  return typeof value === "string" ? value.trim().slice(0, 512) : null;
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
  const candidate = firstText(event.occurred_at, event.occurredAt, event.created_at, event.createdAt, event.timestamp, event.date);
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
  const rawEvents = Array.isArray(body.tracking_events) ? body.tracking_events : Array.isArray(body.events) ? body.events : [];
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
