import type { Page } from "@playwright/test";

/** Reads the colour of one on-screen pixel, as the Visitor sees it. */
export async function pixelAt(page: Page, x: number, y: number) {
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

export const WHITE = { r: 255, g: 255, b: 255 };
/** The intro screen's caption bar. */
export const CAPTION_RED = { r: 0xe2, g: 0x36, b: 0x36 };
