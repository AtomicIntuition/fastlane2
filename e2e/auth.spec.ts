import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('register page loads', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText('Create your account')).toBeVisible()
  })

  test('login form shows validation errors', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/email is required/i)).toBeVisible()
  })

  test('register form shows validation errors', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByText(/name must be/i)).toBeVisible()
  })

  test('unauthenticated users redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain('/login')
  })

  test('login and register pages link to each other', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: /create one/i })).toBeVisible()

    await page.goto('/register')
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })
})
