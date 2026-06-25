import { test, expect, request as playwrightRequest } from "@playwright/test";
import { BASE_URL, unique } from "../helpers/data";

test.describe("api: projects", () => {
  test("GET /api/projects requires auth", async () => {
    const anon = await playwrightRequest.newContext({
      baseURL: BASE_URL,
      storageState: { cookies: [], origins: [] },
    });
    const res = await anon.get("/api/projects");
    expect(res.status()).toBe(401);
    await anon.dispose();
  });

  test("GET /api/projects returns the current user's projects", async ({ request }) => {
    const res = await request.get("/api/projects");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("POST rejects missing required fields", async ({ request }) => {
    const res = await request.post("/api/projects", { data: { description: "no name" } });
    expect(res.status()).toBe(400);
  });

  test("create -> appears in list -> delete (full lifecycle)", async ({ request }) => {
    const name = unique("e2e-project");

    // client: create
    const createRes = await request.post("/api/projects", {
      data: { name, description: "created by e2e", startDate: new Date().toISOString() },
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    expect(created.success).toBe(true);
    const projectId: string = created.data.id;
    expect(projectId).toBeTruthy();

    // server: it is fetchable by id (poll to absorb DB read-after-write lag)
    await expect
      .poll(async () => (await request.get(`/api/projects/${projectId}`)).status(), {
        timeout: 15_000,
      })
      .toBe(200);
    const fetched = await (await request.get(`/api/projects/${projectId}`)).json();
    expect(fetched.data.name).toBe(name);

    // product: it shows up in the list
    await expect
      .poll(
        async () => {
          const list = await (await request.get("/api/projects")).json();
          return list.data.some((p: { id: string }) => p.id === projectId);
        },
        { timeout: 15_000 }
      )
      .toBe(true);

    // cleanup: delete
    const delRes = await request.delete(`/api/projects/${projectId}`);
    expect(delRes.ok()).toBeTruthy();

    // confirm gone
    await expect
      .poll(async () => (await request.get(`/api/projects/${projectId}`)).status(), {
        timeout: 15_000,
      })
      .toBe(404);
  });
});
