import type { Express } from "express";
import {
  completeE2EPayFastFailure,
  completeE2EPayFastSuccess,
  getE2EOrder,
  isE2ETestMode,
  resetE2EStore,
  seedE2EOrder,
} from "./e2eStore";

/** Test-only write routes. They are inert unless the isolated E2E server enables E2E_TEST_MODE. */
export function registerE2EWriteFlowRoutes(app: Express) {
  app.post("/api/e2e/reset", (_req, res) => {
    if (!isE2ETestMode()) return res.status(404).end();
    resetE2EStore();
    return res.status(204).end();
  });

  app.post("/api/e2e/payfast-success/:orderId", (req, res) => {
    if (!isE2ETestMode()) return res.status(404).end();
    try {
      const orderId = Number(req.params.orderId);
      completeE2EPayFastSuccess(orderId);
      return res.redirect(303, `/orders/${orderId}`);
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid E2E payment callback" });
    }
  });

  app.post("/api/e2e/payfast-failure/:orderId", (req, res) => {
    if (!isE2ETestMode()) return res.status(404).end();
    try {
      const orderId = Number(req.params.orderId);
      completeE2EPayFastFailure(orderId);
      return res.redirect(303, `/orders/${orderId}`);
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid E2E payment callback" });
    }
  });

  app.post("/api/e2e/payfast-invalid-signature/:orderId", (req, res) => {
    if (!isE2ETestMode()) return res.status(404).end();
    const orderId = Number(req.params.orderId);
    const order = getE2EOrder(orderId);
    if (!order) return res.status(404).json({ error: "Disposable quote not found" });
    return res.status(400).json({ error: "Invalid PayFast signature", orderId, status: order.status, paymentStatus: order.paymentStatus });
  });

  app.post("/api/e2e/seed/:state", (req, res) => {
    if (!isE2ETestMode()) return res.status(404).end();
    if (req.params.state !== "quote-approved" && req.params.state !== "awaiting-payfast") return res.status(400).json({ error: "Unknown E2E seed state" });
    const order = seedE2EOrder(req.params.state === "quote-approved" ? "quote_approved" : "awaiting_payfast");
    return res.status(201).json({ orderId: order.id, status: order.status, paymentStatus: order.paymentStatus });
  });
}
