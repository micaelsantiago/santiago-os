import { test as setup, expect } from '@playwright/test'
import path from 'node:path'

const authFile = path.join(__dirname, '..', '.auth', 'user.json')

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD

  if (!email || !password) {
    throw new Error('E2E_USER_EMAIL and E2E_USER_PASSWORD must be set for E2E tests')
  }

  await page.goto('/login')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()

  // Esperar redirecionamento para /tasks
  await expect(page).toHaveURL(/\/tasks/)

  await page.context().storageState({ path: authFile })
})
