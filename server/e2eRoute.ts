import type { Express } from "express";
import {
  completeE2EPayFastSuccess,
  isE2ETestMode,
  resetE2EStore,
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
}
