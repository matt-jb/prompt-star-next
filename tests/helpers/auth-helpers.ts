import { Page } from "@playwright/test";

/**
 * Test user credentials
 */
export const TEST_USER = {
  email: "test@example.com",
  password: "password123",
  username: "testuser",
  name: "Test User",
};

/**
 * Login to the application using the test user credentials.
 * Navigates to the login page, fills in credentials, and submits the form.
 *
 * @param page - Playwright page object
 */
export async function login(page: Page) {
  await page.goto("/login");

  // Wait for the login form to be visible
  await page.waitForSelector("form");

  // Fill in credentials
  await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
  await page.fill(
    'input[name="password"], input[type="password"]',
    TEST_USER.password
  );

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for navigation to complete (usually redirects to dashboard or home)
  await page.waitForURL("**", { timeout: 10000 });
}

/**
 * Logout from the application.
 *
 * @param page - Playwright page object
 */
export async function logout(page: Page) {
  // This depends on your UI implementation
  // Typically clicks on user menu and logout button
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');

  // Wait for redirect to home or login page
  await page.waitForURL("**", { timeout: 5000 });
}

/**
 * Check if the user is logged in by checking for authenticated UI elements.
 *
 * @param page - Playwright page object
 * @returns true if user appears to be logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check for authenticated elements (adjust selectors based on your UI)
    const userMenuVisible = await page.isVisible('[data-testid="user-menu"]');
    return userMenuVisible;
  } catch {
    return false;
  }
}
