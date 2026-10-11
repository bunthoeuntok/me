import { expect, test } from "@playwright/test";
import { CAPTION_RED, pixelAt, WHITE } from "./pixels";

test("the screen re-lays itself out when the window is resized", async ({ page }, testInfo) => {
  test.skip(!!testInfo.project.use.isMobile, "desktop windows resize; phones rotate (covered below)");
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("./");
  await expect.poll(() => pixelAt(page, 20, 20)).toEqual(CAPTION_RED);

  await page.setViewportSize({ width: 1280, height: 900 });

  // The info strip spans the new bottom edge, the caption bar the new top-right.
  await expect.poll(() => pixelAt(page, 1100, 895)).toEqual(WHITE);
  await expect.poll(() => pixelAt(page, 1000, 20)).toEqual(CAPTION_RED);
});

test("the screen re-lays itself out when a phone rotates", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "phone only");
  const { width, height } = page.viewportSize()!;
  await page.goto("./");
  await expect.poll(() => pixelAt(page, 20, 20)).toEqual(CAPTION_RED);

  await page.setViewportSize({ width: height, height: width });

  await expect.poll(() => pixelAt(page, height - 40, width - 5)).toEqual(WHITE);
  await expect.poll(() => pixelAt(page, 20, 20)).toEqual(CAPTION_RED);
});
