import { Page } from '@playwright/test';

/**
 * Login helper for nutritionist users
 */
export async function loginAsNutritionist(
  page: Page,
  email: string = 'nutritionist@test.com',
  password: string = 'password123'
) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Entrar")');
  await page.waitForURL('/dashboard');
}

/**
 * Login helper for patient users
 */
export async function loginAsPatient(
  page: Page,
  email: string = 'patient@test.com',
  password: string = 'password123'
) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Entrar")');
  await page.waitForURL('/patient/dashboard');
}
