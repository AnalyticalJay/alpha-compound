import { chromium } from "@playwright/test";

const baseUrl = process.env.CATALOGUE_BASE_URL ?? "http://127.0.0.1:3000";
const mobileViewport = process.env.CATALOGUE_VIEWPORT === "mobile";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: mobileViewport ? { width: 390, height: 844 } : { width: 1280, height: 720 },
});

async function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectResultCount(expected) {
  const countLabel = page.getByText(`${expected} results`, { exact: true }).first();
  await countLabel.waitFor({ state: "attached", timeout: 10_000 });
  await page.getByTestId("product-card").first().waitFor({ state: "attached", timeout: 10_000 });
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

async function chooseFilter(actionName) {
  if (mobileViewport) {
    await page.getByRole("button", { name: /Filters(?: \d+)?/i }).click();
    if (actionName instanceof RegExp && /Filter HD Labs/i.test(actionName.source)) {
      await page.getByRole("button", { name: "HD Labs", exact: true }).click();
      await page.getByRole("button", { name: "Close filters" }).click();
      return;
    }
    if (actionName instanceof RegExp && /Browse BP Pharma/i.test(actionName.source)) {
      await page.getByRole("button", { name: "BP Pharma", exact: true }).click();
      await page.getByRole("button", { name: "Close filters" }).click();
      return;
    }
  }
  await page.getByRole("button", { name: actionName, exact: true }).click();
  if (mobileViewport) await page.getByRole("button", { name: "Close filters" }).click();
}

async function verifyFilter({ actionName, expected }) {
  await page.goto(`${baseUrl}/products`, { waitUntil: "networkidle" });
  await expectResultCount(230);
  await assert(await page.getByTestId("product-card").count() === 12, "Expected the initial catalogue batch to contain 12 products");

  if (actionName) {
    await chooseFilter(actionName);
    await expectResultCount(expected);
    await assert(
      await page.getByTestId("product-card").count() === Math.min(12, expected),
      `Expected a filtered catalogue to reset to its first batch of ${Math.min(12, expected)} products`,
    );
  }

  await revealAll(expected);
  await assert(await page.getByRole("button", { name: /Load \d+ more products/i }).count() === 0, "Load more remained after all matching products were displayed");
}

try {
  await verifyFilter({ expected: 230 });
  await verifyFilter({ actionName: /Filter HD Labs/i, expected: 112 });
  await verifyFilter({ actionName: /Browse BP Pharma/i, expected: 112 });

  const categories = [
    { name: "INJECTABLES", expected: 50 },
    { name: "ORALS", expected: 29 },
    { name: "SARMS", expected: 19 },
    { name: "PEPTIDES", expected: 51 },
    { name: "FAT LOSS", expected: 13 },
  ];
  for (const category of categories) {
    await verifyFilter({ actionName: category.name, expected: category.expected });
  }

  const viewportLabel = mobileViewport ? "390px mobile" : "desktop";
  console.log(`Verified ${viewportLabel} catalogue filters: All 230, HD Labs 112, BP Pharma 112; Injectables 50, Orals 29, SARMS 19, Peptides 51, Fat Loss 13.`);
} finally {
  await browser.close();
}
