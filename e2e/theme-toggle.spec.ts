import { expect, test } from "@playwright/test";

test.describe("persistent light and dark mode", () => {
  test("storefront toggle changes the document theme and survives reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: "Switch to light mode" }).first().click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.evaluate(() => localStorage.getItem("theme"))).resolves.toBe("light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page).toHaveScreenshot("light-storefront-home.png", { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.01 });
  });

  test("admin theme control is available at a 390px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setExtraHTTPHeaders({ "x-e2e-role": "admin" });
    await page.goto("/admin");
    const mobileToggle = page.getByRole("button", { name: "Switch to light mode" }).last();
    await expect(mobileToggle).toBeVisible();
    await mobileToggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page).toHaveScreenshot("light-mobile-admin-dashboard.png", { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.01 });
  });

  test("mobile storefront returns to the high-contrast dark theme from a stored light preference", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Switch to dark mode" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Switch to dark mode" }).first().click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page).toHaveScreenshot("dark-mobile-storefront-home.png", { animations: "disabled", fullPage: false, maxDiffPixelRatio: 0.01 });
  });

  test("uses the branded dark default when no explicit user preference exists", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => localStorage.removeItem("theme"));
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });
});
