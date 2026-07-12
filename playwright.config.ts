import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env["CI"];

export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.ts$/,
  testIgnore: isCI
    ? [
        /visual-regression\.spec\.ts$/,
        /a11y-baseline\.spec\.ts$/,
        /a11y\.spec\.ts$/,
        /seo-home\.spec\.ts$/,
        /responsive\.spec\.ts$/,
      ]
    : [],
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: process.env["BASE_URL"] ?? "http://localhost:3000",
    trace: "on-first-retry",
    launchOptions: {
      ...(process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH"]
        ? { executablePath: process.env["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH"] }
        : {}),
    },
    browserName: "chromium",
  },
  projects: [
    { name: "mobile-sm", use: { ...devices["Galaxy S9+"] } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: "npm run build && npx serve out -l 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
  },
});
