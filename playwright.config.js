const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    browserName: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      slowMo: 500
    },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [['list'], ['html']],
  workers: 1,
  webServer: {
    command: 'python -m http.server 8000',
    port: 8000,
    reuseExistingServer: true,
    timeout: 120000
  }
});