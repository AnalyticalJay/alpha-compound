import type { Express } from "express";
import { ENV } from "./env";

type CachedSignedUrl = {
  url: string;
  expiresAt: number;
};

// Product images are public, but each storage URL is signed. Keep a short-lived
// server cache so a catalogue grid does not request hundreds of signatures at once.
const PRODUCT_URL_CACHE_TTL_MS = 2 * 60 * 1000;
const MIN_PRESIGN_INTERVAL_MS = 125;
const signedUrlCache = new Map<string, CachedSignedUrl>();
const pendingSignedUrls = new Map<string, Promise<string>>();
let signingQueue: Promise<void> = Promise.resolve();
let lastSigningStart = 0;

const pause = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

function enqueueSigningRequest<T>(request: () => Promise<T>) {
  const queued = signingQueue.catch(() => undefined).then(async () => {
    const waitForRateLimit = Math.max(0, MIN_PRESIGN_INTERVAL_MS - (Date.now() - lastSigningStart));
    if (waitForRateLimit > 0) await pause(waitForRateLimit);
    lastSigningStart = Date.now();
    return request();
  });
  signingQueue = queued.then(() => undefined, () => undefined);
  return queued;
}

async function getSignedUrl(key: string) {
  const now = Date.now();
  const cached = signedUrlCache.get(key);
  if (cached && cached.expiresAt > now) return cached.url;

  const pending = pendingSignedUrls.get(key);
  if (pending) return pending;

  const request = enqueueSigningRequest(async () => {
    const forgeUrl = new URL(
      "v1/storage/presign/get",
      ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
    );
    forgeUrl.searchParams.set("path", key);

    let forgeResp = await fetch(forgeUrl, {
      headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
    });

    // One bounded retry handles a transient provider throttle without exposing
    // product images to an error page or turning rapid scrolling into a retry storm.
    if (forgeResp.status === 429) {
      await pause(750);
      forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });
    }

    if (!forgeResp.ok) {
      const body = await forgeResp.text().catch(() => "");
      console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
      throw new Error("Storage backend error");
    }

    const { url } = (await forgeResp.json()) as { url: string };
    if (!url) throw new Error("Empty signed URL from backend");

    signedUrlCache.set(key, { url, expiresAt: now + PRODUCT_URL_CACHE_TTL_MS });
    return url;
  });

  pendingSignedUrls.set(key, request);
  try {
    return await request;
  } finally {
    pendingSignedUrls.delete(key);
  }
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    // Financial proof and other order attachments are deliberately served only
    // through an authenticated, signed-download procedure.
    if (key.replace(/^\/+/, "").startsWith("orders/")) {
      res.status(404).end();
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const url = await getSignedUrl(key);
      res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=60");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send(err instanceof Error ? err.message : "Storage proxy error");
    }
  });
}
