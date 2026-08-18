import { getDb } from "./db";
import { productImages, products, categories } from "../drizzle/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { writeFileSync } from "node:fs";

const db = await getDb();
const rows = await db
  .select({
    id: products.id,
    name: products.name,
    slug: products.slug,
    dosageInfo: products.dosageInfo,
    category: categories.name,
  })
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .leftJoin(
    productImages,
    and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)),
  )
  .where(and(eq(products.isActive, true), isNull(productImages.id)))
  .orderBy(products.id);

writeFileSync(
  "/home/ubuntu/missing_product_images.json",
  JSON.stringify(rows, null, 2),
);
console.log(`Exported ${rows.length} products without primary images`);
process.exit(0);
