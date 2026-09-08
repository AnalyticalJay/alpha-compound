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

  it("streams a product object through the auth-independent public image endpoint", async () => {
    const nativeFetch = globalThis.fetch;
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const requestUrl = typeof input === "string" ? input : input.toString();
      if (requestUrl.startsWith(baseUrl)) return nativeFetch(input, init);
      if (requestUrl.includes("presign/get")) {
        return new Response(JSON.stringify({ url: "https://storage.example.test/customer-product.jpg" }), { status: 200 });
      }
      return new Response(Buffer.from("customer-image"), { status: 200, headers: { "content-type": "image/jpeg", "content-length": "14" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetch(`${baseUrl}/api/public-product-image/products/customer-path.jpg`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/jpeg");
    expect(await response.text()).toBe("customer-image");
  });

  it("streams a signed product object same-origin and reuses its short-lived signed URL", async () => {
    const nativeFetch = globalThis.fetch;
    let forgeCalls = 0;
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const requestUrl = typeof input === "string" ? input : input.toString();
      if (requestUrl.startsWith(baseUrl)) return nativeFetch(input, init);
      if (requestUrl.includes("presign/get")) {
        forgeCalls += 1;
        return new Response(JSON.stringify({ url: "https://storage.example.test/product.jpg" }), { status: 200 });
      }
      return new Response(Buffer.from("image-bytes"), { status: 200, headers: { "content-type": "image/png", "content-length": "11" } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = await fetch(`${baseUrl}/manus-storage/products/cache-check.jpg`);
    const second = await fetch(`${baseUrl}/manus-storage/products/cache-check.jpg`);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.headers.get("content-type")).toContain("image/png");
    expect(first.headers.get("cache-control")).toContain("max-age=300");
    expect(await first.text()).toBe("image-bytes");
    expect(await second.text()).toBe("image-bytes");
    const upstreamCalls = fetchMock.mock.calls.filter(([input]) => !String(input).startsWith(baseUrl));
    expect(upstreamCalls).toHaveLength(3);
    expect(forgeCalls).toBe(1);
  });
});
