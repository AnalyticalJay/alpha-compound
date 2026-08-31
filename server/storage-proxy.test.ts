import express from "express";
import { createServer, type Server } from "node:http";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { registerStorageProxy } from "./_core/storageProxy";

describe("storage proxy", () => {
  let server: Server;
  let baseUrl = "";

  beforeAll(async () => {
    const app = express();
    registerStorageProxy(app);
    server = await new Promise<Server>((resolve) => {
      const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not expose a port");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not expose order proof keys through the public storage route", async () => {
    const response = await fetch(`${baseUrl}/manus-storage/orders/42/eft-proof.pdf`, { redirect: "manual" });
    expect(response.status).toBe(404);
  });

  it("reuses a short-lived signed product URL instead of repeatedly calling storage", async () => {
    const nativeFetch = globalThis.fetch;
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const requestUrl = typeof input === "string" ? input : input.toString();
      if (requestUrl.startsWith(baseUrl)) return nativeFetch(input, init);
      return new Response(JSON.stringify({ url: "https://storage.example.test/product.jpg" }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = await fetch(`${baseUrl}/manus-storage/products/cache-check.jpg`, { redirect: "manual" });
    const second = await fetch(`${baseUrl}/manus-storage/products/cache-check.jpg`, { redirect: "manual" });

    expect(first.status).toBe(307);
    expect(second.status).toBe(307);
    expect(first.headers.get("cache-control")).toContain("max-age=120");
    const upstreamCalls = fetchMock.mock.calls.filter(([input]) => !String(input).startsWith(baseUrl));
    expect(upstreamCalls).toHaveLength(1);
  });
});
