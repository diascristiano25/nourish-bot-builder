# NutriFlow E2E Test Suite

Comprehensive end-to-end test suite for NutriFlow SaaS application using Playwright.

## Test Structure

```
tests/e2e/
├── helpers/
│   └── auth.ts              # Authentication helper functions
├── nutritionist/
│   ├── auth.spec.ts         # Nutritionist authentication tests (6 tests)
│   ├── dashboard.spec.ts    # Nutritionist dashboard tests (5 tests)
│   └── full-flow.spec.ts    # Complete nutritionist workflows (7 tests)
├── patient/
│   ├── auth.spec.ts         # Patient authentication tests (5 tests)
│   └── full-flow.spec.ts    # Complete patient workflows (8 tests)
├── shared/
│   ├── animations.spec.ts   # Animation performance tests (8 tests)
│   └── responsive.spec.ts   # Responsive design tests (11 tests)
└── financeiro.spec.ts       # Financial module tests (7 tests)
```

**Total: 57 test cases across 8 test files**

## Test Coverage

### Nutritionist Tests
- ✅ Authentication flow (login, logout, session persistence)
- ✅ Navigation across all modules (Dashboard, Agenda, Pacientes, Biblioteca, Financeiro, Profile)
- ✅ Patient management (create, view, update)
- ✅ Appointment scheduling
- ✅ Meal plan creation
- ✅ Recipe and food library access
- ✅ Financial dashboard and metrics
- ✅ Profile updates

### Patient Tests
- ✅ Patient authentication
- ✅ Meal plan viewing
- ✅ Meal completion tracking
- ✅ Progress dashboard and metrics
- ✅ Profile management
- ✅ Appointment history
- ✅ Messaging/chat functionality

### Performance & Quality Tests
- ✅ First paint performance (< 2.5s)
- ✅ Cumulative layout shift (CLS < 0.1)
- ✅ Smooth page transitions (< 1s)
- ✅ Animation smoothness (60 FPS target)
- ✅ Modal/dialog animations
- ✅ Scroll behavior

### Responsive Tests
- ✅ Desktop (1280x720)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x812)
- ✅ No horizontal scroll
- ✅ Touch-friendly elements (44px minimum)
- ✅ Adaptive navigation
- ✅ Grid layout responsiveness
- ✅ Form and modal responsiveness
- ✅ Chart rendering
- ✅ Orientation changes

## Running Tests

### Prerequisites

1. Install Playwright browsers:
```bash
npx playwright install --with-deps
```

2. Start the development server (in a separate terminal):
```bash
npm run dev
```

### Run All Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for debugging)
npm run test:e2e:ui
```

### Run Specific Browser

```bash
# Chromium only
npm run test:e2e:chromium

# Firefox only
npm run test:e2e:firefox

# WebKit only
npm run test:e2e:webkit
```

### Run Specific Test File

```bash
# Run nutritionist auth tests
npx playwright test tests/e2e/nutritionist/auth.spec.ts

# Run patient workflow tests
npx playwright test tests/e2e/patient/full-flow.spec.ts

# Run animation tests
npx playwright test tests/e2e/shared/animations.spec.ts

# Run responsive tests
npx playwright test tests/e2e/shared/responsive.spec.ts
```

### Debug Mode

```bash
# Run in debug mode (step through tests)
npm run test:e2e:debug

# Debug specific test
npx playwright test tests/e2e/nutritionist/auth.spec.ts --debug
```

### View Test Report

```bash
# View HTML report
npm run test:e2e:report
```

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile devices**: Pixel 5, iPhone 12
- **Retries**: 0 locally, 2 in CI
- **Timeout**: 30s per test, 5s per assertion
- **Auto-start dev server**: Yes (120s timeout)
- **Reports**: HTML, JSON, JUnit, List

## Authentication Helpers

The `helpers/auth.ts` file provides reusable authentication functions:

```typescript
import { loginAsNutritionist, loginAsPatient } from './helpers/auth';

// In your test
test.beforeEach(async ({ page }) => {
  await loginAsNutritionist(page);
  // or
  await loginAsPatient(page);
});
```

## Test Credentials

Default test credentials (update based on your test data):

**Nutritionist:**
- Email: `nutritionist@test.com`
- Password: `password123`

**Patient:**
- Email: `patient@test.com`
- Password: `password123`

## CI/CD Integration

The test suite is configured for CI/CD:

- Runs with 2 retries in CI
- Single worker in CI (parallel locally)
- Generates JSON and JUnit reports
- Captures screenshots and videos on failure
- Includes trace for first retry

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Writing New Tests

### Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for navigation** with `waitForURL()`
3. **Use expect helpers** like `toBeVisible()`, `toHaveURL()`
4. **Group related tests** with `test.describe()`
5. **Use beforeEach** for common setup
6. **Make tests independent** - each test should work in isolation
7. **Handle timing** with proper waits, not arbitrary `setTimeout()`

### Example Test Template

```typescript
import { test, expect } from '@playwright/test';
import { loginAsNutritionist } from '../helpers/auth';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsNutritionist(page);
  });

  test('should do something specific', async ({ page }) => {
    // Navigate
    await page.goto('/feature');
    
    // Interact
    await page.click('button:has-text("Action")');
    
    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

## Troubleshooting

### Dev server not starting
- Check if port 5173 is already in use
- Increase timeout in `playwright.config.ts` webServer section
- Start dev server manually before running tests

### Tests timing out
- Check network conditions
- Verify selectors are correct
- Use `--debug` flag to step through
- Check if elements are visible/enabled before clicking

### Flaky tests
- Add proper waits (`waitForURL`, `waitForLoadState`)
- Avoid arbitrary `setTimeout()`
- Use `toBeVisible()` instead of checking count
- Ensure test data independence

### Browser not installed
Run: `npx playwright install --with-deps`

## Performance Thresholds

- **First Paint**: < 2.5s
- **First Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Page Transitions**: < 1s
- **Frame Rate**: > 30 FPS (target 60 FPS)

## Accessibility

Tests verify:
- Minimum touch target size (44px)
- No horizontal scroll
- Keyboard navigation (where implemented)
- ARIA labels and roles
- Form labels and validation

## Support

For issues or questions about the test suite:
1. Check test logs in `test-results/`
2. View HTML report: `npm run test:e2e:report`
3. Run in debug mode: `npm run test:e2e:debug`
4. Review Playwright documentation: https://playwright.dev
