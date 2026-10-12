import { test, expect } from '@playwright/test';

test.describe('Patient Authentication', () => {
  test('should display patient login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
  });

  test('should login as patient with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Entrar")');

    // Wait for navigation to patient dashboard
    await page.waitForURL(/\/patient\/dashboard|\/paciente/);

    // Verify patient dashboard is loaded
    await expect(page.locator('text=/Dashboard|Bem-vindo|Olá/i')).toBeVisible();
  });

  test('should show error with invalid patient credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid.patient@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Entrar")');

    // Error message should appear
    await expect(page.locator('text=/erro|inválido|incorret/i')).toBeVisible({ timeout: 5000 });
  });

  test('should persist patient session', async ({ page, context }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL(/\/patient\/dashboard|\/paciente/);

    // Open new page in same context
    const newPage = await context.newPage();
    await newPage.goto('/patient/dashboard');

    // Should still be authenticated
    await expect(newPage).toHaveURL(/\/patient\/dashboard|\/paciente/);
  });

  test('should logout patient successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'patient@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL(/\/patient\/dashboard|\/paciente/);

    // Look for logout button
    const logoutButton = page.locator('button:has-text("Sair"), button[aria-label="Logout"]');
    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
      await expect(page).toHaveURL(/\/login|\/$/);
    }
  });
});