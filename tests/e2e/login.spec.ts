import { test, expect } from '@playwright/test'

// Este teste não usa o setup de auth — testa o fluxo de login direto
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login', () => {
  test('redireciona para /login quando não autenticado', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page).toHaveURL(/\/login/)
  })

  test('mostra formulário de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Entrar no Santiago OS')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('mostra erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#email').fill('invalid@test.com')
    await page.locator('#password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Entrar' }).click()

    // Esperar mensagem de erro aparecer
    await expect(page.getByText(/erro|inválid/i)).toBeVisible({ timeout: 10_000 })
  })
})
