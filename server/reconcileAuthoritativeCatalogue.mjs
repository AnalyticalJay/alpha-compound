import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { and, eq, inArray } from "drizzle-orm";
import { cartItems, categories, orderItems, productImages, products } from "../drizzle/schema";
import { getDb } from "./db";
import { matchRetailPrices, normalizePriceName, parseRetailPrice } from "../shared/retailPriceImport";

const apply = process.argv.includes("--apply");
const basePath = "/home/ubuntu/alpha-compound/imports/pricing-202608";
const reportPath = "/home/ubuntu/alpha-compound/authoritative-catalogue-reconciliation-report.json";
const sources = [
  { sourceTab: "HD", path: `${basePath}/hd.csv` },
  { sourceTab: "BP", path: `${basePath}/bp.csv` },
  { sourceTab: "PHARMA", path: `${basePath}/pharma.csv` },
];

const categoryMap = {
  HD: {
    "AMPS": "AMPS",
    "PEPTIDES": "PEPTIDES",
    "INJECTABLES": "INJECTABLES",
    "ORALS": "ORALS",
    "SARMS": "SARMS",
    "SUPER SERIES": "SUPER SERIES",
    "FAT LOSS": "FAT LOSS",
    "POST CYCLE": "POST CYCLE",
  },
  BP: {
    "ANTI-ESTROGENS AND POST CYCLE THERAPY": "POST CYCLE",
    "FAT LOSS": "FAT LOSS",
    "INJECTABLES": "INJECTABLES",
    "ORALS": "ORALS",
    "PEPTIDES": "PEPTIDES",
    "SARMS": "SARMS",
    "ANCILLARIES": "ANCILLARIES",
  },
  PHARMA: { "PHARMA": "PHARMA" },
};

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else value += character;
  }
  values.push(value.trim());
  return values;
}

function cleanName(value) {
  return value.replace(/^\s*"+|"+\s*$/g, "").replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return cleanName(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 220);
}

function dosageFromName(value) {
  return value.match(/\b\d+(?:\.\d+)?\s*(?:MG|MCG|ML|IU)\b/i)?.[0]?.replace(/\s+/g, "") ?? null;
}

function isHeader(productName, wholesale, retail) {
  return productName && !wholesale && !retail && /^[A-Z0-9 &/()+-]+:$/.test(productName.trim());
}

async function readSourceRows({ sourceTab, path }) {
  const content = await readFile(path, "utf8");
  let currentHeader = null;
  const rows = [];
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    const [rawName = "", wholesale = "", retailRaw = ""] = parseCsvLine(line);
    const productName = cleanName(rawName);
    if (isHeader(productName, wholesale, retailRaw)) {
      currentHeader = productName.replace(/:$/, "");
      continue;
    }
    const retailPrice = parseRetailPrice(retailRaw);
    if (!productName || !retailPrice || productName.toUpperCase() === "PRODUCT") continue;
    rows.push({ sourceTab, productName, retailPrice, sourceRow: index + 1, sourceCategory: currentHeader });
  }
  return rows;
}

function resolveUserConfirmedRetail(rows) {
  const result = [];
  const seen = new Set();
  for (const row of rows) {
    const key = `${row.sourceTab}:${normalizePriceName(row.productName)}`;
    if (key === "HD:CLENBUTEROL") {
      if (row.retailPrice !== "350.00" || seen.has(key)) continue;
    }
    if (seen.has(`${key}:${row.retailPrice}`)) continue;
    seen.add(`${key}:${row.retailPrice}`);
    result.push(row);
  }
  return result;
}

const db = await getDb();
if (!db) throw new Error("Database not available");

const sourceRows = resolveUserConfirmedRetail((await Promise.all(sources.map(readSourceRows))).flat());
const catalogue = await db.select({ id: products.id, name: products.name, price: products.price, stockQuantity: products.stockQuantity, categoryId: products.categoryId, categoryName: categories.name })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .where(eq(products.isActive, true));
const matching = matchRetailPrices(sourceRows, catalogue);

const report = {
  mode: apply ? "apply" : "dry-run",
  sourceProductRows: sourceRows.length,
  matchedPriceUpdates: [],
  unchangedPrices: [],
  productsToAdd: matching.unmatchedRows,
  productsToRemove: [],
  preservedOrderHistoryProducts: [],
  conflictingPrices: matching.conflictingPrices,
  imageCoverage: null,
};

