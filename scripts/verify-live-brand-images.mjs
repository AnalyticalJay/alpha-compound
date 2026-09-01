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

async function waitForResultCount(expected) {
  await page.getByText(`${expected} results`, { exact: true }).first().waitFor({ state: "attached", timeout: 10_000 });
  await page.getByTestId("product-card").first().waitFor({ state: "attached", timeout: 10_000 });
}

async function chooseBrand(label, buttonName) {
  await page.goto(`${baseUrl}/products`, { waitUntil: "networkidle" });
  await waitForResultCount(230);
  if (mobileViewport) {
    await page.getByRole("button", { name: /Filters(?: \d+)?/i }).click();
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("button", { name: "Close filters" }).click();
  } else {
    await page.getByRole("button", { name: buttonName, exact: true }).click();
  }
  await waitForResultCount(112);
  await page.getByTestId("product-card").first().waitFor({ state: "attached", timeout: 10_000 });
}

async function loadAllCards(expected) {
  for (let batch = 1; batch <= Math.ceil(expected / 12); batch += 1) {
    const cards = page.getByTestId("product-card");
    const current = await cards.count();
    if (current === expected) return;
    const loadMore = page.getByRole("button", { name: /Load \d+ more products/i });
    await assert(await loadMore.count() === 1, `Expected Load more while ${expected - current} filtered products remained`);
    await loadMore.click();
    await page.waitForFunction(
      ({ previousCount }) => document.querySelectorAll('[data-testid="product-card"]').length > previousCount,
      { previousCount: current },
    );
  }
  await assert(await page.getByTestId("product-card").count() === expected, `Expected ${expected} filtered product cards`);
}

async function assertAllImagesLoaded(expected) {
  const images = page.getByTestId("product-card").locator("img");
  await assert(await images.count() === expected, `Expected one image per filtered product card, got ${await images.count()} for ${expected} cards`);
  for (let index = 0; index < expected; index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => {
      if (!element.complete) {
        element.addEventListener("load", () => undefined, { once: true });
      }
    });
    await page.waitForFunction(
      (position) => {
        const element = document.querySelectorAll('[data-testid="product-card"] img')[position];
        return Boolean(element?.complete && element.naturalWidth > 0);
      },
      index,
      { timeout: 10_000 },
    );
  }
}

try {
  const results = [
    { label: "HD Labs", buttonName: "HD Labs" },
    { label: "BP Pharma", buttonName: "BP Pharma" },
  ];
  for (const brand of results) {
    await chooseBrand(brand.label, brand.buttonName);
    await loadAllCards(112);
    await assertAllImagesLoaded(112);
    console.log(`${brand.label}: 112/112 filtered cards have loaded images`);
  }
  console.log(`${mobileViewport ? "390px mobile" : "desktop"}: all HD Labs and BP Pharma filtered product images loaded successfully.`);
} finally {
  await browser.close();
}
