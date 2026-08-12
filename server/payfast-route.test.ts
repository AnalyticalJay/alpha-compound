import express from "express";
import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateOrderPayment: vi.fn(async () => undefined),
}));

vi.mock("./db", () => ({ updateOrderPayment: mocks.updateOrderPayment }));

import { createPayFastSignature } from "./payfast";
import { registerPayFastRoutes } from "./payfastRoute";

describe("PayFast ITN route", () => {
  let server: Server;
  let baseUrl = "";

  beforeAll(async () => {
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    registerPayFastRoutes(app);
    server = await new Promise<Server>((resolve) => {
      const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not expose a port");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  it("accepts a signed form callback and updates the referenced payment", async () => {
    const payload = {
      amount_gross: "450.00",
      m_payment_id: "AA-42-123",
      payment_status: "COMPLETE",
    };
    const body = new URLSearchParams({ ...payload, signature: createPayFastSignature(payload) });

    const response = await fetch(`${baseUrl}/api/payfast/itn`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("OK");
    expect(mocks.updateOrderPayment).toHaveBeenCalledWith("AA-42-123", "paid");
  });

  it("rejects an invalid signature without changing payment state", async () => {
    const response = await fetch(`${baseUrl}/api/payfast/itn`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        amount_gross: "450.00",
        m_payment_id: "AA-42-123",
        payment_status: "COMPLETE",
        signature: "invalid",
      }),
    });

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid PayFast notification");
    expect(mocks.updateOrderPayment).toHaveBeenCalledTimes(1);
  });
});
