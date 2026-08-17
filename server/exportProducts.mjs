import { getDb } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { writeFileSync } from "fs";

const db = await getDb();
const rows = await db.select({
  id: products.id,
  name: products.name,
  description: products.description,
  dosageInfo: products.dosageInfo,
}).from(products).where(eq(products.isActive, true)).orderBy(products.name);

writeFileSync("/home/ubuntu/all_products.json", JSON.stringify(rows, null, 2));
console.log(`Exported ${rows.length} products`);
process.exit(0);
