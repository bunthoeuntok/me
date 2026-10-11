import { defineConfig, devices } from "@playwright/test";

// Tests run against the production build served under the GitHub Pages base path,
// so they catch anything that would break on the real deploy.
const PORT = 4173;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}/me/`,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm build-github && pnpm preview --mode github --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/me/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
