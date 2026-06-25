import { test, expect } from "@playwright/test";

test.describe("projects page", () => {
  test("authenticated admin can open the projects page", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL(/projects/);
    await expect(page.getByText("Create New Project")).toBeVisible({ timeout: 30_000 });
  });
});
