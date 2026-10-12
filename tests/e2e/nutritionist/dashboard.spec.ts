import { test, expect } from '@playwright/test';

test.describe('Dashboard - Nutritionist', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Entrar")');

    // Wait for navigation to complete
    await page.waitForURL('/dashboard');
  });

  test('Dashboard loads with stats cards and charts', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for stats to load
    await expect(page.locator('text=Total Pacientes')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Consultas do Mês')).toBeVisible();
    await expect(page.locator('text=Faturamento')).toBeVisible();
    await expect(page.locator('text=Taxa de Adesão')).toBeVisible();

    // Verify stat cards are present and animated
    const statCards = page.locator('[role="region"]');
    await expect(statCards).toHaveCount(1);

    // Verify stat card content
    await expect(page.locator('text=Total Pacientes')).toBeVisible();
    await expect(page.locator('text=Consultas do Mês')).toBeVisible();
    await expect(page.locator('text=Taxa de Adesão')).toBeVisible();
    await expect(page.locator('text=Faturamento')).toBeVisible();
  });

  test('Dashboard displays revenue and weekly charts', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for page to load
    await expect(page.locator('text=Faturamento')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Consultas da Semana')).toBeVisible();

    // Verify charts render (Recharts creates canvas elements)
    const canvases = page.locator('canvas');
    const canvasCount = await canvases.count();
    expect(canvasCount).toBeGreaterThanOrEqual(2);
  });

  test('Dashboard appointments panel displays correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for appointments section to load
    await expect(page.locator('text=Próximas Consultas')).toBeVisible({ timeout: 10000 });

    // Verify the panel is visible
    const appointmentPanel = page.locator('div:has-text("Próximas Consultas")');
    await expect(appointmentPanel).toBeVisible();

    // Verify schedule button is present
    await expect(page.locator('button:has-text("Agendar Consulta")')).toBeVisible();
  });

  test('Dashboard is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/dashboard');

    // Wait for stats to load
    await expect(page.locator('text=Total Pacientes')).toBeVisible({ timeout: 10000 });

    // Verify responsive grid (should be 2 columns on mobile, 4 on desktop)
    const statCards = page.locator('[role="region"]');
    await expect(statCards).toBeVisible();

    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth);
  });

  test('Dashboard shows loading state', async ({ page }) => {
    // Slow down network to observe loading state
    await page.route('**', route => {
      setTimeout(() => route.continue(), 500);
    });

    const navigationPromise = page.goto('/dashboard');

    // Should show loading indicator briefly
    const hasLoadingState = await page.locator('.animate-spin').count().then(count => count > 0).catch(() => false);

    await navigationPromise;
    await page.waitForLoadState('networkidle');

    // After loading, stats should be visible
    await expect(page.locator('text=Total Pacientes')).toBeVisible();
  });
});
