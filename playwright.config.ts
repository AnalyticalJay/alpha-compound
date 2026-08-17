import { defineConfig } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 7_500 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
    launchOptions: {
      args: ["--disable-gpu", "--disable-dev-shm-usage", "--disable-background-networking"],
    },
  },
  webServer: {
    command: `E2E_TEST_MODE=true PORT=${port} pnpm run dev`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
