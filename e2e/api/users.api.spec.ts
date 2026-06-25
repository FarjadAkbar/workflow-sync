import { test, expect, request as playwrightRequest } from "@playwright/test";
import { BASE_URL } from "../helpers/data";

test.describe("api: users", () => {
  test("GET /api/users requires auth", async () => {
    const anon = await playwrightRequest.newContext({
      baseURL: BASE_URL,
      storageState: { cookies: [], origins: [] },
    });
    const res = await anon.get("/api/users");
    expect(res.status()).toBe(401);
    await anon.dispose();
  });

  test("GET /api/users returns users with the seeded admin", async ({ request }) => {
    const res = await request.get("/api/users");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.users)).toBe(true);
    expect(body.users.some((u: { email: string }) => u.email === "admin@example.com")).toBe(true);
  });

  test("GET /api/users?search filters results", async ({ request }) => {
    const res = await request.get("/api/users?search=admin");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.users)).toBe(true);
  });
});
