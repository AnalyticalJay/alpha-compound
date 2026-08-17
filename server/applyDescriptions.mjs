import { getDb } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";

const INPUT_PATH = "/home/ubuntu/product_descriptions.json";
const descriptions = JSON.parse(readFileSync(INPUT_PATH, "utf8"));

const db = await getDb();

let updated = 0;
let skipped = 0;
const ids = Object.keys(descriptions);

console.log(`Applying ${ids.length} descriptions to database...`);

for (const id of ids) {
  const desc = descriptions[id];
  if (!desc || desc.trim().length === 0) {
    skipped++;
    continue;
  }
  
  await db.update(products)
    .set({ description: desc })
    .where(eq(products.id, parseInt(id, 10)));
  updated++;
}

console.log(`Done. Updated: ${updated}, Skipped: ${skipped}`);
process.exit(0);
