import { readFile, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { categories, products } from "../drizzle/schema";
import { getDb } from "./db";
import { matchRetailPrices, parseRetailPrice } from "../shared/retailPriceImport";

const apply = process.argv.includes("--apply");
const basePath = "/home/ubuntu/alpha-compound/imports/pricing-202608";
const reportPath = "/home/ubuntu/alpha-compound/retail-price-import-report.json";
const sources = [
  { sourceTab: "HD", path: `${basePath}/hd.csv` },
  { sourceTab: "BP", path: `${basePath}/bp.csv` },
  { sourceTab: "PHARMA", path: `${basePath}/pharma.csv` },
];

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

async function readSourceRows({ sourceTab, path }) {
  const content = await readFile(path, "utf8");
  return content.split(/\r?\n/).flatMap((line, index) => {
    const [productName = "", , retailRaw = ""] = parseCsvLine(line);
    const retailPrice = parseRetailPrice(retailRaw);
    if (!productName || !retailPrice || productName.toUpperCase() === "PRODUCT") return [];
    return [{ sourceTab, productName, retailPrice, sourceRow: index + 1 }];
  });
}

const db = await getDb();
if (!db) throw new Error("Database not available");

const rows = (await Promise.all(sources.map(readSourceRows))).flat();
const catalogue = await db.select({ id: products.id, name: products.name, price: products.price, stockQuantity: products.stockQuantity, categoryName: categories.name })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .where(eq(products.isActive, true));
const matching = matchRetailPrices(rows, catalogue);

const report = {
  mode: apply ? "apply" : "dry-run",
  sourceRowCount: rows.length,
  matched: [],
  unchanged: [],
  unmatchedRows: matching.unmatchedRows,
  ambiguousRows: matching.ambiguousRows.map(({ row, candidates }) => ({ row, candidates: candidates.map(({ id, name }) => ({ id, name })) })),
  conflictingPrices: matching.conflictingPrices.map(({ product, matches }) => ({
    product: { id: product.id, name: product.name },
    sourceRows: matches.map(({ row }) => ({ sourceTab: row.sourceTab, sourceRow: row.sourceRow, sourceName: row.productName, retailPrice: row.retailPrice })),
  })),
  productsWithoutPriceSource: matching.unmatchedProducts.map(({ id, name }) => ({ id, name })),
};

for (const match of matching.matches) {
  const catalogueProduct = catalogue.find((product) => product.id === match.product.id);
  if (!catalogueProduct) continue;
  const outcome = {
    productId: match.product.id,
    productName: match.product.name,
    sourceTab: match.row.sourceTab,
    sourceName: match.row.productName,
    retailPrice: match.row.retailPrice,
    strategy: match.strategy,
  };
  if (String(catalogueProduct.price) === match.row.retailPrice) {
    report.unchanged.push(outcome);
    continue;
  }
  if (apply) await db.update(products).set({ price: match.row.retailPrice }).where(eq(products.id, match.product.id));
  report.matched.push(outcome);
}

await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  mode: report.mode,
  sourceRows: report.sourceRowCount,
  updatedOrReady: report.matched.length,
  unchanged: report.unchanged.length,
  unmatchedRows: report.unmatchedRows.length,
  ambiguousRows: report.ambiguousRows.length,
  conflictingPrices: report.conflictingPrices.length,
  productsWithoutPriceSource: report.productsWithoutPriceSource.length,
  reportPath,
}, null, 2));
process.exit(0);
