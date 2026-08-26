import type { Express, Request, Response } from "express";
import { getOrderById } from "./db";
import { buildPayFastFormConfig } from "./payfast";
import { sdk } from "./_core/sdk";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildPayFastCheckoutBridgePage(input: {
  action: string;
  fields: Record<string, string>;
  amount: string;
}) {
  const inputs = Object.entries(input.fields)
    .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`)
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Continue to PayFast | Anabolics Africa</title>
  </head>
  <body>
    <main>
      <h1>Continue securely to PayFast</h1>
      <p>Your approved payment total is R${escapeHtml(input.amount)}.</p>
      <form method="POST" action="${escapeHtml(input.action)}">
        ${inputs}
        <button type="submit">Continue to secure payment</button>
      </form>
      <p>You will be redirected to PayFast to complete the payment.</p>
    </main>
  </body>
</html>`;
}

export function registerPayFastCheckoutBridge(app: Express) {
  app.get("/api/payfast/checkout/:orderId", async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.params.orderId);
      if (!Number.isInteger(orderId) || orderId <= 0) {
        res.status(400).send("Invalid order id");
        return;
      }

      const user = await sdk.authenticateRequest(req);
      if (!user) {
        res.status(401).send("Authentication required");
        return;
      }
      if (user.status !== "approved") {
        res.status(403).send("Approved account required");
        return;
      }

      const order = await getOrderById(orderId);
      if (!order) {
        res.status(404).send("Quote not found");
        return;
      }
      if (order.userId !== user.id && user.role !== "admin") {
        res.status(403).send("Access denied");
        return;
      }
      if (order.status !== "awaiting_payment" || !["payfast", "eft"].includes(order.paymentMethod ?? "") || !order.payfastReference) {
        res.status(409).send("PayFast is not ready for this quote");
        return;
      }

      const form = buildPayFastFormConfig({
        origin: "https://anabolicsafrica.co.za",
        orderId,
        payfastReference: order.payfastReference,
        total: order.totalAmount,
        email: user.email ?? "",
        fullName: user.fullName ?? "",
        paymentMethod: order.paymentMethod === "eft" ? "ef" : undefined,
      });

      res.setHeader("Cache-Control", "no-store");
      res.type("html").send(buildPayFastCheckoutBridgePage({
        action: form.action,
        fields: form.fields as Record<string, string>,
        amount: Number.parseFloat(order.totalAmount).toFixed(2),
      }));
    } catch (error) {
      console.error("[PayFastCheckoutBridge] Failed to prepare checkout", error);
      res.status(500).send("Could not prepare secure checkout");
    }
  });
}
