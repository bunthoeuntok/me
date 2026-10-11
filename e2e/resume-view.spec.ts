import { expect, test } from "@playwright/test";
import { expectResumeViewWithLatestJob } from "./expectations";

const RESUME_URL = "resume/";

test("Résumé view shows Bunthoeun's name and most recent job", async ({ page }) => {
  await page.goto(RESUME_URL);

  await expectResumeViewWithLatestJob(page);
});

// The game engine alone is over 1 MB of JavaScript; React on its own is ~200 KB.
const RESUME_JS_BUDGET_BYTES = 400_000;

test("Résumé view loads without downloading the game engine", async ({ page }) => {
  let scriptBytes = 0;
  page.on("response", async (response) => {
    if (response.request().resourceType() === "script") {
      scriptBytes += (await response.body()).length;
    }
  });

  await page.goto(RESUME_URL, { waitUntil: "networkidle" });

  expect(scriptBytes).toBeLessThan(RESUME_JS_BUDGET_BYTES);
});

test("the Résumé view links back to the game", async ({ page }) => {
  await page.goto(RESUME_URL);

  await page.getByRole("link", { name: "Back to the game" }).click();

  await expect(page.locator("canvas")).toBeVisible();
});

test("the Résumé view offers a downloadable PDF", async ({ page }) => {
  await page.goto(RESUME_URL);

  const href = await page.getByRole("link", { name: "Download PDF" }).getAttribute("href");
  const pdf = await page.request.get(new URL(href!, page.url()).href);

  expect(pdf.ok()).toBe(true);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
});

test("printing the Résumé view leaves out the site controls", async ({ page }) => {
  await page.goto(RESUME_URL);
  await page.emulateMedia({ media: "print" });

  await expect(page.getByRole("link", { name: "Download PDF" })).toBeHidden();
  await expect(page.getByRole("link", { name: "Back to the game" })).toBeHidden();
  await expectResumeViewWithLatestJob(page);
});
