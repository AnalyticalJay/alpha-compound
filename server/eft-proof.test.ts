import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getOrderById: vi.fn(),
  updateOrderEftProof: vi.fn(),
  recordPaymentEvent: vi.fn(),
}));

const storageMocks = vi.hoisted(() => ({
  storagePut: vi.fn(),
  storageGetSignedUrl: vi.fn(),
}));

vi.mock("./db", async () => ({
  ...(await vi.importActual<typeof import("./db")>("./db")),
  ...dbMocks,
}));

vi.mock("./storage", async () => ({
  ...(await vi.importActual<typeof import("./storage")>("./storage")),
  ...storageMocks,
}));

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function user(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 7,
    openId: "eft-user",
    fullName: "EFT Customer",
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

const projectRoot = resolve(import.meta.dirname, "..");

function source(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), "utf8");
}

describe("EFT proof of payment workflow", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores an owner proof in S3 metadata and records the awaiting verification event", async () => {
    dbMocks.getOrderById.mockResolvedValue({ id: 42, userId: 7, status: "awaiting_payment", totalAmount: "450.00" });
    storageMocks.storagePut.mockResolvedValue({ key: "orders/42/eft-proof.pdf", url: "/manus-storage/orders/42/eft-proof.pdf" });

    const result = await appRouter.createCaller(context()).orders.uploadEftProof({
      orderId: 42,
      fileName: "proof.pdf",
      fileData: Buffer.from("%PDF-1.7\n").toString("base64"),
      mimeType: "application/pdf",
    });

    expect(result).toEqual({ success: true, url: "/manus-storage/orders/42/eft-proof.pdf", fileName: "proof.pdf" });
    expect(storageMocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("orders/42/eft-"), expect.any(Buffer), "application/pdf");
    expect(dbMocks.updateOrderEftProof).toHaveBeenCalledWith(expect.objectContaining({ orderId: 42, eftProofKey: expect.stringContaining("orders/42/eft-"), eftProofName: "proof.pdf", paymentStatus: "awaiting_eft" }));
    expect(dbMocks.recordPaymentEvent).toHaveBeenCalledWith(expect.objectContaining({ orderId: 42, eventType: "eft_proof_uploaded", paymentStatus: "awaiting_eft" }));
  });

  it("blocks unrelated users and rejects unsupported proof types", async () => {
    dbMocks.getOrderById.mockResolvedValue({ id: 42, userId: 7, status: "awaiting_payment", totalAmount: "450.00" });

    await expect(appRouter.createCaller(context(user({ id: 99 }))).orders.uploadEftProof({ orderId: 42, fileName: "proof.pdf", fileData: "cGRm", mimeType: "application/pdf" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context()).orders.uploadEftProof({ orderId: 42, fileName: "proof.exe", fileData: "ZXhl", mimeType: "application/octet-stream" as never })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("protects the signed proof download and exposes proof-review UI contracts", () => {
    const orderDetail = source("client/src/pages/OrderDetail.tsx");
    const adminDetail = source("client/src/pages/admin/AdminOrderDetail.tsx");
    expect(orderDetail).toContain("uploadEftProof");
    expect(orderDetail).toContain("Proof of payment");
    expect(adminDetail).toContain("getEftProofDownload");
    expect(adminDetail).toContain("View proof");
  });
});
