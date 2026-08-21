import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { productImages, products } from "../drizzle/schema";
import { selectFinalGapImageCandidate } from "../shared/finalGapImageSelection";
import { addProductImage, getDb } from "./db";
import { storagePut } from "./storage";

const inputPath = "/home/ubuntu/alpha-compound/imports/final-gap-image-research.json";
const reportPath = "/home/ubuntu/alpha-compound/final-gap-catalogue-image-import-report.json";
const apply = process.argv.includes("--apply");
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      if (response.ok || response.status < 500 || attempt === attempts) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(attempt * 750);
  }
  throw lastError ?? new Error("Image request failed");
}

function extension(url, contentType) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("gif")) return "gif";
  return new URL(url).pathname.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || "jpg";
}

const research = JSON.parse(await readFile(inputPath, "utf8")).results.map((entry) => entry.output);
const db = await getDb();
if (!db) throw new Error("Database not available");

const report = {
  mode: apply ? "apply" : "dry-run",
  imported: [],
  ready: [],
  skipped: [],
  reviewRequired: [],
  unavailable: [],
};

for (const candidate of research) {
  const selection = selectFinalGapImageCandidate(candidate);
  if (!selection.eligible) {
    const bucket = candidate.match_status === "review" ? report.reviewRequired : report.unavailable;
    bucket.push({ productId: candidate.product_id, productName: candidate.product_name, sourcePageUrl: candidate.source_page_url || null, reason: selection.reason || candidate.match_basis });
    continue;
  }

  const [product] = await db.select({ id: products.id, slug: products.slug, name: products.name, isActive: products.isActive })
    .from(products)
    .where(eq(products.id, Number(candidate.product_id)));
  if (!product || !product.isActive) {
    report.skipped.push({ productId: candidate.product_id, reason: product ? "product_inactive" : "product_not_found" });
    continue;
  }

  const existing = await db.select({ id: productImages.id, isPrimary: productImages.isPrimary })
    .from(productImages)
    .where(eq(productImages.productId, product.id));
  if (existing.some((image) => image.isPrimary)) {
    report.skipped.push({ productId: product.id, productName: product.name, reason: "primary_image_already_exists" });
    continue;
  }

  const response = await fetchWithRetry(candidate.direct_image_url).catch(() => null);
  const contentType = response?.headers.get("content-type") || "";
  if (!response?.ok || !contentType.startsWith("image/")) {
    report.unavailable.push({ productId: product.id, productName: product.name, sourcePageUrl: candidate.source_page_url, reason: `invalid_image_response_${response?.status ?? "network"}_${contentType}` });
    continue;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 8_000 || bytes.length > 15 * 1024 * 1024) {
    report.unavailable.push({ productId: product.id, productName: product.name, sourcePageUrl: candidate.source_page_url, reason: "image_size_out_of_bounds" });
    continue;
  }

  if (!apply) {
    report.ready.push({ productId: product.id, productName: product.name, sourcePageUrl: candidate.source_page_url, directImageUrl: candidate.direct_image_url });
    continue;
  }

  const digest = createHash("sha1").update(candidate.direct_image_url).digest("hex").slice(0, 10);
  const upload = await storagePut(
    `products/catalogue-research/final-gap/${product.slug}_${digest}.${extension(candidate.direct_image_url, contentType)}`,
    bytes,
    contentType,
  );
  await addProductImage({ productId: product.id, imageUrl: upload.url, imageKey: upload.key, isPrimary: true });
  report.imported.push({ productId: product.id, productName: product.name, sourcePageUrl: candidate.source_page_url, imageUrl: upload.url });
}

await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  mode: report.mode,
  imported: report.imported.length,
  ready: report.ready.length,
  skipped: report.skipped.length,
  reviewRequired: report.reviewRequired.length,
  unavailable: report.unavailable.length,
  reportPath,
}, null, 2));
process.exit(0);
