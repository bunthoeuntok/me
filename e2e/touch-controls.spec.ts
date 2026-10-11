import { expect, test, type Locator, type Page } from "@playwright/test";
import { CAPTION_RED, pixelAt } from "./pixels";

const BUTTONS = ["Move left", "Move right", "Jump", "Web", "Interact"];

test("on-screen controls appear on touch devices only", async ({ page }, testInfo) => {
  await page.goto("./");
  await expect(page.locator("canvas")).toBeVisible();

  for (const name of BUTTONS) {
    const button = page.getByRole("button", { name });
    if (testInfo.project.use.hasTouch) await expect(button).toBeVisible();
    else await expect(button).toBeHidden();
  }
});

test("holding move-right walks the hero off the first screen", async ({ page }, testInfo) => {
  await page.goto("./");
  await expect(page.locator("canvas")).toBeVisible();
  await expect.poll(() => pixelAt(page, 20, 20)).toEqual(CAPTION_RED);

  const touch = !!testInfo.project.use.hasTouch;
  const finger = touch ? await holdWithFinger(page, page.getByRole("button", { name: "Move right" })) : null;
  if (!touch) await page.keyboard.down("ArrowRight");

  // Reaching the right edge fades to the next screen, so the red intro caption goes.
  // (On a narrow phone the hero crosses screens quickly, so don't pin which one.)
  await expect
    .poll(
      async () => {
        // A physically held key auto-repeats keydown; mimic that so a lost key state recovers.
        if (!touch) await page.keyboard.down("ArrowRight");
        return pixelAt(page, 20, 20);
      },
      { timeout: 15_000 },
    )
    .not.toEqual(CAPTION_RED);

  if (finger) await finger.lift();
  else await page.keyboard.up("ArrowRight");
});

/** Presses and holds a real touch point on an element (Playwright's touchscreen can only tap). */
async function holdWithFinger(page: Page, target: Locator) {
  const box = (await target.boundingBox())!;
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  return {
    lift: () => cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }),
  };
}
