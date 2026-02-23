// @ts-check
const { test, expect } = require("@playwright/test");

test("should log in successfully with valid credentials", async ({ page }) => {
  // Arrange: Navigate to SauceDemo login page
  await page.goto("https://www.saucedemo.com");

  // Act: Fill in login credentials and submit
  // Ensure form is interactive before attempting fill (Step 3: Form visibility wait)
  // Note: SauceDemo uses data-test attribute (not data-testid), so using locator() with CSS selector
  await page.locator('[data-test="username"]').waitFor({ state: "visible" });

  // Username field - SauceDemo uses data-test="username"
  await page.locator('[data-test="username"]').fill("standard_user");

  // Password field - SauceDemo uses data-test="password"
  await page.locator('[data-test="password"]').fill("secret_sauce");
  // Click login button using getByRole (semantic selector)
  await page.getByRole("button", { name: /login/i }).click();

  // Step 4: Explicit wait for navigation before assertion (prevents race condition)
  await page.waitForURL(/.*inventory/);

  // Assert: Verify successful login via URL change to inventory page
  await expect(page).toHaveURL(/.*inventory/);
});
