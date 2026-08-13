import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getOrderById: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function user(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 7,
    openId: "payment-history-user",
    fullName: "Payment History Customer",
    email: "customer@example.com",
    phone: null,
    city: "Gqeberha",
    passwordHash: null,
    loginMethod: "email",
    role: "user",
    status: "approved",
    isActive: true,
    isOver18: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function context(currentUser = user()): TrpcContext {
  return {
    user: currentUser,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("payment history authorization", () => {
  it("allows the owner and administrators to read order payment history", async () => {
    const order = {
      id: 42,
      userId: 7,
      status: "awaiting_payment",
      paymentStatus: "pending",
      paymentMethod: "payfast",
      totalAmount: "450.00",
      paymentHistory: [{ id: 1, orderId: 42, eventType: "payment_method_selected", paymentStatus: "pending", paymentMethod: "payfast", createdAt: new Date() }],
    };
    dbMocks.getOrderById.mockResolvedValue(order);

    const ownerResult = await appRouter.createCaller(context()).orders.detail({ orderId: 42 });
    const adminResult = await appRouter.createCaller(context(user({ id: 1, role: "admin" }))).orders.detail({ orderId: 42 });

    expect(ownerResult.paymentHistory).toHaveLength(1);
    expect(adminResult.paymentHistory).toHaveLength(1);
  });

  it("blocks unrelated customers from reading payment history", async () => {
    dbMocks.getOrderById.mockResolvedValue({ id: 42, userId: 7, paymentHistory: [] });

    await expect(appRouter.createCaller(context(user({ id: 99 }))).orders.detail({ orderId: 42 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
