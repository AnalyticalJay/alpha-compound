import { getDb } from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { OpenAI } from "openai";

const client = new OpenAI();
const BATCH_SIZE = 10;
const OUTPUT_PATH = "/home/ubuntu/product_descriptions.json";

// Load any previously completed descriptions to allow resuming
let completed = {};
if (existsSync(OUTPUT_PATH)) {
  try {
    completed = JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
  } catch {}
}

const db = await getDb();
const allProducts = await db.select({
  id: products.id,
  name: products.name,
  description: products.description,
  dosageInfo: products.dosageInfo,
}).from(products).where(eq(products.isActive, true)).orderBy(products.name);

console.log(`Total active products: ${allProducts.length}`);
console.log(`Already completed: ${Object.keys(completed).length}`);

const remaining = allProducts.filter(p => !completed[String(p.id)]);
console.log(`Remaining to process: ${remaining.length}`);

async function generateBatch(batch) {
  const productList = batch.map(p => {
    const name = String(p.name).replace(/^"|"$/g, "").trim();
    const dosage = String(p.dosageInfo || "").replace(/^"|"$/g, "").trim();
    return `- ID ${p.id}: ${name}${dosage ? ` (${dosage})` : ""}`;
  }).join("\n");

  const resp = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `You write short, original product descriptions for a pharmaceutical/supplement catalogue in South Africa. Each description must be:
- 2-3 sentences, maximum 40 words
- Factual and professional
- Written in YOUR OWN WORDS (not copied from any source)
- State what the product is and its primary benefit/use
- Do NOT include dosage instructions or medical advice
- Do NOT make health claims requiring disclaimers
- For medical supplies (needles, syringes, swabs), describe purpose simply
- For category headers or deal listings, describe the underlying product category

Return a JSON object where keys are product IDs (as strings) and values are the description strings.`
      },
      {
        role: "user",
        content: `Write original short descriptions for these products:\n${productList}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "descriptions",
        strict: true,
        schema: {
          type: "object",
          properties: Object.fromEntries(batch.map(p => [String(p.id), { type: "string" }])),
          required: batch.map(p => String(p.id)),
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(resp.choices[0].message.content);
}

// Process in batches
for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
  const batch = remaining.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(remaining.length / BATCH_SIZE);
  
  console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} products)...`);
  
  try {
    const results = await generateBatch(batch);
    Object.assign(completed, results);
    // Save after each batch for resumability
    writeFileSync(OUTPUT_PATH, JSON.stringify(completed, null, 2));
    console.log(`  ✓ Batch ${batchNum} complete. Total: ${Object.keys(completed).length}/${allProducts.length}`);
  } catch (err) {
    console.error(`  ✗ Batch ${batchNum} failed: ${err.message}`);
    // Continue with next batch
  }
}

console.log(`\nDone. ${Object.keys(completed).length} descriptions saved to ${OUTPUT_PATH}`);
process.exit(0);