for (const match of matching.matches) {
  const current = catalogue.find((product) => product.id === match.product.id);
  if (!current) continue;
  const payload = { productId: current.id, productName: current.name, retailPrice: match.row.retailPrice, sourceTab: match.row.sourceTab, sourceName: match.row.productName };
  if (String(current.price) === match.row.retailPrice) {
    report.unchangedPrices.push(payload);
  } else {
    if (apply) await db.update(products).set({ price: match.row.retailPrice }).where(eq(products.id, current.id));
    report.matchedPriceUpdates.push(payload);
  }
}

const sourceMatchedIds = new Set(matching.matches.map((match) => match.product.id));
const removalCandidates = catalogue.filter((product) => !sourceMatchedIds.has(product.id));

if (apply) {
  const activeCategories = await db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories);
  const byCategoryName = new Map(activeCategories.map((category) => [category.name.toUpperCase(), category]));
  for (const row of matching.unmatchedRows) {
    const mappedCategoryName = categoryMap[row.sourceTab]?.[row.sourceCategory] ?? row.sourceTab;
    let category = byCategoryName.get(mappedCategoryName.toUpperCase());
    if (!category) {
      const categorySlug = `${slugify(mappedCategoryName)}-${row.sourceTab.toLowerCase()}`;
      const inserted = await db.insert(categories).values({ name: mappedCategoryName, slug: categorySlug, description: null, isActive: true });
      category = { id: Number(inserted[0].insertId), name: mappedCategoryName, slug: categorySlug };
      byCategoryName.set(mappedCategoryName.toUpperCase(), category);
    }
    let slug = slugify(row.productName);
    const existingSlug = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    if (existingSlug.length) slug = `${slug}-${row.sourceTab.toLowerCase()}-${createHash("sha1").update(row.productName).digest("hex").slice(0, 6)}`;
    const inserted = await db.insert(products).values({
      name: row.productName,
      slug,
      description: `Listed in the authoritative ${row.sourceTab} Retail Price list. Refer to the product label for formulation and use information.`,
      dosageInfo: dosageFromName(row.productName),
      categoryId: category.id,
      price: row.retailPrice,
      stockQuantity: 0,
      isActive: true,
      isFeatured: false,
    });
    report.productsToAdd.push({ ...row, status: "created", productId: Number(inserted[0].insertId), category: category.name });
  }

  for (const product of removalCandidates) {
    const [orderReference] = await db.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.productId, product.id)).limit(1);
    await db.update(categories).set({ promotedProductId: null }).where(eq(categories.promotedProductId, product.id));
    await db.delete(cartItems).where(eq(cartItems.productId, product.id));
    if (orderReference) {
      await db.update(products).set({ isActive: false }).where(eq(products.id, product.id));
      report.preservedOrderHistoryProducts.push({ productId: product.id, productName: product.name, action: "deactivated" });
    } else {
      await db.delete(productImages).where(eq(productImages.productId, product.id));
      await db.delete(products).where(eq(products.id, product.id));
      report.productsToRemove.push({ productId: product.id, productName: product.name, action: "deleted" });
    }
  }
} else {
  for (const product of removalCandidates) report.productsToRemove.push({ productId: product.id, productName: product.name, action: "delete_or_deactivate_after_dependency_check" });
}

const [coverage] = await db.execute(`
  SELECT
    COUNT(*) AS activeProducts,
    SUM(CASE WHEN p.price > 0 THEN 1 ELSE 0 END) AS pricedProducts,
    SUM(CASE WHEN primaryImage.productId IS NOT NULL THEN 1 ELSE 0 END) AS productsWithPrimaryImage
  FROM products p
  LEFT JOIN (SELECT productId FROM product_images WHERE isPrimary = 1 GROUP BY productId) primaryImage ON primaryImage.productId = p.id
  WHERE p.isActive = 1
`);
report.imageCoverage = coverage;

await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  mode: report.mode,
  sourceRows: report.sourceProductRows,
  priceUpdates: report.matchedPriceUpdates.length,
  unchangedPrices: report.unchangedPrices.length,
  productsToAdd: matching.unmatchedRows.length,
  productsToRemove: removalCandidates.length,
  conflicts: report.conflictingPrices.length,
  reportPath,
}, null, 2));
process.exit(0);
