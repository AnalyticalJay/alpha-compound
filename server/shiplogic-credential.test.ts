import { describe, expect, it } from "vitest";

describe("Shiplogic credential health", () => {
  it("accepts the configured Bearer credential at the tracking endpoint without exposing it", async () => {
    const token = process.env.SHIPLOGIC_API_KEY;
    expect(token, "SHIPLOGIC_API_KEY must be configured for this health check").toBeTruthy();

    const response = await fetch(
      "https://api.shiplogic.com/tracking/shipments?tracking_reference=G9G",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15_000),
      },
    );

    // An unknown reference may be a normal 4xx response; 401/403 specifically
    // indicate that the credential is absent, invalid, or unauthorized.
    expect([401, 403]).not.toContain(response.status);
  }, 20_000);
});
