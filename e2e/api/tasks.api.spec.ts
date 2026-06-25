import { test, expect, request as playwrightRequest } from "@playwright/test";
import { BASE_URL } from "../helpers/data";

test.describe("api: tasks", () => {
  test("GET /api/tasks requires auth", async () => {
    const anon = await playwrightRequest.newContext({
      baseURL: BASE_URL,
      storageState: { cookies: [], origins: [] },
    });
    const res = await anon.get("/api/tasks");
    expect(res.status()).toBe(401);
    await anon.dispose();
  });

  test("GET /api/tasks returns task list for the user", async ({ request }) => {
    const res = await request.get("/api/tasks");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("POST rejects missing title/sprintId", async ({ request }) => {
    const res = await request.post("/api/tasks", { data: { content: "no title or sprint" } });
    expect(res.status()).toBe(400);
  });

  test("GET supports filters (createdByMe)", async ({ request }) => {
    const res = await request.get("/api/tasks?createdByMe=true");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });
});
