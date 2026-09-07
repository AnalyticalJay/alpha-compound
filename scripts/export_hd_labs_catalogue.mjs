import { getDb } from "../server/db.ts";
import { products, categories } from "../drizzle/schema.ts";
import { eq, and } from "drizzle-orm";
import { writeFileSync } from "node:fs";

const db = await getDb();
const rows = await db.select({
  id: products.id,
  name: products.name,
  slug: products.slug,
  brand: products.brand,
  description: products.description,
  dosageInfo: products.dosageInfo,
  categoryId: products.categoryId,
  categoryName: categories.name,
  price: products.price,
  stockQuantity: products.stockQuantity,
  isActive: products.isActive,
}).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(and(eq(products.isActive, true), eq(products.brand, "hd_labs"))).orderBy(products.name);

writeFileSync("/home/ubuntu/alpha-compound/hd_labs_catalogue_export.json", JSON.stringify(rows, null, 2));
console.log(JSON.stringify({ count: rows.length, categories: [...new Set(rows.map((row) => row.categoryName).filter(Boolean))] }, null, 2));
