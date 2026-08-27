import { beforeEach, describe, expect, it, vi } from "vitest";

const { storagePutMock, updateWatermarkSettingsMock, getWatermarkSettingsMock } = vi.hoisted(() => ({
  storagePutMock: vi.fn(),
  updateWatermarkSettingsMock: vi.fn(),
  getWatermarkSettingsMock: vi.fn(),
}));

vi.mock("./storage", () => ({ storagePut: storagePutMock }));
vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    getWatermarkSettings: getWatermarkSettingsMock,
    updateWatermarkSettings: updateWatermarkSettingsMock,
  };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeContext(role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 7,
      openId: "watermark-admin",
      email: "watermark@example.com",
      fullName: "Watermark Admin",
      loginMethod: "email",
      role,
      status: "approved",
      phone: null,
      city: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("watermark settings router", () => {
  beforeEach(() => {
    storagePutMock.mockReset();
    updateWatermarkSettingsMock.mockReset();
    getWatermarkSettingsMock.mockReset();
    getWatermarkSettingsMock.mockResolvedValue({ isEnabled: true, watermarkText: "ANABOLICS AFRICA", logoUrl: null, logoKey: null });
    updateWatermarkSettingsMock.mockResolvedValue({ isEnabled: true, watermarkText: "ANABOLICS AFRICA", logoUrl: null, logoKey: null });
    storagePutMock.mockResolvedValue({ key: "watermark/logo.png", url: "/manus-storage/watermark/logo.png" });
  });

  it("returns public display settings but restricts changes to administrators", async () => {
    await expect(appRouter.createCaller(makeContext("user")).watermark.get()).resolves.toMatchObject({ isEnabled: true });
    await expect(appRouter.createCaller(makeContext("user")).watermark.update({ isEnabled: false })).rejects.toMatchObject({ code: "FORBIDDEN" });

    await appRouter.createCaller(makeContext("admin")).watermark.update({ isEnabled: false });
    expect(updateWatermarkSettingsMock).toHaveBeenCalledWith({ isEnabled: false }, 7);
  });

  it("validates and stores a custom watermark logo through protected storage", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));
    await caller.watermark.uploadLogo({
      fileName: "brand-logo.png",
      fileData: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]).toString("base64"),
      mimeType: "image/png",
    });

    expect(storagePutMock).toHaveBeenCalledWith(expect.stringMatching(/^watermark\/logo-\d+-brand-logo\.png$/), expect.any(Buffer), "image/png");
    expect(updateWatermarkSettingsMock).toHaveBeenCalledWith({ logoUrl: "/manus-storage/watermark/logo.png", logoKey: expect.stringMatching(/^watermark\/logo-\d+-brand-logo\.png$/) }, 7);
  });
});
