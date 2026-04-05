import { test, expect } from '@playwright/test'

test.describe('Notas', () => {
  test('cria nota, salva e reabre', async ({ page }) => {
    await page.goto('/notes')

    // Criar nova nota via botão ou query param
    await page.goto('/notes?create=true')

    // Esperar o editor carregar
    const titleInput = page.locator('input[placeholder*="título"], input[name="title"]').first()
    await expect(titleInput).toBeVisible({ timeout: 10_000 })

    // Preencher título
    const noteTitle = `Nota E2E ${Date.now()}`
    await titleInput.fill(noteTitle)

    // Clicar fora ou esperar autosave
    await page.keyboard.press('Tab')
    await page.waitForTimeout(1000)

    // Navegar para outra página e voltar
    await page.locator('.sidebar__link[href="/tasks"]').click()
    await expect(page).toHaveURL(/\/tasks/)

    await page.locator('.sidebar__link[href="/notes"]').click()
    await expect(page).toHaveURL(/\/notes/)

    // Verificar que a nota criada aparece na lista
    await expect(page.getByText(noteTitle)).toBeVisible({ timeout: 10_000 })
  })
})
