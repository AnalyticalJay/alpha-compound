import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("fulfilment, notification, and reporting contracts", () => {
  it("keeps shipping updates admin-only and exposes courier/tracking fields", () => {
    const router = read("server/routers.ts");
    const schema = read("drizzle/schema.ts");
    expect(router).toContain("adminUpdateShipping: adminProcedure");
    expect(router).toContain("shippingStatus: z.enum");
    expect(schema).toContain("trackingNumber");
    expect(schema).toContain("trackingUrl");
    expect(schema).toContain("shippingStatus");
  });

  it("provides protected notification list and mark-read procedures with real workflow fan-out", () => {
    const router = read("server/routers.ts");
    const db = read("server/db.ts");
    const ui = read("client/src/components/NotificationList.tsx");
    expect(router).toContain("notifications: router({");
    expect(router).toContain("getNotificationsForUser(ctx.user.id)");
    expect(router).toContain("markNotificationRead(ctx.user.id");
    expect(db).toContain("notifyAllAdmins");
    expect(ui).toContain("trpc.notifications.list.useQuery");
    expect(ui).toContain("trpc.notifications.markRead.useMutation");
  });

  it("keeps the reports export administrator-only and linked from the reports page", () => {
    const route = read("server/reportRoute.ts");
    const page = read("client/src/pages/admin/AdminReports.tsx");
    expect(route).toContain("user.role !== \"admin\"");
    expect(route).toContain("text/csv; charset=utf-8");
    expect(route).toContain("Cache-Control");
    expect(page).toContain("trpc.admin.reports.useQuery");
    expect(page).toContain("/api/admin/reports/orders.csv");
  });

  it("registers customer and admin notification/reporting surfaces", () => {
    const app = read("client/src/App.tsx");
    const layout = read("client/src/pages/admin/AdminLayout.tsx");
    expect(app).toContain("path=\"/notifications\"");
    expect(app).toContain("path=\"/admin/notifications\"");
    expect(app).toContain("path=\"/admin/reports\"");
    expect(layout).toContain("/admin/notifications");
    expect(layout).toContain("/admin/reports");
  });
});
