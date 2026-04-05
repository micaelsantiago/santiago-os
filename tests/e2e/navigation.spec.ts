import { test, expect } from '@playwright/test'

test.describe('Command Palette (Ctrl+K)', () => {
  test('abre e fecha com atalho', async ({ page }) => {
    await page.goto('/tasks')

    // Abrir com Ctrl+K
    await page.keyboard.press('Control+k')
    await expect(page.locator('.palette__container')).toBeVisible()

    // Fechar com Escape
    await page.keyboard.press('Escape')
    await expect(page.locator('.palette__container')).not.toBeVisible()
  })

  test('navega para notas via command palette', async ({ page }) => {
    await page.goto('/tasks')

    await page.keyboard.press('Control+k')
    await expect(page.locator('.palette__container')).toBeVisible()

    // Digitar para filtrar
    await page.keyboard.type('Notas')
    await page.locator('.palette__item', { hasText: 'Notas' }).click()

    await expect(page).toHaveURL(/\/notes/)
  })

  test('navega para tarefas via command palette', async ({ page }) => {
    await page.goto('/notes')

    await page.keyboard.press('Control+k')
    await page.keyboard.type('Tarefas')
    await page.locator('.palette__item', { hasText: 'Tarefas' }).click()

    await expect(page).toHaveURL(/\/tasks/)
  })
})

test.describe('Sidebar', () => {
  test('navega entre módulos pela sidebar', async ({ page }) => {
    await page.goto('/tasks')

    // Navegar para notas
    await page.locator('.sidebar__link[href="/notes"]').click()
    await expect(page).toHaveURL(/\/notes/)

    // Navegar de volta para tarefas
    await page.locator('.sidebar__link[href="/tasks"]').click()
    await expect(page).toHaveURL(/\/tasks/)
  })
})
