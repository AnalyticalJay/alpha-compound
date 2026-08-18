import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { productImages, products } from "../drizzle/schema";
import { getDb, addProductImage } from "./db";
import { storagePut } from "./storage";

const INPUT_PATH = "/home/ubuntu/all_missing_image_research.json";
const REPORT_PATH = "/home/ubuntu/alpha-compound/catalogue-image-import-report.json";
const apply = process.argv.includes("--apply");
const manuallyExcludedProductIds = [30043]; // Source asset cannot prove both 5mg and 20mg Cialis variants.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45_000) });
      if (response.ok || response.status < 500 || attempt === attempts) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(attempt * 500);
  }
  throw lastError ?? new Error("Image request failed");
}

function imageExtension(url, contentType) {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return "jpg";
  const pathname = new URL(url).pathname;
  const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() || "jpg";
}

const research = JSON.parse(await readFile(INPUT_PATH, "utf8"));
const db = await getDb();
const usedUrls = new Set();
const report = { mode: apply ? "apply" : "dry-run", imported: [], skipped: [], unresolved: [], unavailable: [] };

for (const candidate of research) {
  if (candidate.matchStatus !== "verified" || !candidate.directImageUrl) {
    report.unresolved.push({ productId: candidate.productId, productName: candidate.productName, reason: candidate.reason });
    continue;
  }
  if (manuallyExcludedProductIds.includes(candidate.productId)) {
    report.skipped.push({ productId: candidate.productId, productName: candidate.productName, reason: "manually_excluded_for_variant_safety" });
    continue;
  }
  if (!candidate.directImageUrl.startsWith("https://") || usedUrls.has(candidate.directImageUrl)) {
    report.skipped.push({ productId: candidate.productId, productName: candidate.productName, reason: "duplicate_or_non_https_source" });
    continue;
  }
  usedUrls.add(candidate.directImageUrl);

  const [product] = await db.select({ id: products.id, slug: products.slug, name: products.name })
    .from(products)
    .where(eq(products.id, candidate.productId));
  if (!product) {
    report.skipped.push({ productId: candidate.productId, productName: candidate.productName, reason: "product_not_found" });
    continue;
  }
  const existingPrimary = await db.select({ id: productImages.id })
    .from(productImages)
    .where(eq(productImages.productId, product.id));
  if (existingPrimary.length) {
    report.skipped.push({ productId: product.id, productName: product.name, reason: "image_already_exists" });
    continue;
  }

  let response;
  try {
    response = await fetchWithRetry(candidate.directImageUrl);
  } catch (error) {
    report.unavailable.push({ productId: product.id, productName: product.name, imageUrl: candidate.directImageUrl, reason: error instanceof Error ? error.message : "network_error" });
    continue;
  }
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.startsWith("image/")) {
    report.unavailable.push({ productId: product.id, productName: product.name, imageUrl: candidate.directImageUrl, reason: `invalid_image_response_${response.status}_${contentType}` });
    continue;
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 15 * 1024 * 1024) {
    report.unavailable.push({ productId: product.id, productName: product.name, imageUrl: candidate.directImageUrl, reason: "empty_or_oversized_image" });
    continue;
  }
  if (!apply) {
    report.imported.push({ productId: product.id, productName: product.name, status: "ready", sourcePageUrl: candidate.sourcePageUrl, imageUrl: candidate.directImageUrl });
    continue;
  }

  const extension = imageExtension(candidate.directImageUrl, contentType);
  const fingerprint = createHash("sha1").update(candidate.directImageUrl).digest("hex").slice(0, 10);
  const upload = await storagePut(`products/catalogue-research/${product.slug}_${fingerprint}.${extension}`, bytes, contentType);
  await addProductImage({ productId: product.id, imageUrl: upload.url, imageKey: upload.key, isPrimary: true });
  report.imported.push({ productId: product.id, productName: product.name, status: "primary_uploaded", sourcePageUrl: candidate.sourcePageUrl, imageUrl: upload.url });
}

await writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ mode: report.mode, imported: report.imported.length, skipped: report.skipped.length, unresolved: report.unresolved.length, unavailable: report.unavailable.length, reportPath: REPORT_PATH }, null, 2));
process.exit(0);

