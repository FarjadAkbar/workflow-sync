import { test, expect } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "securepassword123";

test.describe("auth", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("login with valid credentials", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByLabel("E-mail")).toBeVisible();

    await page.getByLabel("E-mail").fill(adminEmail);
    await page.getByLabel("Password").fill(adminPassword);
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/auth/callback/credentials") && res.status() === 200,
        { timeout: 60_000 }
      ),
      page.getByRole("button", { name: "Login" }).click(),
    ]);

    await expect(page).toHaveURL("/", { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("E-mail").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/sign-in/);
  });
});
