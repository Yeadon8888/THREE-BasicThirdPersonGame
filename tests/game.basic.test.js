const { test, expect } = require('@playwright/test');

test.describe('Three.js Game Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should load the game page', async () => {
    await expect(page).toHaveTitle(/THREE.BasicThirdPersonGame/);
  });

  test('should display game container', async () => {
    await expect(page.locator('#game')).toBeVisible();
  });

  test('should display score', async () => {
    await expect(page.locator('.score')).toBeVisible();
    await expect(page.locator('#scoreValue')).toHaveText('0');
  });

  test('should show introduction screen', async () => {
    await expect(page.locator('#infobox-intro')).toBeVisible();
  });

  test('should handle keyboard input', async () => {
    // Dismiss intro
    await page.keyboard.press('w');
    await page.waitForTimeout(1000);

    // Test movement keys
    await page.keyboard.down('w');
    await page.waitForTimeout(500);
    await page.keyboard.up('w');

    await page.keyboard.down('a');
    await page.waitForTimeout(500);
    await page.keyboard.up('a');

    await page.keyboard.down('s');
    await page.waitForTimeout(500);
    await page.keyboard.up('s');

    await page.keyboard.down('d');
    await page.waitForTimeout(500);
    await page.keyboard.up('d');

    // Test jump
    await page.keyboard.press(' ');
    await page.waitForTimeout(500);
  });

  test('should have game instance available', async () => {
    const gameExists = await page.evaluate(() => {
      return window.gameInstance !== undefined;
    });
    expect(gameExists).toBe(true);
  });

  test('should have collectibles in game', async () => {
    const collectiblesCount = await page.evaluate(() => {
      return window.gameInstance.level.collectibles.length;
    });
    expect(collectiblesCount).toBeGreaterThan(0);
  });

  test('should have moving platforms', async () => {
    const platformsCount = await page.evaluate(() => {
      return window.gameInstance.level.movingPlatforms.length;
    });
    expect(platformsCount).toBeGreaterThan(0);
  });

  test('should update player score', async () => {
    const initialScore = await page.evaluate(() => {
      return window.gameInstance.player.score;
    });
    expect(initialScore).toBe(0);
  });

  test('should handle game reset functionality', async () => {
    const hasResetFunction = await page.evaluate(() => {
      return typeof window.gameInstance.destroy === 'function';
    });
    expect(hasResetFunction).toBe(true);
  });
});
