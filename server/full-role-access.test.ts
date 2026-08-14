import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeCtx(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn(), cookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function user(role: "user" | "admin" = "user") {
  return {
    id: role === "admin" ? 9002 : 9001,
    openId: `validation-${role}`,
    email: `${role}@example.com`,
    fullName: `${role} validation`,
    loginMethod: "email",
    role,
    status: "approved" as const,
    phone: null,
    city: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  } as TrpcContext["user"];
}

describe("full role-access regression", () => {
  it("keeps public catalogue data available while hiding prices from anonymous visitors", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const products = await caller.products.list({ imageOnly: true });
    expect(products.every((product) => product.price === null)).toBe(true);
    expect(Array.isArray(await caller.categories.list())).toBe(true);
  });

  it("blocks anonymous visitors from customer and administrator workflow data", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.cart.get()).rejects.toThrow();
    await expect(caller.orders.myOrders()).rejects.toThrow();
    await expect(caller.notifications.list()).rejects.toThrow();
    await expect(caller.products.listAdmin()).rejects.toThrow();
    await expect(caller.categories.setPromotedProduct({ categoryId: 1, productId: null })).rejects.toThrow();
    await expect(caller.orders.adminList()).rejects.toThrow();
    await expect(caller.admin.reports()).rejects.toThrow();
  });

  it("allows approved customers into their own workflow services but blocks every administrator-only surface", async () => {
    const caller = appRouter.createCaller(makeCtx(user("user")));
    expect(Array.isArray(await caller.orders.myOrders())).toBe(true);
    expect(Array.isArray(await caller.notifications.list())).toBe(true);
    await expect(caller.products.listAdmin()).rejects.toThrow();
    await expect(caller.categories.setPromotedProduct({ categoryId: 1, productId: null })).rejects.toThrow();
    await expect(caller.orders.adminUpdateShipping({ orderId: 1, shippingStatus: "pending" })).rejects.toThrow();
    await expect(caller.admin.reports()).rejects.toThrow();
  });

  it("allows administrators to read the protected operations lists without mutating live data", async () => {
    const caller = appRouter.createCaller(makeCtx(user("admin")));
    expect(Array.isArray(await caller.products.listAdmin())).toBe(true);
    expect(Array.isArray(await caller.orders.adminList())).toBe(true);
    expect(Array.isArray(await caller.admin.reports())).toBe(true);
  });
});
