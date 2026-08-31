import { chromium } from "@playwright/test";

const baseUrl = process.env.CATALOGUE_BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

async function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectResultCount(expected) {
  const countLabel = page.getByText(`${expected} results`, { exact: true }).first();
  await countLabel.waitFor({ state: "visible", timeout: 10_000 });
}

async function revealAll(expected) {
  for (let batch = 1; batch <= Math.ceil(expected / 12); batch += 1) {
    const current = await page.getByTestId("product-card").count();
    if (current === expected) return;

    const loadMore = page.getByRole("button", { name: /Load \d+ more products/i });
    await assert(await loadMore.count() === 1, `Expected one Load more button while ${expected - current} products remained`);
    await loadMore.click();
    await page.waitForFunction(
      ({ previousCount }) => document.querySelectorAll('[data-testid="product-card"]').length > previousCount,
      { previousCount: current },
    );
  }

  await assert(await page.getByTestId("product-card").count() === expected, `Expected ${expected} visible product cards after loading all results`);
}

async function verifyFilter({ actionName, expected }) {
  await page.goto(`${baseUrl}/products`, { waitUntil: "networkidle" });
  await expectResultCount(230);
  await assert(await page.getByTestId("product-card").count() === 12, "Expected the initial catalogue batch to contain 12 products");

  if (actionName) {
    await page.getByRole("button", { name: actionName }).click();
    await expectResultCount(expected);
    await assert(await page.getByTestId("product-card").count() === 12, "Expected a filtered catalogue to reset to its first 12 products");
  }

  await revealAll(expected);
  await assert(await page.getByRole("button", { name: /Load \d+ more products/i }).count() === 0, "Load more remained after all matching products were displayed");
}

try {
  await verifyFilter({ expected: 230 });
  await verifyFilter({ actionName: /Filter HD Labs/i, expected: 112 });
  await verifyFilter({ actionName: /Browse BP Pharma/i, expected: 112 });
  console.log("Verified live catalogue filters: All 230, HD Labs 112, BP Pharma 112.");
} finally {
  await browser.close();
}
