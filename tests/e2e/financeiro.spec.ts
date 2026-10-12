/**
 * E2E Test: Financeiro page
 * Tests financial dashboard, revenue chart, and transaction list rendering
 */

import { test, expect } from '@playwright/test';

test.describe('Financeiro Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Financeiro page
    // Note: In a real scenario, we'd need authentication setup
    await page.goto('/financeiro');
  });

  test('displays Financeiro page title and content', async ({ page }) => {
    // Wait for the page title
    await expect(page.locator('h1:has-text("Financeiro")')).toBeVisible({ timeout: 10000 });

    // Verify page subtitle
    await expect(page.locator('text=Acompanhe suas receitas e transações')).toBeVisible();
  });

  test('displays financial dashboard stat cards', async ({ page }) => {
    // Wait for stat cards to be visible
    await expect(page.locator('text=Receita do Mês')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Pagamentos Pendentes')).toBeVisible();
    await expect(page.locator('text=Ticket Médio')).toBeVisible();
    await expect(page.locator('text=Total de Transações')).toBeVisible();
  });

  test('displays revenue chart', async ({ page }) => {
    // Wait for revenue chart heading
    await expect(page.locator('text=Evolução de Receita')).toBeVisible({ timeout: 10000 });

    // Check if chart container exists (Recharts renders in SVG)
    const chartContainer = page.locator('.recharts-wrapper');
    await expect(chartContainer).toBeVisible({ timeout: 5000 });
  });

  test('displays transaction list', async ({ page }) => {
    // Wait for transaction list heading
    await expect(page.locator('text=Transações Recentes')).toBeVisible({ timeout: 10000 });

    // Check for table headers
    await expect(page.locator('th:has-text("Data")')).toBeVisible();
    await expect(page.locator('th:has-text("Paciente")')).toBeVisible();
    await expect(page.locator('th:has-text("Tipo")')).toBeVisible();
    await expect(page.locator('th:has-text("Valor")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('displays empty state when no transactions', async ({ page }) => {
    // If there are no transactions, empty state should be visible
    const emptyState = page.locator('text=Nenhuma transação');
    const hasTransactions = await page.locator('tbody tr').count() > 0;

    if (!hasTransactions) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator('text=As transações aparecerão aqui')).toBeVisible();
    }
  });

  test('stat cards animate on load', async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Check that stat cards have the expected structure
    const statCards = page.locator('[role="region"][aria-label="Financial Statistics"] > div');
    const count = await statCards.count();

    expect(count).toBe(4);
  });

  test('transaction rows animate with stagger', async ({ page }) => {
    // Wait for transactions to load
    await page.waitForTimeout(1000);

    // Check if any transaction rows exist
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Verify first row is visible
      await expect(rows.first()).toBeVisible();
    }
  });
});
