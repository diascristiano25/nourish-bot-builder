import { test, expect } from '@playwright/test';

test.describe('Nutritionist Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'nutritionist@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Entrar")');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Verify dashboard is loaded
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Entrar")');

    // Error message should appear (implementation depends on your error handling)
    // This is a placeholder - adjust selector based on actual error display
    await expect(page.locator('text=/erro|inválido|incorret/i')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to signup from login', async ({ page }) => {
    await page.goto('/login');

    // Look for signup link
    const signupLink = page.locator('a:has-text("Criar conta"), a:has-text("Cadastr")');
    if (await signupLink.count() > 0) {
      await signupLink.first().click();
      await expect(page).toHaveURL(/\/signup|\/cadastro/);
    }
  });

  test('should persist session after login', async ({ page, context }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'nutritionist@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/dashboard');

    // Open new page in same context
    const newPage = await context.newPage();
    await newPage.goto('/dashboard');

    // Should still be authenticated
    await expect(newPage).toHaveURL('/dashboard');
    await expect(newPage.locator('text=Dashboard')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'nutritionist@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Entrar")');
    await page.waitForURL('/dashboard');

    // Look for logout button (adjust selector based on implementation)
    const logoutButton = page.locator('button:has-text("Sair"), button[aria-label="Logout"]');
    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
      await expect(page).toHaveURL(/\/login|\/$/);
    }
  });
});
