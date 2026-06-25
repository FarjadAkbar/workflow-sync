import { test, expect } from "@playwright/test";

test.describe("dashboard", () => {
  test("shows crm dashboard for authenticated admin", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sales pipeline" })).toBeVisible();
  });
});
