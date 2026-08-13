import type { Express, Request, Response } from "express";
import { getAllOrders, getOrderById } from "./db";
import { sdk } from "./_core/sdk";

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function registerReportRoutes(app: Express) {
  app.get("/api/admin/reports/orders.csv", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user || user.role !== "admin") {
        res.status(403).send("Admin access required");
        return;
      }
      const orders = await getAllOrders();
      const orderDetails = await Promise.all(orders.map(async (order) => ({ summary: order, detail: await getOrderById(order.id) })));
      const header = ["Quote", "Customer", "Email", "Order status", "Payment status", "Payment method", "Total ZAR", "Shipping status", "Courier", "Tracking number", "Created", "Updated"];
      const rows = orderDetails.map(({ summary: order, detail }) => [
        order.id,
        order.userFullName,
        order.userEmail,
        order.status,
        order.paymentStatus,
        order.paymentMethod,
        order.totalAmount,
        detail?.shipping?.shippingStatus,
        detail?.shipping?.courierName,
        detail?.shipping?.trackingNumber,
        order.createdAt?.toISOString?.() ?? order.createdAt,
        order.updatedAt?.toISOString?.() ?? order.updatedAt,
      ]);
      const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=anabolics-africa-orders-report.csv");
      res.setHeader("Cache-Control", "private, no-store");
      res.status(200).send(csv);
    } catch (error) {
      console.error("[Reports] Failed to generate order CSV:", error);
      res.status(500).send("Could not generate report");
    }
  });
}
