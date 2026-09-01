import { describe, expect, it, vi } from "vitest";
import { normalizeShiplogicStatus, trackShiplogicShipment, ShiplogicError } from "./shiplogic";

describe("Shiplogic tracking integration", () => {
  it("maps provider statuses into the existing delivery timeline contract", () => {
    expect(normalizeShiplogicStatus("out_for_delivery")).toBe("out_for_delivery");
    expect(normalizeShiplogicStatus("in-transit")).toBe("in_transit");
    expect(normalizeShiplogicStatus("delivered")).toBe("delivered");
    expect(normalizeShiplogicStatus("returned-to-sender")).toBe("returned");
    expect(normalizeShiplogicStatus("collected")).toBe("dispatched");
    expect(normalizeShiplogicStatus("unknown-provider-status")).toBe("pending");
  });

  it("normalizes a successful response without returning credentials or raw payloads", async () => {
    const previousFetch = globalThis.fetch;
    const previousKey = process.env.SHIPLOGIC_API_KEY;
    process.env.SHIPLOGIC_API_KEY = "test-server-only-token";
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "out_for_delivery",
      tracking_events: [{ id: "evt-1", status: "out_for_delivery", message: "Courier is on the way", location: { city: "Gqeberha" }, occurred_at: "2026-09-01T08:00:00Z" }],
    }), { status: 200, headers: { "content-type": "application/json" } }));

    const result = await trackShiplogicShipment("FLASH-123");
    expect(result).toMatchObject({ trackingReference: "FLASH-123", providerStatus: "out_for_delivery", normalizedStatus: "out_for_delivery" });
    expect(result.events[0]).toMatchObject({ providerEventId: "evt-1", location: "Gqeberha" });
    expect(JSON.stringify(result)).not.toContain("test-server-only-token");

    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.SHIPLOGIC_API_KEY;
    else process.env.SHIPLOGIC_API_KEY = previousKey;
  });

  it("rejects malformed tracking references before making a provider request", async () => {
    const previousKey = process.env.SHIPLOGIC_API_KEY;
    process.env.SHIPLOGIC_API_KEY = "test-server-only-token";
    const provider = vi.spyOn(globalThis, "fetch");
    await expect(trackShiplogicShipment("bad reference with spaces")).rejects.toMatchObject<ShiplogicError>({ code: "invalid_reference" });
    expect(provider).not.toHaveBeenCalled();
    provider.mockRestore();
    if (previousKey === undefined) delete process.env.SHIPLOGIC_API_KEY;
    else process.env.SHIPLOGIC_API_KEY = previousKey;
  });
});
