# Playwright Test Development Standards

## Core Principles

1. **Tests are User-Centric:** Write tests that verify user outcomes, not implementation details
2. **Tests Must Be Reliable:** Flaky tests undermine confidence; prevent brittleness through design
3. **Tests Drive Architecture:** Test structure guides application code structure
4. **Accessibility First:** Use semantic selectors (getByRole) to ensure inclusive design

---

## Test Conventions

### File Naming & Organization
```
tests/
├── [feature].spec.js          # One feature per file
├── fixtures/                  # Shared setup/teardown
└── utils/                     # Page objects, test data, assertions
```

- **File naming:** `kebab-case.spec.js` (e.g., `user-login.spec.js`)
- **Test naming:** Imperative, outcome-focused
  - ✅ `test('should display authentication error when credentials invalid', () => {})`
  - ❌ `test('login fail', () => {})`
- **Describe blocks:** Group related tests by feature subsection
  - ✅ `describe('User Login', () => {})`
  - ✅ `describe('Login > Authentication Errors', () => {})`

### Test Structure (Arrange-Act-Assert)

```javascript
test('should display cart total after adding item', async ({ page }) => {
  // Arrange: Setup state
  await page.goto('/products');
  
  // Act: Perform user action
  await page.getByRole('button', { name: /add to cart/i }).click();
  
  // Assert: Verify outcome
  await expect(page.getByText(/total.*\$15\.99/i)).toBeVisible();
});
```

**Rules:**
- One primary assertion per test
- Minimal setup; use fixtures for complex state
- Test one outcome (one reason to fail)

---

## Locator Hierarchy (Use in Order)

Selecting elements by priority — more resilient first:

### 1. **getByRole()** — Accessibility Foundation
```javascript
// Preferred: Tests against semantic HTML
await page.getByRole('button', { name: /submit/i }).click();
await page.getByRole('textbox', { name: /email/i }).fill('user@example.com');
await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
```
**When:** ARIA role + name available; element has semantic meaning
**Why:** Ensures accessible markup; tests from user perspective
**Avoid:** Using role without name; using incorrect role

### 2. **getByLabel()** — Form Associations
```javascript
await page.getByLabel('Email Address').fill('test@example.com');
```
**When:** Form input with `<label>` element
**Why:** Tests practical user interaction; enforces labeling
**Avoid:** When no label present; use getByTestId instead

### 3. **getByTestId()** — Explicit Test Hooks
```javascript
// Only when semantic locators unavailable
await page.getByTestId('product-price-display').click();
```
**When:** No role/label available; explicitly marked for testing
**Why:** Decouples tests from styling/text changes
**Requires:** `data-testid` attribute in application code
**Avoid:** Over-using testid; prefer semantic selectors first

### 4. **locator() CSS** — Last Resort (Brittle)
```javascript
// Only when all semantic options exhausted
await page.locator('div[data-id="widget-123"]').click();
```
**When:** No other option viable; escalate for guidance
**Why:** Fragile; breaks on DOM refactors
**Constraints:**
- ❌ No nth-child/nth-of-type (too brittle)
- ✅ Use data-* attributes over class selectors
- ✅ Max depth: 3 levels
- ❌ Never chained class selectors

### Fallback Pattern
```
Primary: getByRole() or getByLabel()
  ↓ Fails?
Secondary: getByTestId()
  ↓ Fails?
Tertiary: locator() with data attributes
  ↓ Fails?
⚠️ Escalate for guidance
```

---

## Fixtures & Test Isolation

### Shared Fixtures (Use for Setup)
```javascript
// tests/fixtures/auth.fixture.js
const authentication = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('secure-password');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Cleanup: Logout
    await use(page);
    await page.getByRole('button', { name: /logout/i }).click();
  },
});

module.exports = { authentication };
```

### Test Independence
- Each test must run standalone
- No reliance on previous test state
- Data cleanup before/after test
- Avoid `beforeAll()`; prefer `beforeEach()`/`afterEach()`

---

