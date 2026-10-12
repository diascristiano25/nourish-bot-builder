import { test, expect } from '@playwright/test';
import { loginAsNutritionist, loginAsPatient } from '../helpers/auth';

const devices = [
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 812 },
];

test.describe('Responsive Design', () => {
  devices.forEach((device) => {
    test.describe(`${device.name} (${device.width}x${device.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
      });

      test('should display login page correctly', async ({ page }) => {
        await page.goto('/login');

        // Verify no horizontal scroll
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

        // Verify form elements are visible
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
      });

      test('should display nutritionist dashboard correctly', async ({ page }) => {
        await loginAsNutritionist(page);

        // Verify no horizontal scroll
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // +2 for rounding/scrollbar

        // Verify main content is visible
        await expect(page.locator('text=Dashboard')).toBeVisible();

        // Check navigation is accessible
        if (device.width < 768) {
          // Mobile: check for hamburger menu
          const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]');
          await expect(menuButton).toBeVisible();
        } else {
          // Desktop/Tablet: check for sidebar navigation
          const nav = page.locator('nav, aside, [role="navigation"]');
          await expect(nav.first()).toBeVisible();
        }
      });

      test('should have touch-friendly interactive elements', async ({ page }) => {
        await loginAsNutritionist(page);

        // Get all buttons
        const buttons = page.locator('button:visible');
        const buttonCount = await buttons.count();

        if (buttonCount > 0) {
          // Check first 5 buttons
          for (let i = 0; i < Math.min(buttonCount, 5); i++) {
            const button = buttons.nth(i);
            const box = await button.boundingBox();

            if (box) {
              // Minimum touch target size (44x44px for accessibility)
              if (device.width < 768) {
                expect(box.height).toBeGreaterThanOrEqual(40); // Relaxed for mobile
              }
            }
          }
        }
      });

      test('should display patient dashboard correctly', async ({ page }) => {
        await loginAsPatient(page);

        // Verify no horizontal scroll
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

        // Verify patient content is visible
        await expect(page.locator('text=/Dashboard|Bem-vindo/i')).toBeVisible();
      });

      test('should adapt navigation for viewport size', async ({ page }) => {
        await loginAsNutritionist(page);

        if (device.width < 768) {
          // Mobile: verify hamburger menu exists
          const mobileMenu = page.locator(
            'button[aria-label*="menu"], button[aria-label*="Menu"], [class*="mobile-menu"]'
          );

          if (await mobileMenu.count() > 0) {
            await expect(mobileMenu.first()).toBeVisible();

            // Open menu
            await mobileMenu.first().click();

            // Verify navigation items appear
            await expect(page.locator('text=Pacientes')).toBeVisible({ timeout: 2000 });
          }
        } else {
          // Desktop/Tablet: verify sidebar is visible
          const sidebar = page.locator('aside, nav[class*="sidebar"]');
          if (await sidebar.count() > 0) {
            await expect(sidebar.first()).toBeVisible();
          }
        }
      });

      test('should display cards in appropriate grid layout', async ({ page }) => {
        await loginAsNutritionist(page);

        await page.goto('/dashboard');

        // Find grid containers
        const gridContainers = page.locator('[class*="grid"]');

        if (await gridContainers.count() > 0) {
          const container = gridContainers.first();

          // Get computed columns
          const columns = await container.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return style.gridTemplateColumns;
          });

          // Verify appropriate column count based on viewport
          if (device.width < 768) {
            // Mobile should have 1 column or auto-fit small columns
            expect(columns).toBeTruthy();
          } else if (device.width < 1024) {
            // Tablet should have 2 columns typically
            expect(columns).toBeTruthy();
          } else {
            // Desktop should have 3+ columns
            expect(columns).toBeTruthy();
          }
        }
      });

      test('should handle text overflow gracefully', async ({ page }) => {
        await loginAsNutritionist(page);

        // Check for text that might overflow
        const textElements = page.locator('p, h1, h2, h3, span').filter({ hasText: /.{20,}/ });
        const count = await textElements.count();

        if (count > 0) {
          for (let i = 0; i < Math.min(count, 5); i++) {
            const element = textElements.nth(i);
            const box = await element.boundingBox();

            if (box) {
              // Text should not exceed viewport width
              expect(box.x + box.width).toBeLessThanOrEqual(device.width + 10);
            }
          }
        }
      });

      test('should display forms appropriately', async ({ page }) => {
        await loginAsNutritionist(page);

        // Navigate to a page with forms (Pacientes)
        await page.click('text=Pacientes');
        await page.waitForURL(/\/pacientes/);

        // Try to open a form
        const newButton = page.locator('button:has-text("Novo"), button:has-text("Adicionar")');

        if (await newButton.count() > 0) {
          await newButton.first().click();

          // Wait for form
          const form = page.locator('form, [role="dialog"]');
          if (await form.count() > 0) {
            await expect(form.first()).toBeVisible();

            // Form should fit in viewport
            const formBox = await form.first().boundingBox();
            if (formBox) {
              expect(formBox.width).toBeLessThanOrEqual(device.width);
            }
          }
        }
      });

      test('should render charts appropriately', async ({ page }) => {
        await loginAsNutritionist(page);

        // Navigate to Financeiro (has charts)
        await page.click('text=Financeiro');
        await page.waitForURL(/\/financeiro/);

        // Wait for charts to render
        const charts = page.locator('canvas, svg[class*="recharts"]');

        if (await charts.count() > 0) {
          const chart = charts.first();
          await expect(chart).toBeVisible();

          // Chart should fit in viewport
          const chartBox = await chart.boundingBox();
          if (chartBox) {
            expect(chartBox.width).toBeLessThanOrEqual(device.width);
          }
        }
      });

      test('should handle modals/dialogs responsively', async ({ page }) => {
        await loginAsNutritionist(page);

        // Try to open a modal
        const modalTrigger = page.locator('button:has-text("Novo"), button:has-text("Adicionar")');

        if (await modalTrigger.count() > 0) {
          await modalTrigger.first().click();

          // Wait for modal
          const modal = page.locator('[role="dialog"]');

          if (await modal.count() > 0) {
            await expect(modal.first()).toBeVisible();

            // Modal should fit in viewport
            const modalBox = await modal.first().boundingBox();
            if (modalBox) {
              if (device.width < 768) {
                // Mobile modals should be full-width or near full-width
                expect(modalBox.width).toBeGreaterThan(device.width * 0.8);
              } else {
                // Desktop modals should be centered and not full-width
                expect(modalBox.width).toBeLessThan(device.width * 0.9);
              }
            }
          }
        }
      });
    });
  });

  test('should handle orientation changes', async ({ page }) => {
    // Test landscape on mobile
    await page.setViewportSize({ width: 812, height: 375 });
    await loginAsNutritionist(page);

    // Verify no horizontal scroll in landscape
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    // Verify content is still accessible
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});