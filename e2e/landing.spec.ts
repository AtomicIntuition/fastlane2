import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('loads and displays hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Fasting Journey')
    await expect(page.getByRole('link', { name: /start fasting free/i })).toBeVisible()
  })

  test('displays features section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#features')).toBeVisible()
    await expect(page.getByText('Smart Timer')).toBeVisible()
  })

  test('displays pricing section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Free')).toBeVisible()
    await expect(page.getByText('Pro')).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
  })

  test('CTA button links to register', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: /start fasting free/i }).first()
    await expect(cta).toHaveAttribute('href', '/register')
  })

  test('footer is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toBeVisible()
  })
})
