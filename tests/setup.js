const { test } = require('@playwright/test');

// Setup global test configurations
test.beforeEach(async ({ page }) => {
  // Wait for page to load completely
  await page.goto('http://localhost:8000/index.html');
  await page.waitForLoadState('networkidle');

  // Wait for game to initialize
  await page.waitForTimeout(3000);

  // Handle the intro screen
  await page.keyboard.press('w');
  await page.waitForTimeout(1000);
});

test.afterEach(async ({ page }) => {
  // Clean up after each test
  await page.waitForTimeout(500);
});
