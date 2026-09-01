import { getDb } from "../server/db.ts";
import { products, categories } from "../drizzle/schema.ts";
import { eq, asc } from "drizzle-orm";
import { writeFile } from "node:fs/promises";

const db = await getDb();
const rows = await db.select({
  id: products.id,
  name: products.name,
  slug: products.slug,
  description: products.description,
  dosageInfo: products.dosageInfo,
  categoryId: products.categoryId,
  categoryName: categories.name,
  brand: products.brand,
}).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(eq(products.isActive, true)).orderBy(asc(products.id));
await writeFile("/home/ubuntu/category-audit-input.json", JSON.stringify(rows, null, 2));
console.log(`Exported ${rows.length} active products`);
