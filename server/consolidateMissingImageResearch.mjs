import { readFileSync, writeFileSync } from "node:fs";

const resultsPath = "/home/ubuntu/research_all_missing_product_images.json";
const outputPath = "/home/ubuntu/all_missing_image_research.json";
const manifest = JSON.parse(readFileSync(resultsPath, "utf8"));
const combined = [];

for (const result of manifest.results) {
  const url = result.output?.result_file;
  if (!url) continue;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not retrieve research result for ${result.input}: ${response.status}`);
  const items = await response.json();
  if (!Array.isArray(items)) throw new Error(`Research result for ${result.input} is not an array`);
  combined.push(...items);
}

writeFileSync(outputPath, JSON.stringify(combined, null, 2));
const verified = combined.filter((item) => item.matchStatus === "verified").length;
console.log(`Consolidated ${combined.length} results: ${verified} verified, ${combined.length - verified} unresolved`);
process.exit(0);
