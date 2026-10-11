import { expect, test } from "@playwright/test";
import { expectResumeViewWithLatestJob } from "./expectations";

test("Résumé button is visible before any JavaScript has loaded", async ({ page }) => {
  await page.route("**/*.js", (route) => route.abort());

  await page.goto("./");

  await expect(page.getByRole("link", { name: "Résumé" })).toBeVisible();
});

test("one tap on the Résumé button opens the Résumé view", async ({ page }, testInfo) => {
  await page.goto("./");

  const button = page.getByRole("link", { name: "Résumé" });
  if (testInfo.project.use.hasTouch) await button.tap();
  else await button.click();

  await expectResumeViewWithLatestJob(page);
});

test("pressing R in the game opens the Résumé view", async ({ page }, testInfo) => {
  test.skip(!!testInfo.project.use.hasTouch, "keyboard shortcut is a desktop feature");
  await page.goto("./");
  await expect(page.locator("canvas")).toBeVisible();

  await page.keyboard.press("r");

  await expectResumeViewWithLatestJob(page);
});
