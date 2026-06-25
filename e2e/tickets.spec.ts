import { test, expect } from "@playwright/test";

test.describe("tickets page", () => {
  test("authenticated admin can open the tickets page", async ({ page }) => {
    await page.goto("/tickets");
    await expect(page.getByRole("heading", { name: "Tickets" })).toBeVisible({ timeout: 30_000 });
  });
});
