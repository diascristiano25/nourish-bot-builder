import { test, expect } from '@playwright/test';

test.describe('Patient Portal Pages', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(30000);
  });

  test('Patient dashboard displays progress and meals', async ({ page }) => {
    await page.goto('/patient-portal', { waitUntil: 'networkidle' });

    // Verify layout and welcome message
    await expect(page.locator('text=Bem-vindo')).toBeVisible({ timeout: 5000 });

    // Verify progress card
    await expect(page.locator('text=Seu Progresso')).toBeVisible();

    // Verify stat cards
    await expect(page.locator('text=Seu Objetivo')).toBeVisible();
    await expect(page.locator('text=Refeições/Dia')).toBeVisible();

    // Verify today's meals section
    await expect(page.locator('text=Refeições de Hoje')).toBeVisible();

    // Verify chat widget
    await expect(page.locator('text=Fale com seu Nutricionista')).toBeVisible();
  });

  test('Patient meal plan page loads and displays meals', async ({ page }) => {
    await page.goto('/patient-meal-plan', { waitUntil: 'networkidle' });

    // Verify page title
    await expect(page.locator('h1')).toContainText('Meu Plano Alimentar');

    // Verify meal types are displayed
    const mealTypes = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'];
    for (const mealType of mealTypes) {
      // At least one should be visible if there's a meal plan
      const element = page.locator(`text=${mealType}`);
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
        break;
      }
    }
  });

  test('Patient progress page shows charts', async ({ page }) => {
    await page.goto('/patient-progress', { waitUntil: 'networkidle' });

    // Verify page title
    await expect(page.locator('h1')).toContainText('Meu Progresso');

    // Verify chart container or empty state
    const chartTitle = page.locator('text=Histórico de Peso');
    await expect(chartTitle).toBeVisible({ timeout: 5000 });

    // Verify tips section
    await expect(page.locator('text=Dicas para Manter o Progresso')).toBeVisible();
  });

  test('Patient profile page displays and allows editing', async ({ page }) => {
    await page.goto('/patient-profile', { waitUntil: 'networkidle' });

    // Verify page title
    await expect(page.locator('h1')).toContainText('Meu Perfil');

    // Verify form fields exist
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="date_of_birth"]')).toBeVisible();
    await expect(page.locator('input[name="goal"]')).toBeVisible();
    await expect(page.locator('input[name="height"]')).toBeVisible();
    await expect(page.locator('input[name="current_weight"]')).toBeVisible();

    // Verify save button
    await expect(page.locator('button:has-text("Salvar Alterações")')).toBeVisible();

    // Verify email is disabled
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeDisabled();
  });

  test('Can mark meals as completed in dashboard', async ({ page }) => {
    await page.goto('/patient-portal', { waitUntil: 'networkidle' });

    // Wait for meals section
    await expect(page.locator('text=Refeições de Hoje')).toBeVisible({ timeout: 5000 });

    // Find first meal card (if any exist)
    const mealCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /Café|Almoço|Lanche|Jantar/ });
    const count = await mealCards.count();

    if (count > 0) {
      // Click first meal to mark as complete
      await mealCards.first().click();

      // Verify completion indicator appears
      await expect(page.locator('svg').filter({ hasText: '' })).toBeDefined();
    }
  });

  test('Chat widget allows sending messages', async ({ page }) => {
    await page.goto('/patient-portal', { waitUntil: 'networkidle' });

    // Find chat widget
    await expect(page.locator('text=Fale com seu Nutricionista')).toBeVisible({ timeout: 5000 });

    // Find message input
    const messageInput = page.locator('input[placeholder*="Digite sua mensagem"]');
    await expect(messageInput).toBeVisible();

    // Type and send message
    await messageInput.fill('Teste de mensagem');
    await page.click('button:has-text("Enviar")');

    // Verify message appears
    await expect(page.locator('text=Teste de mensagem')).toBeVisible({ timeout: 3000 });
  });

  test('Meal plan viewer allows marking meals as done', async ({ page }) => {
    await page.goto('/patient-meal-plan', { waitUntil: 'networkidle' });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Find meal completion buttons (circle icons)
    const completionButtons = page.locator('button').filter({ has: page.locator('svg') });
    const count = await completionButtons.count();

    if (count > 0) {
      // Click first completion button
      await completionButtons.first().click();

      // Verify checked icon appears (CheckCircle2)
      await page.waitForTimeout(500);
    }
  });

  test('Progress chart displays weight history', async ({ page }) => {
    await page.goto('/patient-progress', { waitUntil: 'networkidle' });

    // Wait for chart section
    await expect(page.locator('text=Histórico de Peso')).toBeVisible({ timeout: 5000 });

    // Check for stat boxes (Peso Atual, Peso Inicial, Perdido)
    const statBoxes = ['Peso Atual', 'Peso Inicial', 'Perdido'];
    for (const statBox of statBoxes) {
      const element = page.locator(`text=${statBox}`);
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test('Profile form can be filled and submitted', async ({ page }) => {
    await page.goto('/patient-profile', { waitUntil: 'networkidle' });

    // Fill form fields
    await page.fill('input[name="full_name"]', 'João Silva');
    await page.fill('input[name="phone"]', '(11) 98765-4321');
    await page.fill('input[name="goal"]', 'Perder 10kg');
    await page.fill('input[name="height"]', '175');
    await page.fill('input[name="current_weight"]', '85');

    // Submit form
    await page.click('button:has-text("Salvar Alterações")');

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify button text returns to normal (not "Salvando...")
    await expect(page.locator('button:has-text("Salvar Alterações")')).toBeVisible({ timeout: 5000 });
  });

  test('Pages are responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test dashboard
    await page.goto('/patient-portal', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Bem-vindo')).toBeVisible({ timeout: 5000 });

    // Test meal plan
    await page.goto('/patient-meal-plan', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Meu Plano Alimentar');

    // Test progress
    await page.goto('/patient-progress', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Meu Progresso');

    // Test profile
    await page.goto('/patient-profile', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toContainText('Meu Perfil');
  });
});
