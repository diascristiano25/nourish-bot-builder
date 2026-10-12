import { test, expect } from '@playwright/test';
import { loginAsNutritionist } from '../helpers/auth';

test.describe('Nutritionist Full Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsNutritionist(page);
  });

  test('should navigate through all main sections', async ({ page }) => {
    // Verify Dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Navigate to Agenda
    await page.click('text=Agenda');
    await page.waitForURL(/\/agenda/);
    await expect(page.locator('text=Agenda')).toBeVisible();

    // Navigate to Pacientes
    await page.click('text=Pacientes');
    await page.waitForURL(/\/pacientes/);
    await expect(page.locator('text=Pacientes')).toBeVisible();

    // Navigate to Biblioteca
    await page.click('text=Biblioteca');
    await page.waitForURL(/\/biblioteca/);
    await expect(page.locator('text=Biblioteca')).toBeVisible();

    // Navigate to Financeiro
    await page.click('text=Financeiro');
    await page.waitForURL(/\/financeiro/);
    await expect(page.locator('text=Financeiro')).toBeVisible();

    // Navigate to Profile
    const profileButton = page.locator('[aria-label="Perfil"], button:has-text("Perfil")');
    if (await profileButton.count() > 0) {
      await profileButton.first().click();
      await page.waitForURL(/\/perfil|\/profile/);
    }
  });

  test('should create a new patient', async ({ page }) => {
    // Navigate to Patients section
    await page.click('text=Pacientes');
    await page.waitForURL(/\/pacientes/);

    // Click new patient button
    const newPatientButton = page.locator(
      'button:has-text("Novo Paciente"), button:has-text("Adicionar Paciente"), button:has-text("+")'
    );
    await newPatientButton.first().click();

    // Fill patient form
    await page.fill('input[name="name"], input[placeholder*="nome"]', 'João Silva Test');
    await page.fill('input[name="email"], input[type="email"]', `joao.test.${Date.now()}@test.com`);

    // Optional fields
    const phoneInput = page.locator('input[name="phone"], input[placeholder*="telefone"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('11999999999');
    }

    // Submit form
    const submitButton = page.locator(
      'button:has-text("Criar"), button:has-text("Salvar"), button:has-text("Adicionar")'
    );
    await submitButton.first().click();

    // Verify patient was created
    await expect(page.locator('text=João Silva Test')).toBeVisible({ timeout: 10000 });
  });

  test('should schedule an appointment', async ({ page }) => {
    // Navigate to Agenda
    await page.click('text=Agenda');
    await page.waitForURL(/\/agenda/);

    // Click new appointment button
    const newAppointmentButton = page.locator(
      'button:has-text("Nova Consulta"), button:has-text("Agendar"), button:has-text("+")'
    );

    if (await newAppointmentButton.count() > 0) {
      await newAppointmentButton.first().click();

      // Fill appointment form
      const dateInput = page.locator('input[name="date"], input[type="date"]');
      if (await dateInput.count() > 0) {
        await dateInput.fill('2024-02-15');
      }

      const timeInput = page.locator('input[name="time"], input[type="time"]');
      if (await timeInput.count() > 0) {
        await timeInput.fill('10:00');
      }

      // Submit
      const submitButton = page.locator('button:has-text("Agendar"), button:has-text("Salvar")');
      await submitButton.first().click();

      // Verify appointment created
      await expect(
        page.locator('text=/consulta agendada|agendado com sucesso/i')
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('should create a meal plan', async ({ page }) => {
    // Navigate to Patients
    await page.click('text=Pacientes');
    await page.waitForURL(/\/pacientes/);

    // Select first patient
    const firstPatient = page.locator('[data-testid="patient-card"], .patient-card').first();
    if (await firstPatient.count() > 0) {
      await firstPatient.click();

      // Look for meal plan option
      const mealPlanButton = page.locator(
        'button:has-text("Plano Alimentar"), button:has-text("Criar Plano"), text=Plano'
      );

      if (await mealPlanButton.count() > 0) {
        await mealPlanButton.first().click();

        // Verify meal plan interface is loaded
        await expect(
          page.locator('text=/café da manhã|almoço|jantar/i')
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should access biblioteca and view recipes', async ({ page }) => {
    // Navigate to Biblioteca
    await page.click('text=Biblioteca');
    await page.waitForURL(/\/biblioteca/);

    // Verify recipes are displayed
    await expect(page.locator('text=/receitas|alimentos|planos/i')).toBeVisible();

    // Search functionality
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('arroz');
      await page.waitForTimeout(1000); // Wait for search results

      // Verify search results
      await expect(page.locator('text=/arroz/i')).toBeVisible();
    }
  });

  test('should view financial dashboard', async ({ page }) => {
    // Navigate to Financeiro
    await page.click('text=Financeiro');
    await page.waitForURL(/\/financeiro/);

    // Verify financial widgets are visible
    await expect(
      page.locator('text=/receita|despesa|lucro|faturamento/i')
    ).toBeVisible();

    // Verify charts are rendered
    const charts = page.locator('canvas, svg[class*="recharts"]');
    await expect(charts.first()).toBeVisible({ timeout: 10000 });
  });

  test('should update profile information', async ({ page }) => {
    // Navigate to Profile
    const profileButton = page.locator(
      '[aria-label="Perfil"], button:has-text("Perfil"), a:has-text("Perfil")'
    );

    if (await profileButton.count() > 0) {
      await profileButton.first().click();
      await page.waitForURL(/\/perfil|\/profile/);

      // Verify profile form is visible
      await expect(page.locator('input[name="name"], input[placeholder*="nome"]')).toBeVisible();

      // Try updating a field
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill('Dr. Nutricionista Teste');

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
});
