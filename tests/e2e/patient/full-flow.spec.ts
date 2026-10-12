import { test, expect } from '@playwright/test';
import { loginAsPatient } from '../helpers/auth';

test.describe('Patient Full Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPatient(page);
  });

  test('should navigate through all patient sections', async ({ page }) => {
    // Verify Dashboard is loaded
    await expect(page.locator('text=/Dashboard|Bem-vindo/i')).toBeVisible();

    // Navigate to Meal Plan
    await page.click('text=/Plano Alimentar|Refeições/i');
    await page.waitForURL(/\/patient\/meal-plan|\/paciente\/plano/);
    await expect(page.locator('text=/Plano Alimentar|Refeições/i')).toBeVisible();

    // Navigate to Progress
    await page.click('text=/Progresso|Meu Progresso/i');
    await page.waitForURL(/\/patient\/progress|\/paciente\/progresso/);
    await expect(page.locator('text=/Progresso|Evolução/i')).toBeVisible();

    // Navigate to Profile
    const profileButton = page.locator('[aria-label="Perfil"], button:has-text("Perfil"), a:has-text("Perfil")');
    if (await profileButton.count() > 0) {
      await profileButton.first().click();
      await page.waitForURL(/\/patient\/profile|\/paciente\/perfil/);
    }
  });

  test('should view meal plan', async ({ page }) => {
    // Navigate to Meal Plan
    await page.click('text=/Plano Alimentar|Refeições/i');
    await page.waitForURL(/\/patient\/meal-plan|\/paciente\/plano/);

    // Verify meal sections are visible
    await expect(
      page.locator('text=/Café da Manhã|Almoço|Jantar|Lanche/i')
    ).toBeVisible();

    // Verify meal items are displayed
    const mealCards = page.locator('[data-testid="meal-card"], .meal-card, [class*="meal"]');
    await expect(mealCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should mark meal as completed', async ({ page }) => {
    // Navigate to Meal Plan
    await page.click('text=/Plano Alimentar|Refeições/i');
    await page.waitForURL(/\/patient\/meal-plan|\/paciente\/plano/);

    // Find and click "mark as done" button
    const markDoneButton = page.locator(
      'button:has-text("Marcar como feito"), button:has-text("Concluir"), input[type="checkbox"]'
    );

    if (await markDoneButton.count() > 0) {
      await markDoneButton.first().click();

      // Verify success feedback
      await expect(
        page.locator('text=/marcado|concluído|registrado/i')
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view progress dashboard', async ({ page }) => {
    // Navigate to Progress
    await page.click('text=/Progresso|Meu Progresso/i');
    await page.waitForURL(/\/patient\/progress|\/paciente\/progresso/);

    // Verify progress metrics are visible
    await expect(
      page.locator('text=/peso|altura|imc|meta/i')
    ).toBeVisible();

    // Verify charts are rendered
    const charts = page.locator('canvas, svg[class*="recharts"]');
    if (await charts.count() > 0) {
      await expect(charts.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should view meal completion statistics', async ({ page }) => {
    // Navigate to Progress
    await page.click('text=/Progresso|Meu Progresso/i');
    await page.waitForURL(/\/patient\/progress|\/paciente\/progresso/);

    // Verify meal statistics
    await expect(
      page.locator('text=/refeições registradas|refeições completas|taxa de adesão/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should update patient profile', async ({ page }) => {
    // Navigate to Profile
    const profileButton = page.locator(
      '[aria-label="Perfil"], button:has-text("Perfil"), a:has-text("Perfil")'
    );

    if (await profileButton.count() > 0) {
      await profileButton.first().click();
      await page.waitForURL(/\/patient\/profile|\/paciente\/perfil/);

      // Verify profile form is visible
      await expect(page.locator('input[name="name"], input[placeholder*="nome"]')).toBeVisible();

      // Try updating phone number
      const phoneInput = page.locator('input[name="phone"], input[placeholder*="telefone"]');
      if (await phoneInput.count() > 0) {
        await phoneInput.fill('11987654321');

        const saveButton = page.locator('button:has-text("Salvar")');
        if (await saveButton.count() > 0) {
          await saveButton.click();

          // Verify success message
          await expect(
            page.locator('text=/salvo|atualizado|sucesso/i')
          ).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should view appointment history', async ({ page }) => {
    // Look for appointments section in dashboard or dedicated page
    const appointmentsLink = page.locator('text=/Consultas|Agendamentos|Histórico/i');

    if (await appointmentsLink.count() > 0) {
      await appointmentsLink.first().click();

      // Verify appointments are displayed
      await expect(
        page.locator('text=/próxima consulta|consultas|agendamentos/i')
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('should interact with nutritionist chat or messaging', async ({ page }) => {
    // Look for chat or messaging feature
    const chatButton = page.locator(
      'button:has-text("Mensagens"), button:has-text("Chat"), [aria-label*="chat"]'
    );

    if (await chatButton.count() > 0) {
      await chatButton.first().click();

      // Verify chat interface
      const messageInput = page.locator('textarea, input[placeholder*="mensagem"]');
      await expect(messageInput).toBeVisible({ timeout: 10000 });
    }
  });
});