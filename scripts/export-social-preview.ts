// Renders the 1200x630 link-preview card to public/social-preview.png.
// Run with `pnpm export:social-preview` after changing the name or title, then commit the PNG.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { profile } from "../src/content.ts";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "public/social-preview.png");
const bangers = readFileSync(
  resolve(root, "node_modules/@fontsource/bangers/files/bangers-latin-400-normal.woff2"),
).toString("base64");

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const html = `<!doctype html>
<style>
  @font-face { font-family: Bangers; src: url(data:font/woff2;base64,${bangers}) format("woff2"); }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: radial-gradient(rgba(0,0,0,.25) 1.5px, transparent 1.6px) 0 0 / 12px 12px, #0d1b4b;
    font-family: Bangers, Impact, sans-serif; color: #fff;
    display: flex; flex-direction: column;
  }
  .bar { background: #e23636; border-bottom: 8px solid #000; padding: 22px 56px; font-size: 40px; letter-spacing: 6px; }
  .main { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 56px; }
  h1 { font-size: 150px; line-height: .95; font-weight: 400; color: #ffd700; -webkit-text-stroke: 6px #000; paint-order: stroke fill; text-shadow: 10px 10px 0 #000; }
  .title { margin-top: 24px; font-size: 54px; letter-spacing: 4px; }
  .cta { display: flex; gap: 24px; margin: 0 56px 48px; font-size: 34px; letter-spacing: 3px; }
  .cta span { background: #fff; color: #000; border: 5px solid #000; box-shadow: 6px 6px 0 #000; padding: 8px 22px; }
  .cta span:first-child { background: #ffd700; }
</style>
<div class="bar">Portfolio</div>
<div class="main">
  <h1>${escape(profile.name)}</h1>
  <div class="title">${escape(profile.title)}</div>
</div>
<div class="cta"><span>Explore the city</span><span>Read the résumé</span></div>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: output });
  console.log(`Wrote ${output}`);
} finally {
  await browser.close();
}
