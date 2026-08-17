import XLSX from "xlsx";
import { and, eq, inArray } from "drizzle-orm";
import { categories, products } from "../drizzle/schema";
import { getDb } from "../server/db";
import { BP_HEADING_CATEGORY_MAP, categoryKeyFromBpHeading, normalizeBpProduct } from "../shared/bpProductImport";

const workbookPath = "/home/ubuntu/upload/BPPHARMAPRICElIST.xlsx";
const reportPath = "/home/ubuntu/alpha-compound/bp-pharma-import-report.json";
const apply = process.argv.includes("--apply");
const workbook = XLSX.readFile(workbookPath, { cellDates: false });
const categoriesByKey = Object.values(BP_HEADING_CATEGORY_MAP).reduce((result, name) => ({ ...result, [name]: name }), {});
const categoryKeyForName = (name) => String(name).trim().replace(/^"+|"+$/g, "").trim().toUpperCase();

const parsed = [];
for (const sheetName of workbook.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "", raw: false });
  let categoryKey;
  rows.forEach((row, index) => {
    const raw = String(row[0] ?? "").trim().replace(/\s+/g, " ");
    if (!raw) return;
    const heading = categoryKeyFromBpHeading(raw);
    if (heading) {
      categoryKey = heading;
      return;
    }
    if (!categoryKey || /^BP PHARM PRICE LIST/i.test(raw) || !/^BP\s+/i.test(raw)) return;
    parsed.push({ sheetName, row: index + 1, ...normalizeBpProduct(raw, categoryKey) });
  });
}

const duplicateSourceSlugs = parsed.filter((product, index) => parsed.findIndex((candidate) => candidate.slug === product.slug) !== index);
const uniqueProducts = parsed.filter((product, index) => parsed.findIndex((candidate) => candidate.slug === product.slug) === index);
const db = await getDb();
if (!db) throw new Error("Database not available");

const existingCategories = await db.select().from(categories);
const categoryIdByKey = new Map(existingCategories.map((category) => [categoryKeyForName(category.name), category.id]));
const missingCategories = Object.keys(categoriesByKey).filter((categoryKey) => !categoryIdByKey.has(categoryKey));

if (apply) {
  for (const categoryKey of missingCategories) {
    await db.insert(categories).values({ name: categoryKey, slug: categoryKey.toLowerCase().replace(/[^a-z0-9]+/g, "-"), isActive: true });
  }
}

const refreshedCategories = apply && missingCategories.length > 0 ? await db.select().from(categories) : existingCategories;
const refreshedCategoryIdByKey = new Map(refreshedCategories.map((category) => [categoryKeyForName(category.name), category.id]));
const existingRows = uniqueProducts.length
  ? await db.select({ slug: products.slug }).from(products).where(inArray(products.slug, uniqueProducts.map((product) => product.slug)))
  : [];
const existingSlugs = new Set(existingRows.map((row) => row.slug));
const importable = uniqueProducts.filter((product) => !existingSlugs.has(product.slug));

if (apply && importable.length) {
  await db.insert(products).values(
    importable.map((product) => ({
      name: product.name,
      slug: product.slug,
      description: `BP Pharma · ${product.categoryKey}. Source workbook entry: ${product.sourceName}. Price to be configured by an administrator.`,
      dosageInfo: product.dosageInfo,
      categoryId: refreshedCategoryIdByKey.get(product.categoryKey),
      price: "0.00",
      stockQuantity: 0,
      isActive: true,
      isFeatured: false,
    }))
  );
}

const report = {
  mode: apply ? "apply" : "dry-run",
  workbookPath,
  parsedCount: parsed.length,
  importableCount: importable.length,
  importedCount: apply ? importable.length : 0,
  existingSkippedCount: existingSlugs.size,
  missingCategories,
  reviewRows: uniqueProducts.filter((product) => product.reviewReason),
  duplicateRows: duplicateSourceSlugs,
  products: uniqueProducts,
};

await import("node:fs/promises").then(({ writeFile }) => writeFile(reportPath, JSON.stringify(report, null, 2)));
console.log(JSON.stringify({ mode: report.mode, parsedCount: report.parsedCount, importableCount: report.importableCount, importedCount: report.importedCount, reviewCount: report.reviewRows.length, duplicateCount: report.duplicateRows.length, reportPath }, null, 2));
process.exit(0);
