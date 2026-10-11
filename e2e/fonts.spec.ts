import { expect, test, type Page } from "@playwright/test";

function loadedFontFamilies(page: Page) {
  return page.evaluate(() =>
    Array.from(document.fonts)
      .filter((face) => face.status === "loaded")
      .map((face) => face.family.replace(/["']/g, "")),
  );
}

function recordThirdPartyRequests(page: Page) {
  const hosts: string[] = [];
  page.on("request", (request) => {
    const { protocol, hostname } = new URL(request.url());
    // data:/blob: URLs are inline resources, not network requests
    if (protocol.startsWith("http") && hostname !== "localhost") hosts.push(hostname);
  });
  return hosts;
}

test("the game draws with the bundled comic fonts", async ({ page }) => {
  const thirdParty = recordThirdPartyRequests(page);

  await page.goto("./");
  await expect(page.locator("canvas")).toBeVisible();

  expect(await loadedFontFamilies(page)).toEqual(expect.arrayContaining(["Bangers", "Comic Neue"]));
  expect(thirdParty).toEqual([]);
});

test("the Résumé view uses the bundled fonts", async ({ page }) => {
  const thirdParty = recordThirdPartyRequests(page);

  await page.goto("resume/");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveCSS("font-family", /^Bangers/);
  await page.evaluate(() => document.fonts.ready);

  expect(await loadedFontFamilies(page)).toContain("Bangers");
  expect(thirdParty).toEqual([]);
});
