import { writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { productImages, products } from "../drizzle/schema";
import { getDb, addProductImage } from "./db";
import { storagePut } from "./storage";
import { matchBodyPharmSupplierProducts } from "../shared/bodyPharmSupplierMatching";

const supplierIndexUrl = "https://www.anabolicsteroids.co.za/suppliers/body-pharm";
const supplierImageBaseUrl = "https://www.anabolicsteroids.co.za/images/suppliers/body-pharm";
const reportPath = "/home/ubuntu/alpha-compound/body-pharm-supplier-image-report.json";
const apply = process.argv.includes("--apply");

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
    await sleep(500 * attempt);
  }
  throw lastError ?? new Error("Supplier request failed");
}

const indexResponse = await fetchWithRetry(supplierIndexUrl);
if (!indexResponse.ok) throw new Error(`Supplier index request failed (${indexResponse.status})`);
const indexHtml = await indexResponse.text();
const links = [...indexHtml.matchAll(/href=["']([^"']*\/suppliers\/body-pharm\/([^"'/?#]+))["'][^>]*>([^<]+)<\/a>/gi)];
const supplierProducts = [...new Map(links.map((match) => {
  const slug = match[2];
  const title = match[3].replace(/&amp;/g, "&").trim();
  return [slug, {
    title,
    slug,
    productPageUrl: new URL(match[1], supplierIndexUrl).href,
    imageUrl: `${supplierImageBaseUrl}/${slug}.png`,
  }];
})).values()];

const db = await getDb();
if (!db) throw new Error("Database not available");
const catalogueProducts = await db
  .select({ id: products.id, name: products.name, slug: products.slug })
  .from(products)
  .where(eq(products.isActive, true));
const bpProducts = catalogueProducts.filter((product) => product.slug.startsWith("bp-"));
const matches = matchBodyPharmSupplierProducts(supplierProducts, bpProducts);
const report = { mode: apply ? "apply" : "dry-run", imported: [], skipped: [], ambiguous: [], unmatched: [], unavailable: [] };

for (const match of matches) {
  if (match.candidates.length !== 1) {
    const target = match.candidates.length > 1 ? report.ambiguous : report.unmatched;
    target.push({ supplierTitle: match.supplierProduct.title, supplierSlug: match.supplierProduct.slug, candidates: match.candidates.map((candidate) => candidate.slug) });
    continue;
  }

  const product = match.candidates[0];
  const existing = await db
    .select({ id: productImages.id, imageKey: productImages.imageKey, isPrimary: productImages.isPrimary })
    .from(productImages)
    .where(eq(productImages.productId, product.id));
  const supplierPrefix = `products/bp-pharma/supplier/${product.slug}`;
  if (existing.some((image) => image.imageKey.startsWith(supplierPrefix))) {
    report.skipped.push({ supplierTitle: match.supplierProduct.title, productSlug: product.slug, reason: "supplier_image_already_imported" });
    continue;
  }

  let supplierImageUrl = match.supplierProduct.imageUrl;
  let imageResponse;
  try {
    imageResponse = await fetchWithRetry(supplierImageUrl);
  } catch {
    imageResponse = null;
  }
  if (!imageResponse?.ok) {
    const detailResponse = await fetchWithRetry(match.supplierProduct.productPageUrl).catch(() => null);
    if (detailResponse?.ok) {
      const detailHtml = await detailResponse.text();
      const imageMatch = detailHtml.match(/src=["']([^"']*\/images\/suppliers\/body-pharm\/[^"']+)["']/i);
      if (imageMatch) {
        supplierImageUrl = new URL(imageMatch[1], supplierIndexUrl).href;
        imageResponse = await fetchWithRetry(supplierImageUrl).catch(() => null);
      }
    }
  }
  if (!imageResponse?.ok) {
    report.unavailable.push({ supplierTitle: match.supplierProduct.title, productSlug: product.slug, imageUrl: supplierImageUrl, status: imageResponse?.status ?? "network_error" });
    continue;
  }
  let imageBytes;
  try {
    imageBytes = Buffer.from(await imageResponse.arrayBuffer());
  } catch (error) {
    report.unavailable.push({ supplierTitle: match.supplierProduct.title, productSlug: product.slug, imageUrl: supplierImageUrl, status: "body_read_error", reason: error instanceof Error ? error.message : "unknown" });
    continue;
  }
  if (!apply) {
    report.imported.push({ supplierTitle: match.supplierProduct.title, productSlug: product.slug, imageUrl: supplierImageUrl, status: "ready" });
    continue;
  }

  const uploaded = await storagePut(`${supplierPrefix}.png`, imageBytes, imageResponse.headers.get("content-type") || "image/png");
  await addProductImage({
    productId: product.id,
    imageUrl: uploaded.url,
    imageKey: uploaded.key,
    isPrimary: existing.length === 0,
  });
  report.imported.push({ supplierTitle: match.supplierProduct.title, productSlug: product.slug, imageUrl: uploaded.url, status: existing.length === 0 ? "primary_uploaded" : "gallery_uploaded" });
}

await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  mode: report.mode,
  supplierProducts: supplierProducts.length,
  imported: report.imported.length,
  skipped: report.skipped.length,
  ambiguous: report.ambiguous.length,
  unmatched: report.unmatched.length,
  unavailable: report.unavailable.length,
  reportPath,
}, null, 2));
process.exit(0);
