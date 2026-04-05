import { test, expect } from '@playwright/test'

test.describe('Tarefas', () => {
  test('cria tarefa e aparece no board', async ({ page }) => {
    await page.goto('/tasks')

    // Esperar o board carregar
    await expect(page.locator('.tasks-page')).toBeVisible({ timeout: 10_000 })

    // Abrir diálogo de criação (via botão na toolbar ou query param)
    await page.goto('/tasks?create=true')

    // Esperar o diálogo/formulário
    const titleInput = page
      .locator('input[placeholder*="título"], input[placeholder*="tarefa"], input[name="title"]')
      .first()
    await expect(titleInput).toBeVisible({ timeout: 10_000 })

    // Preencher título da tarefa
    const taskTitle = `Tarefa E2E ${Date.now()}`
    await titleInput.fill(taskTitle)

    // Submeter formulário
    const submitButton = page.getByRole('button', { name: /criar|salvar|adicionar/i })
    await submitButton.click()

    // Verificar que a tarefa aparece no board
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10_000 })
  })
})
