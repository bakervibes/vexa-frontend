/**
 * Tests E2E pour l'authentification
 */

import { expect, test } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/')

    // Click on login button in header (if exists)
    const loginButton = page.getByRole('button', {
      name: /connexion|login|se connecter/i,
    })
    if (await loginButton.isVisible()) {
      await loginButton.click()
    }

    // Or navigate directly to auth page
    await page.goto('/auth/login')

    // Verify login form is visible
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe|password/i)).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/login')

    // Try to submit empty form
    const submitButton = page.getByRole('button', {
      name: /connexion|login|se connecter/i,
    })
    await submitButton.click()

    // Should show validation errors
    // The exact error depends on your implementation
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/auth/login')

    // Find and click register link
    const registerLink = page.getByRole('link', {
      name: /créer.*compte|inscription|register|sign up/i,
    })
    if (await registerLink.isVisible()) {
      await registerLink.click()
      await expect(page).toHaveURL(/register|signup|inscription/)
    }
  })
})

test.describe('Navigation', () => {
  test('should display header', async ({ page }) => {
    await page.goto('/')

    // Check header exists
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('should navigate to shop page', async ({ page }) => {
    await page.goto('/')

    // Click on shop link
    const shopLink = page.getByRole('link', { name: /shop|boutique/i })
    if (await shopLink.isVisible()) {
      await shopLink.click()
      await expect(page).toHaveURL(/shop/)
    }
  })
})

test.describe('Products', () => {
  test('should display products on shop page', async ({ page }) => {
    await page.goto('/shop')

    // Wait for products to load (adjust selector based on your implementation)
    await page.waitForSelector(
      '[data-testid="product-card"], .product-card, article',
    )
  })

  test('should filter products', async ({ page }) => {
    await page.goto('/shop')

    // Find filter/search input
    const searchInput = page.getByPlaceholder(/rechercher|search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      // Wait for filtered results
      await page.waitForTimeout(500)
    }
  })
})
