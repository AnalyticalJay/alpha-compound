import { chromium } from "@playwright/test";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3000";
const paths = ["/", "/products"];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const results = [];

for (const path of paths) {
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const transferSize = resources.reduce((total, resource) => total + resource.transferSize, 0);
    return {
      domContentLoadedMs: Math.round(navigation?.domContentLoadedEventEnd ?? 0),
      loadMs: Math.round(navigation?.loadEventEnd ?? 0),
      resourceCount: resources.length,
      transferBytes: transferSize,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  results.push({ path, status: response?.status() ?? null, ...metrics });
}

await browser.close();
console.log(JSON.stringify({ baseUrl, results }, null, 2));
