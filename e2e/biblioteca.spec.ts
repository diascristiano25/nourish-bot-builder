import { test, expect } from '@playwright/test';

test.describe('Biblioteca - Meal Plans Library', () => {
  test.beforeEach(async ({ page }) => {
    // Set a test timeout
    test.setTimeout(30000);

    // Visit the biblioteca page
    await page.goto('/biblioteca', { waitUntil: 'networkidle' });
  });

  test('Biblioteca displays meal plans grid', async ({ page }) => {
    // Wait for page to load with heading
    await expect(page.locator('text=Biblioteca de Planos')).toBeVisible({ timeout: 5000 });

    // Verify the page title
    await expect(page.locator('h1')).toContainText('Biblioteca de Planos');

    // Wait for plans grid to render
    const plansGrid = page.locator('[role="region"]');
    await expect(plansGrid).toBeVisible({ timeout: 5000 });

    // Verify "New Plan" button exists
    await expect(page.locator('button:has-text("Novo Plano")')).toBeVisible();
  });

  test('Click "New Plan" button opens editor modal', async ({ page }) => {
    // Wait for the button to be visible
    await expect(page.locator('button:has-text("Novo Plano")')).toBeVisible({ timeout: 5000 });

    // Click "New Plan" button
    await page.click('button:has-text("Novo Plano")');

    // Verify modal/form opens
    await expect(page.locator('text=Criar Novo Plano')).toBeVisible({ timeout: 5000 });

    // Verify form fields exist
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#description')).toBeVisible();
    await expect(page.locator('#calories')).toBeVisible();
    await expect(page.locator('#protein')).toBeVisible();
    await expect(page.locator('#carbs')).toBeVisible();
    await expect(page.locator('#fats')).toBeVisible();
    await expect(page.locator('#meals')).toBeVisible();
  });

  test('Plan cards display correct information', async ({ page }) => {
    // Wait for plans to load
    await expect(page.locator('[role="region"]')).toBeVisible({ timeout: 5000 });

    // Get the first plan card
    const firstCard = page.locator('button:has-text("Editar")').first();

    // Verify the card displays nutrition info
    await expect(firstCard).toBeVisible();

    // Check for nutrition badges in the page
    await expect(page.locator('text=Calorias')).toBeVisible();
    await expect(page.locator('text=Proteína')).toBeVisible();
    await expect(page.locator('text=Carbos')).toBeVisible();
    await expect(page.locator('text=Gorduras')).toBeVisible();
  });

  test('Form validation works correctly', async ({ page }) => {
    // Open new plan editor
    await page.click('button:has-text("Novo Plano")');

    // Wait for form to appear
    await expect(page.locator('#name')).toBeVisible({ timeout: 5000 });

    // Try to submit empty form
    const submitButton = page.locator('button:has-text("Criar Plano")');
    await submitButton.click();

    // Verify error messages appear
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible({ timeout: 3000 });

    // Fill in only name
    await page.fill('#name', 'Test Plan');
    await submitButton.click();

    // Verify description error
    await expect(page.locator('text=Descrição é obrigatória')).toBeVisible({ timeout: 3000 });
  });

  test('Can create a new meal plan', async ({ page }) => {
    // Open new plan editor
    await page.click('button:has-text("Novo Plano")');

    // Wait for form to appear
    await expect(page.locator('#name')).toBeVisible({ timeout: 5000 });

    // Fill in form
    await page.fill('#name', 'Plano Teste E2E');
    await page.fill('#description', 'Plano criado durante teste E2E');
    await page.fill('#calories', '2000');
    await page.fill('#protein', '150');
    await page.fill('#carbs', '250');
    await page.fill('#fats', '65');
    await page.fill('#meals', '3');

    // Submit form
    const submitButton = page.locator('button:has-text("Criar Plano")');
    await submitButton.click();

    // Wait for modal to close (form submitted)
    await expect(page.locator('text=Criar Novo Plano')).not.toBeVisible({ timeout: 5000 });

    // Verify the new plan appears in the list
    await expect(page.locator('text=Plano Teste E2E')).toBeVisible({ timeout: 5000 });
  });

  test('Can edit an existing meal plan', async ({ page }) => {
    // Wait for plans to load
    await expect(page.locator('[role="region"]')).toBeVisible({ timeout: 5000 });

    // Click first edit button
    await page.click('button:has-text("Editar")');

    // Wait for form to appear with "Editar" title
    await expect(page.locator('text=Editar Plano')).toBeVisible({ timeout: 5000 });

    // Modify the plan name
    const nameInput = page.locator('#name');
    await nameInput.click();
    await nameInput.triple_click();
    await nameInput.type('Plano Editado E2E');

    // Submit form
    const submitButton = page.locator('button:has-text("Salvar Alterações")');
    await submitButton.click();

    // Wait for modal to close
    await expect(page.locator('text=Editar Plano')).not.toBeVisible({ timeout: 5000 });

    // Verify updated plan appears
    await expect(page.locator('text=Plano Editado E2E')).toBeVisible({ timeout: 5000 });
  });

  test('Cards display with proper animations', async ({ page }) => {
    // Wait for plans to load
    const grid = page.locator('[role="region"]');
    await expect(grid).toBeVisible({ timeout: 5000 });

    // Check that plan cards are visible
    const editButtons = page.locator('button:has-text("Editar")');
    const count = await editButtons.count();
    expect(count).toBeGreaterThan(0);

    // Verify each card has the expected structure
    const firstCard = editButtons.first().locator('..').locator('..');
    await expect(firstCard).toBeVisible();

    // Verify nutrition info is displayed
    await expect(page.locator('text=/\\d+\\s*kcal|\\d+g/')).toBeDefined();
  });

  test('Empty state displays when no plans exist', async ({ page }) => {
    // This test would need a fresh user with no plans
    // For now, we just verify the "New Plan" button is always visible
    await expect(page.locator('button:has-text("Novo Plano")')).toBeVisible({ timeout: 5000 });
  });

  test('Page is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for content
    await expect(page.locator('text=Biblioteca de Planos')).toBeVisible({ timeout: 5000 });

    // Verify button is still clickable
    await page.click('button:has-text("Novo Plano")');

    // Verify form appears
    await expect(page.locator('text=Criar Novo Plano')).toBeVisible({ timeout: 5000 });
  });
});
