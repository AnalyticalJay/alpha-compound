import { readFile, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { productImages, products } from "../drizzle/schema";
import { addProductImage, getDb } from "./db";
import { storagePut } from "./storage";
import { BP_IMAGE_ASSIGNMENTS, validateBpImageAssignments } from "../shared/bpImageImport";

const sourceDirectory = "/home/ubuntu/upload";
const reportPath = "/home/ubuntu/alpha-compound/bp-pharma-image-import-report.json";
const apply = process.argv.includes("--apply");
const validation = validateBpImageAssignments(BP_IMAGE_ASSIGNMENTS);

if (validation.duplicateFiles.length || validation.duplicateProducts.length) {
  throw new Error("BP image assignment configuration contains duplicates");
}

const db = await getDb();
if (!db) throw new Error("Database not available");

const report = { mode: apply ? "apply" : "dry-run", uploaded: [], skipped: [], missing: [] };

for (const assignment of BP_IMAGE_ASSIGNMENTS) {
  const [product] = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(eq(products.slug, assignment.productSlug))
    .limit(1);

  if (!product) {
    report.missing.push({ ...assignment, reason: "product_not_found" });
    continue;
  }

  const existingPrimary = await db
    .select({ id: productImages.id })
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .limit(1);

  if (existingPrimary[0]) {
    report.skipped.push({ ...assignment, productName: product.name, reason: "existing_image" });
    continue;
  }

  if (!apply) {
    report.uploaded.push({ ...assignment, productName: product.name, status: "ready" });
    continue;
  }

  const source = await readFile(`${sourceDirectory}/${assignment.fileName}`);
  const uploaded = await storagePut(`products/bp-pharma/${assignment.productSlug}.jpeg`, source, "image/jpeg");
  await addProductImage({ productId: product.id, imageUrl: uploaded.url, imageKey: uploaded.key, isPrimary: true });
  report.uploaded.push({ ...assignment, productName: product.name, imageUrl: uploaded.url, status: "uploaded" });
}

await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ mode: report.mode, uploaded: report.uploaded.length, skipped: report.skipped.length, missing: report.missing.length, reportPath }, null, 2));
process.exit(0);
