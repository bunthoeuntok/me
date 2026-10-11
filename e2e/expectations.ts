import { expect, type Page } from "@playwright/test";

export async function expectResumeViewWithLatestJob(page: Page) {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bunthoeun Tok");

  const experience = page.getByRole("region", { name: "Experience" });
  const latestJob = experience.getByRole("article").first();
  await expect(latestJob.getByRole("heading")).toContainText("Techbodia");
  await expect(latestJob).toContainText("Full-stack Developer");
}
