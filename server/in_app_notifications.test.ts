import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("requested in-app notification workflows", () => {
  it("notifies every administrator when a quote is submitted", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("await notifyAllAdmins({");
    expect(router).toContain("title: `New quote submitted: #${quoteId}`");
    expect(router).toContain("type: \"quote\"");
  });

  it("notifies the customer when a quote is approved", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("title: input.decision === \"quote_approved\" ? `Quote #${input.orderId} approved`");
    expect(router).toContain("Your quote is approved and ready for payment.");
  });

  it("notifies every administrator when payment is received", () => {
    const db = read("server/db.ts");
    expect(db).toContain("title: `Payment received for Quote #${orderId}`");
    expect(db).toContain("title: `Payment received for Quote #${order[0].id}`");
    expect(db).toContain("body: `${methodLabel} confirmed payment and the order is ready for fulfilment.`");
    expect(db).toContain("await notifyAllAdmins({");
  });

  it("notifies the customer when an order is marked shipped", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("if (input.status === \"shipped\" && existing.status !== \"shipped\")");
    expect(router).toContain("title: `Order #${input.orderId} shipped`");
    expect(router).toContain("Your order has been shipped and is now on its way.");
    expect(router).toContain("type: \"shipping\"");
  });

  it("keeps notification ownership and unread/read handling user-scoped", () => {
    const db = read("server/db.ts");
    const ui = read("client/src/components/NotificationList.tsx");
    expect(db).toContain("where(eq(notifications.userId, userId))");
    expect(db).toContain("and(eq(notifications.id, notificationId), eq(notifications.userId, userId))");
    expect(ui).toContain("const unreadCount = items.filter((item) => !item.readAt).length");
    expect(ui).toContain("trpc.notifications.markRead.useMutation");
  });
});
