import type { Express, Request, Response } from "express";
import { getOrderById, getUserById } from "./db";
import { generateInvoicePdf, isInvoiceEligible } from "./invoice";
import { sdk } from "./_core/sdk";

export function registerInvoiceRoutes(app: Express) {
  app.get("/api/invoices/:orderId.pdf", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user) {
        res.status(401).send("Authentication required");
        return;
      }

      const orderId = Number(req.params.orderId);
      if (!Number.isInteger(orderId) || orderId <= 0) {
        res.status(400).send("Invalid order id");
        return;
      }

      const order = await getOrderById(orderId);
      if (!order) {
        res.status(404).send("Invoice not found");
        return;
      }
      if (order.userId !== user.id && user.role !== "admin") {
        res.status(403).send("Access denied");
        return;
      }
      if (!isInvoiceEligible(order.status)) {
        res.status(409).send("Invoice is not available for this quote status");
        return;
      }

      const customer = await getUserById(order.userId);
      const pdf = await generateInvoicePdf(order, customer ?? {});
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="anabolics-africa-invoice-${order.id}.pdf"`);
      res.setHeader("Cache-Control", "private, no-store");
      res.status(200).send(pdf);
    } catch (error) {
      console.error("[Invoice] Failed to generate invoice:", error);
      res.status(500).send("Could not generate invoice");
    }
  });
}
