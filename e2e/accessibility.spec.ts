import { test, expect } from '@playwright/test'

const pages = [
  { name: 'Landing', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
]

for (const { name, path } of pages) {
  test.describe(`${name} page accessibility`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path)
    })

    test('has semantic <main> element', async ({ page }) => {
      const main = page.locator('main')
      await expect(main).toHaveCount(1)
    })

    test('has exactly one <h1>', async ({ page }) => {
      const h1s = page.locator('h1')
      await expect(h1s).toHaveCount(1)
    })

    test('all form inputs have labels', async ({ page }) => {
      const inputs = page.locator('input:not([type="hidden"]):not([type="submit"])')
      const count = await inputs.count()
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i)
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledby = await input.getAttribute('aria-labelledby')
        const placeholder = await input.getAttribute('placeholder')

        // Input should have either an id-linked label, aria-label, aria-labelledby, or title
        if (id) {
          const label = page.locator(`label[for="${id}"]`)
          const labelCount = await label.count()
          if (labelCount > 0) continue
        }
        // Fallback to ARIA attributes
        const hasAccessibleName = ariaLabel || ariaLabelledby || placeholder
        expect(
          hasAccessibleName,
          `Input ${i} (id="${id}") missing accessible label`,
        ).toBeTruthy()
      }
    })

    test('interactive elements have accessible names', async ({ page }) => {
      const buttons = page.locator('button, a[role="button"], [role="button"]')
      const count = await buttons.count()
      for (let i = 0; i < count; i++) {
        const el = buttons.nth(i)
        const text = await el.textContent()
        const ariaLabel = await el.getAttribute('aria-label')
        const title = await el.getAttribute('title')
        expect(
          text?.trim() || ariaLabel || title,
          `Button ${i} has no accessible name`,
        ).toBeTruthy()
      }
    })

    test('no duplicate IDs', async ({ page }) => {
      const duplicates = await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id)
        const seen = new Set<string>()
        const dupes: string[] = []
        for (const id of ids) {
          if (seen.has(id)) dupes.push(id)
          seen.add(id)
        }
        return dupes
      })
      expect(duplicates, `Duplicate IDs found: ${duplicates.join(', ')}`).toHaveLength(0)
    })
  })
}
