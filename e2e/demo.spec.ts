import { test } from "@playwright/test";

// Records a walkthrough of the CRM for the README demo video.
// Output video lands in test-results/ and is copied to public/demo.webm.
test.use({
  video: { mode: "on", size: { width: 1280, height: 720 } },
  viewport: { width: 1280, height: 720 },
});

test.describe("demo", () => {
  test("crm walkthrough", async ({ page }) => {
    test.setTimeout(180_000);

    const visit = async (path: string, settle = 2200) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(settle);
    };

    // Dashboard: stats, pipeline, sprints, activity
    await visit("/", 2800);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(1200);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(1200);
    await page.mouse.wheel(0, -800);
    await page.waitForTimeout(800);

    // Leads pipeline (CRM core)
    await visit("/leads", 2800);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1000);

    // Projects
    await visit("/projects", 2600);

    // Calendar
    await visit("/event", 2600);

    // Team
    await visit("/users", 2400);

    // Tickets
    await visit("/tickets", 2400);

    // Notes
    await visit("/databases", 2200);

    // Back to dashboard to close the loop
    await visit("/", 1800);
  });
});
