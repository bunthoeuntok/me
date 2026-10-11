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
