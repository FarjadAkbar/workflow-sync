import { test, expect } from "@playwright/test";

test.describe("leads page", () => {
  test("authenticated admin can open the leads pipeline", async ({ page }) => {
    await page.goto("/leads");
    await expect(page).toHaveURL(/leads/);
    await expect(page.getByRole("heading", { name: "Leads", exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText("New", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Qualified", { exact: true }).first()).toBeVisible();
  });
});
