import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { productImages, products } from "../drizzle/schema";
import { getDb, addProductImage } from "./db";
import { storagePut } from "./storage";

const inputPath = "/home/ubuntu/second_pass_product_image_research.json";
const reportPath = "/home/ubuntu/alpha-compound/second-pass-catalogue-image-import-report.json";
const apply = process.argv.includes("--apply");
const approvedIds = new Set(["30017", "30021", "30023", "30043", "30084", "30086", "30087", "30093", "30099", "30104", "30109", "60018", "60072"]);
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

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

function extension(url, contentType) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  const pathname = new URL(url).pathname;
  return pathname.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || "jpg";
}

const research = JSON.parse(await readFile(inputPath, "utf8")).results.map((entry) => entry.output);
const db = await getDb();
if (!db) throw new Error("Database not available");
const report = { mode: apply ? "apply" : "dry-run", imported: [], skipped: [], unresolved: [], unavailable: [] };

for (const candidate of research) {
  if (candidate.match_status !== "verified" || !approvedIds.has(candidate.product_id)) {
    report.unresolved.push({ productId: candidate.product_id, reason: candidate.rationale || "not_approved_after_variant_review" });
    continue;
  }
  if (!candidate.direct_image_url.startsWith("https://") || candidate.direct_image_url.includes("files.manuscdn.com")) {
    report.skipped.push({ productId: candidate.product_id, reason: "non_authoritative_direct_image_url" });
    continue;
  }

  const [product] = await db.select({ id: products.id, slug: products.slug, name: products.name })
    .from(products)
    .where(eq(products.id, Number(candidate.product_id)));
  if (!product) {
    report.skipped.push({ productId: candidate.product_id, reason: "product_not_found" });
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
    report.imported.push({ productId: product.id, productName: product.name, status: "ready", sourcePageUrl: candidate.source_page_url, imageUrl: candidate.direct_image_url });
    continue;
  }

  const digest = createHash("sha1").update(candidate.direct_image_url).digest("hex").slice(0, 10);
  const upload = await storagePut(`products/catalogue-research/second-pass/${product.slug}_${digest}.${extension(candidate.direct_image_url, contentType)}`, bytes, contentType);
  await addProductImage({ productId: product.id, imageUrl: upload.url, imageKey: upload.key, isPrimary: true });
  report.imported.push({ productId: product.id, productName: product.name, status: "primary_uploaded", sourcePageUrl: candidate.source_page_url, imageUrl: upload.url });
}

await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ mode: report.mode, imported: report.imported.length, skipped: report.skipped.length, unresolved: report.unresolved.length, unavailable: report.unavailable.length, reportPath }, null, 2));
process.exit(0);

