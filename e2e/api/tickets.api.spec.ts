import { test, expect, request as playwrightRequest } from "@playwright/test";
import { BASE_URL, unique } from "../helpers/data";

test.describe("api: tickets", () => {
  test("GET /api/tickets requires auth", async () => {
    const anon = await playwrightRequest.newContext({
      baseURL: BASE_URL,
      storageState: { cookies: [], origins: [] },
    });
    const res = await anon.get("/api/tickets");
    expect(res.status()).toBe(401);
    await anon.dispose();
  });

  test("GET /api/tickets returns ticket list", async ({ request }) => {
    const res = await request.get("/api/tickets");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.message).toBe("Success");
    expect(Array.isArray(body.tickets)).toBe(true);
  });

  test("POST rejects missing title/description", async ({ request }) => {
    const noTitle = await request.post("/api/tickets", { data: { description: "x" } });
    expect(noTitle.status()).toBe(400);

    const noDesc = await request.post("/api/tickets", { data: { title: "x" } });
    expect(noDesc.status()).toBe(400);
  });

  test("create -> appears in list -> delete", async ({ request }) => {
    const title = unique("e2e-ticket");

    const createRes = await request.post("/api/tickets", {
      data: { title, description: "created by e2e", priority: "MEDIUM" },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await createRes.json();
    const ticketId: string = created.newTicket.id;
    expect(ticketId).toBeTruthy();

    const listRes = await request.get("/api/tickets");
    const list = await listRes.json();
    expect(list.tickets.some((t: { id: string }) => t.id === ticketId)).toBe(true);

    const delRes = await request.delete(`/api/tickets/${ticketId}`);
    expect(delRes.ok()).toBeTruthy();
  });
});
