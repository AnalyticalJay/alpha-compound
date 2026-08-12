import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import { storagePut } from "./storage.ts";
import {
  getHdSourceAssetId,
  getHdSourceImageUrl,
  matchHdSourceToProduct,
  normalizeHdSourceName,
} from "../shared/hdImageImport.ts";

const SOURCE_FILES = {
  injectables: "/home/ubuntu/upload/hdlabs-injectables-source.json",
  orals: "/home/ubuntu/upload/hdlabs-oral-source.json",
};

function sourceFileExtension(url) {
  const decoded = decodeURIComponent(String(url));
  return decoded.match(/\.([a-z0-9]{2,5})(?:$|[?#])/i)?.[1]?.toLowerCase() ?? "png";
}

async function parseSourceItems() {
  const [injectablesRaw, oralsRaw] = await Promise.all([
    fs.readFile(SOURCE_FILES.injectables, "utf8"),
    fs.readFile(SOURCE_FILES.orals, "utf8"),
  ]);
  const injectables = JSON.parse(injectablesRaw);
  const orals = JSON.parse(oralsRaw);
  return [
    ...injectables.products.map((item) => ({ source: "injectables", sourceName: item.name, imageUrl: item.imageUrl })),
    ...orals.items.map((item) => ({ source: "orals", sourceName: item.source_name, imageUrl: item.image_url })),
  ];
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const sourceItems = await parseSourceItems();
  const sourceNameCounts = new Map();
  for (const item of sourceItems) {
    const key = normalizeHdSourceName(item.sourceName);
    sourceNameCounts.set(key, (sourceNameCounts.get(key) ?? 0) + 1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.query(`
    SELECT p.id, p.name, p.slug, p.categoryId, c.name AS categoryName
    FROM products p
    LEFT JOIN categories c ON c.id = p.categoryId
    WHERE p.isActive = 1
  `);
  const products = rows;
  const report = [];

  for (const item of sourceItems) {
    const match = matchHdSourceToProduct(item, products, sourceNameCounts);
    const sourceImageUrl = getHdSourceImageUrl(item.sourceName, item.imageUrl);
    const sourceImageId = getHdSourceAssetId(item.sourceName, item.imageUrl);
    const result = {
      source: item.source,
      sourceName: item.sourceName,
      sourceImageId,
      sourceImageUrl,
      status: match.status,
      score: match.score,
      reason: "reason" in match ? match.reason : null,
      productId: match.product?.id ?? null,
      productName: match.product?.name ?? null,
      productSlug: match.product?.slug ?? null,
      action: "not-uploaded",
    };

    if (match.status === "matched" && !dryRun) {
      const [existingRows] = await connection.query(
        "SELECT id, imageUrl, imageKey, isPrimary FROM product_images WHERE productId = ?",
        [match.product.id],
      );
      const existing = existingRows;
      const duplicate = sourceImageId && existing.find((image) => String(image.imageKey ?? "").includes(sourceImageId));
      if (duplicate) {
        result.action = "already-present";
      } else {
        const response = await fetch(sourceImageUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${sourceImageUrl}: ${response.status}`);
        const contentType = response.headers.get("content-type")?.split(";")[0] || "image/png";
        const bytes = Buffer.from(await response.arrayBuffer());
        const extension = sourceFileExtension(sourceImageUrl);
        const proposedKey = `products/${match.product.id}/hd-labs-${sourceImageId ?? normalizeHdSourceName(item.sourceName)}-${match.product.slug}.${extension}`;
        const stored = await storagePut(proposedKey, bytes, contentType);
        const isPrimary = !existing.some((image) => image.isPrimary === 1 || image.isPrimary === true);
        await connection.execute(
          "INSERT INTO product_images (productId, imageUrl, imageKey, isPrimary) VALUES (?, ?, ?, ?)",
          [match.product.id, stored.url, stored.key, isPrimary ? 1 : 0],
        );
        result.action = isPrimary ? "uploaded-primary" : "uploaded-secondary";
      }
    }

    report.push(result);
    console.log(JSON.stringify(result));
  }

  await connection.end();
  const summary = {
    dryRun,
    sourceItems: report.length,
    matched: report.filter((item) => item.status === "matched").length,
    review: report.filter((item) => item.status === "review").length,
    unmatched: report.filter((item) => item.status === "unmatched").length,
    uploaded: report.filter((item) => item.action.startsWith("uploaded")).length,
    alreadyPresent: report.filter((item) => item.action === "already-present").length,
    reportPath: "/home/ubuntu/alpha-compound/hd-labs-image-import-report.json",
  };
  await fs.writeFile(summary.reportPath, JSON.stringify({ summary, items: report }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
