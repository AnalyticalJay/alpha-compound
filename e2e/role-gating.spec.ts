import { expect, test } from "@playwright/test";

test.describe("customer and administrator browser role flows", () => {
  test("anonymous visitors are sent to a sign-in gate for customer data and denied administrator access", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: "Sign In Required" })).toBeVisible();

    await page.goto("/admin/categories");
    await expect(page.getByText("Admin access required")).toBeVisible();
    await expect(page.getByText("Home category promotion")).toHaveCount(0);
  });

  test("isolated approved customer session can view account data but not administrator routes", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-e2e-role": "customer" });
    await page.goto("/account");
    await expect(page.getByText(/My Account|Account Dashboard/i).first()).toBeVisible();

    await page.goto("/admin/categories");
    await expect(page.getByText("Admin access required")).toBeVisible();
  });

  test("isolated administrator session can open read-only category promotion controls", async ({ page }) => {
    await page.setExtraHTTPHeaders({ "x-e2e-role": "admin" });
    await page.goto("/admin/categories");
    await expect(page.getByRole("heading", { name: /Category Management/i })).toBeVisible();
    await expect(page.getByText("Home category promotion").first()).toBeVisible();
    await expect(page.getByRole("combobox", { name: /Promoted product for/i }).first()).toBeVisible();
  });
});
