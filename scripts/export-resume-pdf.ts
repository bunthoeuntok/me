// Prints the Résumé view to public/resume.pdf using its own print styling.
// Run with `pnpm export:pdf` after changing the content source, then commit the PDF.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { build, preview } from "vite";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "public/resume.pdf");

// Build into a temporary folder so dist/ (e.g. a GitHub Pages build) is left alone.
const outDir = mkdtempSync(join(tmpdir(), "resume-pdf-"));
await build({ root, logLevel: "warn", build: { outDir } });
const server = await preview({ root, build: { outDir }, preview: { port: 4174, strictPort: true } });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto("http://localhost:4174/resume/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: output, format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log(`Wrote ${output}`);
} finally {
  await browser.close();
  await server.close();
  rmSync(outDir, { recursive: true, force: true });
}
