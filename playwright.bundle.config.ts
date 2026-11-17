import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e/make-ebook",
  testMatch: /editor-bundle\.spec\.ts/,
  reporter: [["list"]],
  projects: [
    { name: "iphone", use: { ...devices["iPhone 15"] } },
    { name: "ipad", use: { ...devices["iPad Pro 11"] } },
  ],
});