## Anti-Patterns (Never Do These)

### ❌ Hard Timeouts
```javascript
// WRONG: Non-deterministic, causes flakiness
await page.waitForTimeout(1000);

// CORRECT: Implicit waits with locators
await expect(page.getByRole('button')).toBeEnabled();
```

### ❌ Shared State Between Tests
```javascript
// WRONG: Test B depends on Test A completing
test('A: Create user', () => { /* ... */ });
test('B: Login user', () => { /* depends on A */ });

// CORRECT: Each test self-sufficient
test('Create & login user', () => { /* complete flow */ });
```

### ❌ External Dependencies
```javascript
// WRONG: Test fails if external site down
await page.goto('https://external-api.com/data');

// CORRECT: Use mock/fixture or internal service
await page.goto('/api/mock-data');
```

### ❌ Brittle Text Assertions
```javascript
// WRONG: Breaks on any wording change
await expect(page.locator('div')).toHaveText('Exact error message here');

// CORRECT: Semantic + flexible matching
await expect(page.getByRole('alert')).toContainText(/error/i);
```

### ❌ Multiple Assertions (Multiple Failure Reasons)
```javascript
// WRONG: If any assertion fails, unclear which one
await expect(page).toHaveTitle('Home');
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page.getByRole('button')).toHaveCount(3);

// CORRECT: One assertion per test, one reason to fail
test('should display welcome heading', () => {
  await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
});
```

### ❌ Sensitive Data in Tests
```javascript
// WRONG: Hardcoded credentials in code
const password = 'MyActualPassword123';

// CORRECT: Use environment variables/fixtures
const password = process.env.TEST_USER_PASSWORD;
```

---

## Fixture Patterns

### Authentication Fixture
```javascript
// tests/fixtures/auth.fixture.js
const authFixture = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Pre-test: Login
    await loginUser(page, 'test@example.com', 'password');
    await use(page);
    // Post-test: Logout & cleanup
    await logoutUser(page);
  },
});

// Usage in test
test('should display user profile', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/profile');
  await expect(authenticatedPage.getByRole('heading', { name: /profile/i })).toBeVisible();
});
```

### Page Navigation Fixture
```javascript
// tests/fixtures/pages.fixture.js
const pageFixture = base.extend({
  homePage: async ({ page }, use) => {
    await page.goto('/');
    await use(page);
  },
  productsPage: async ({ page }, use) => {
    await page.goto('/products');
    await use(page);
  },
});
```

### Test Data Fixture
```javascript
// tests/fixtures/data.fixture.js
const dataFixture = base.extend({
  testUser: {
    email: 'test@example.com',
    name: 'Test User',
    password: process.env.TEST_PASSWORD,
  },
});
```

---

## Timeout & Retry Policies

### Default Behavior (playwright.config.js)
- **Local:** 0 retries, unlimited parallel, immediate feedback
- **CI:** 2 retries, serial execution, trace on first failure

### Per-Test Timeout Override
```javascript
test('slow operation should complete', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds for this test only
  // ... test code
});
```

### Waiting Patterns
```javascript
// ✅ Implicit waits (auto-retrying)
await expect(page.getByRole('button')).toBeEnabled();

// ✅ Explicit conditional wait
await page.getByRole('button').waitFor({ state: 'visible', timeout: 5000 });

// ❌ Fixed waits (non-deterministic)
await page.waitForTimeout(1000);
```

---

## CI/CD Behavior

### Environment Detection
Tests adapt automatically based on `process.env.CI`:
- **Local:** `npm test` → parallel, no retries, fast feedback
- **CI:** `CI=true npm test` → serial, 2 retries, trace collection
- **Debug:** `npm run test:debug` → interactive debugging

### Forbidden in CI
```javascript
test.only('debug test', () => { }); // ❌ Fails CI build
test.skip('skip test', () => { }); // ⚠️ Discouraged
```

---

## References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors & Locators](https://playwright.dev/docs/locators)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- For detailed governance: See `.github/agents/qa-delivery.agent.md`
