import { expect, test, type APIRequestContext } from "@playwright/test";

// Link previews (chat apps, social sites) read the raw HTML without running JavaScript.
async function metaTags(request: APIRequestContext, path: string) {
  const html = await (await request.get(path)).text();
  const meta = (attr: string, key: string) =>
    html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1];
  return {
    title: html.match(/<title>([^<]*)<\/title>/)?.[1],
    description: meta("name", "description"),
    ogTitle: meta("property", "og:title"),
    ogDescription: meta("property", "og:description"),
    ogImage: meta("property", "og:image"),
    twitterCard: meta("name", "twitter:card"),
  };
}

for (const { page, kind } of [
  { page: "./", kind: "Portfolio" },
  { page: "resume/", kind: "Résumé" },
]) {
  test(`the ${kind} page has a proper link preview`, async ({ request, baseURL }) => {
    const tags = await metaTags(request, new URL(page, baseURL).href);

    expect(tags.title).toContain("Bunthoeun Tok");
    expect(tags.title).toContain(kind);
    expect(tags.description).toContain("Full-stack developer");
    expect(tags.ogTitle).toContain("Bunthoeun Tok");
    expect(tags.ogDescription).toContain("Full-stack developer");
    expect(tags.twitterCard).toBe("summary_large_image");

    // Previews need an absolute image URL on the live site; check the same file is in this build.
    expect(tags.ogImage).toMatch(/^https:\/\/bunthoeuntok\.github\.io\/me\/social-preview\.png$/);
    const image = await request.get(new URL("social-preview.png", baseURL).href);
    expect(image.headers()["content-type"]).toBe("image/png");
  });
}
