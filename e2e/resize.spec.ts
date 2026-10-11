import { expect, test, type Page } from "@playwright/test";

/** Reads the colour of one on-screen pixel, as the Visitor sees it. */
async function pixelAt(page: Page, x: number, y: number) {
  const png = (await page.screenshot({ scale: "css" })).toString("base64");
  return page.evaluate(
    async ({ png, x, y }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${png}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      return { r, g, b };
    },
    { png, x, y },
  );
}

const WHITE = { r: 255, g: 255, b: 255 };
const CAPTION_RED = { r: 0xe2, g: 0x36, b: 0x36 };

test("the screen re-lays itself out when the window is resized", async ({ page }, testInfo) => {
  test.skip(!!testInfo.project.use.isMobile, "desktop windows resize; phones rotate (covered below)");
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("./");
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(800);

  // The info strip spans the new bottom edge, the caption bar the new top-right.
  expect(await pixelAt(page, 1100, 895)).toEqual(WHITE);
  expect(await pixelAt(page, 1000, 20)).toEqual(CAPTION_RED);
});

test("the screen re-lays itself out when a phone rotates", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "phone only");
  const { width, height } = page.viewportSize()!;
  await page.goto("./");
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(500);

  await page.setViewportSize({ width: height, height: width });
  await page.waitForTimeout(800);

  expect(await pixelAt(page, height - 40, width - 5)).toEqual(WHITE);
  expect(await pixelAt(page, 20, 20)).toEqual(CAPTION_RED);
});
