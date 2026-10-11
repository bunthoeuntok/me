import { expect, test } from "@playwright/test";
import { CAPTION_BLUE, CAPTION_RED, pixelAt } from "./pixels";

test("with ?city, the Hero walks from the Intro District into About Me", async ({ page }, testInfo) => {
  await page.goto("./?city");
  await expect.poll(() => pixelAt(page, 20, 20)).toEqual(CAPTION_RED);

  const touch = !!testInfo.project.use.hasTouch;
  const right = page.getByRole("button", { name: "Move right" });
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  if (cdp) {
    const box = (await right.boundingBox())!;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }],
    });
  }

  try {
    // Same continuous street: the caption names the District the Hero has walked into.
    await expect
      .poll(
        async () => {
          if (!touch) await page.keyboard.down("ArrowRight");
          return pixelAt(page, 20, 20);
        },
        { timeout: 30_000 },
      )
      .toEqual(CAPTION_BLUE);
  } finally {
    // Release even on failure, so the kept screenshot/trace show where the Hero stopped.
    if (cdp) await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    else await page.keyboard.up("ArrowRight");
  }
});
