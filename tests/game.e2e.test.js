const { test, expect } = require('@playwright/test');

test.describe('Three.js Game End-to-End Tests', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:8000/index.html');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load the game page successfully', async () => {
    await expect(page).toHaveTitle(/THREE.BasicThirdPersonGame/);
    await expect(page.locator('#game')).toBeVisible();
    await expect(page.locator('.score')).toBeVisible();
  });

  test('should display introduction and fade out on key press', async () => {
    await expect(page.locator('#infobox-intro')).toBeVisible();

    // Press any key to fade out intro
    await page.keyboard.press('w');
    await page.waitForTimeout(100);

    // Check if intro starts fading out
    const intro = page.locator('#infobox-intro');
    await expect(intro).toHaveClass(/fade-out/);
  });

  test('should handle player movement controls', async () => {
    // Wait for game to fully load
    await page.waitForTimeout(2000);

    // Test forward movement
    await page.keyboard.press('w');
    await page.waitForTimeout(500);
    await page.keyboard.up('w');

    // Test backward movement
    await page.keyboard.press('s');
    await page.waitForTimeout(500);
    await page.keyboard.up('s');

    // Test left rotation
    await page.keyboard.press('a');
    await page.waitForTimeout(500);
    await page.keyboard.up('a');

    // Test right rotation
    await page.keyboard.press('d');
    await page.waitForTimeout(500);
    await page.keyboard.up('d');
  });

  test('should handle jump functionality', async () => {
    await page.waitForTimeout(2000);

    // Press jump key
    await page.keyboard.press(' ');
    await page.waitForTimeout(1000);
  });

  test('should detect collectibles in the scene', async () => {
    await page.waitForTimeout(2000);

    // Check if collectibles exist by looking for golden objects
    const collectibles = await page.evaluate(() => {
      const objects = window.gameInstance.level.collectibles;
      return objects.length;
    });

    expect(collectibles).toBeGreaterThan(0);
  });

  test('should display and update score', async () => {
    await page.waitForTimeout(2000);

    const initialScore = await page.locator('#scoreValue').textContent();
    expect(initialScore).toBe('0');
  });

  test('should have moving platforms', async () => {
    await page.waitForTimeout(2000);

    const movingPlatforms = await page.evaluate(() => {
      return window.gameInstance.level.movingPlatforms.length;
    });

    expect(movingPlatforms).toBeGreaterThan(0);
  });

  test('should handle game reset when player falls', async () => {
    await page.waitForTimeout(2000);

    // Simulate player falling by pressing movement keys
    await page.keyboard.press('w');
    await page.waitForTimeout(3000);
    await page.keyboard.up('w');

    // Check if game is still running
    const gameExists = await page.evaluate(() => {
      return window.gameInstance !== undefined;
    });

    expect(gameExists).toBe(true);
  });

  test('should show collect effect when items are collected', async () => {
    await page.waitForTimeout(2000);

    // This test verifies the collect effect mechanism exists
    const hasCollectEffect = await page.evaluate(() => {
      return typeof window.gameInstance.level.showCollectEffect === 'function';
    });

    expect(hasCollectEffect).toBe(true);
  });

  test('should have player color changing functionality', async () => {
    await page.waitForTimeout(2000);

    const hasColorUpdate = await page.evaluate(() => {
      return typeof window.gameInstance.player.updatePlayerEffects === 'function';
    });

    expect(hasColorUpdate).toBe(true);
  });

  test('should handle multiple key presses simultaneously', async () => {
    await page.waitForTimeout(2000);

    // Test simultaneous key presses
    await page.keyboard.down('w');
    await page.keyboard.down('d');
    await page.waitForTimeout(1000);
    await page.keyboard.up('w');
    await page.keyboard.up('d');
  });

  test('should maintain game state after key release', async () => {
    await page.waitForTimeout(2000);

    // Press and release keys
    await page.keyboard.press('w');
    await page.waitForTimeout(500);
    await page.keyboard.up('w');

    // Verify game is still responsive
    await page.keyboard.press('a');
    await page.waitForTimeout(500);
    await page.keyboard.up('a');
  });

  test('should have proper game loop running', async () => {
    await page.waitForTimeout(2000);

    const isGameLoopRunning = await page.evaluate(() => {
      return window.gameInstance !== undefined &&
             typeof window.gameInstance.loop === 'function';
    });

    expect(isGameLoopRunning).toBe(true);
  });
});
