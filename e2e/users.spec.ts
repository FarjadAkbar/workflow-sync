import { test, expect } from "@playwright/test";

test.describe("users administration page", () => {
  test("authenticated admin can open the users page", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByText("Users administration")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Invite new user")).toBeVisible();
  });
});
