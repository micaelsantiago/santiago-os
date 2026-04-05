import { beforeEach, describe, expect, it } from 'vitest'
import { mockResult, mockSupabaseClient, resetMocks } from '../helpers/supabase-mock'
import {
  addTaskTag,
  createColumn,
  createTask,
  deleteColumn,
  deleteTask,
  getBoardTasks,
  getColumns,
  getOrCreateDefaultBoard,
  moveTask,
  removeTaskTag,
  updateColumn,
  updateTask,
} from '@/modules/tasks/actions/task.actions'

const uuid = '550e8400-e29b-41d4-a716-446655440000'

beforeEach(() => {
  resetMocks()
})

// ========================================
// getOrCreateDefaultBoard
// ========================================

describe('getOrCreateDefaultBoard', () => {
  it('retorna board existente', async () => {
    const board = { id: uuid, title: 'Minhas Tarefas', type: 'tasks' }
    // .from('boards').select('*').eq(...).eq(...).limit(1).single()
    mockResult({ data: board, error: null })

    const result = await getOrCreateDefaultBoard()
    expect(result).toEqual({ success: true, data: board })
  })

  it('cria board se não existir', async () => {
    const board = { id: uuid, title: 'Minhas Tarefas', type: 'tasks' }
    // First: select → not found
    mockResult({ data: null, error: { code: 'PGRST116', message: 'not found' } })
    // Second: insert board → select → single
    mockResult({ data: board, error: null })
    // Third: insert columns
    mockResult({ error: null })

    const result = await getOrCreateDefaultBoard()
    expect(result).toEqual({ success: true, data: board })
  })

  it('retorna erro se select falhar com erro diferente de PGRST116', async () => {
    mockResult({ data: null, error: { code: 'OTHER', message: 'db error' } })

    const result = await getOrCreateDefaultBoard()
    expect(result).toEqual({ error: 'Erro ao buscar board' })
  })

  it('retorna erro se insert do board falhar', async () => {
    // select: not found
    mockResult({ data: null, error: { code: 'PGRST116', message: 'not found' } })
    // insert board: fail
    mockResult({ data: null, error: { code: 'INSERT_ERR', message: 'fail' } })

    const result = await getOrCreateDefaultBoard()
    expect(result).toEqual({ error: 'Erro ao criar board' })
  })

  it('retorna erro se insert das colunas falhar', async () => {
    const board = { id: uuid, title: 'Minhas Tarefas', type: 'tasks' }
    mockResult({ data: null, error: { code: 'PGRST116', message: 'not found' } })
    mockResult({ data: board, error: null })
    mockResult({ error: { message: 'col error' } })

    const result = await getOrCreateDefaultBoard()
    expect(result).toEqual({ error: 'Erro ao criar colunas padrão' })
  })
})

// ========================================
// Columns
// ========================================

describe('getColumns', () => {
  it('retorna colunas do board', async () => {
    const cols = [{ id: uuid, title: 'Backlog', position: 0 }]
    mockResult({ data: cols, error: null })

    const result = await getColumns(uuid)
    expect(result).toEqual({ success: true, data: cols })
  })

  it('retorna erro se query falhar', async () => {
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await getColumns(uuid)
    expect(result).toEqual({ error: 'Erro ao buscar colunas' })
  })

  it('retorna array vazio se data é null', async () => {
    mockResult({ data: null, error: null })

    const result = await getColumns(uuid)
    expect(result).toEqual({ success: true, data: [] })
  })
})

describe('createColumn', () => {
  it('cria coluna com input válido', async () => {
    const col = { id: uuid, title: 'Nova', position: 0 }
    mockResult({ data: col, error: null })

    const result = await createColumn({ board_id: uuid, title: 'Nova', position: 0 })
    expect(result).toEqual({ success: true, data: col })
  })

  it('retorna erro de validação com input inválido', async () => {
    const result = await createColumn({ board_id: 'bad', title: '', position: 0 })
    expect(result.error).toBeDefined()
    expect(result).not.toHaveProperty('success')
  })

  it('retorna erro se insert falhar', async () => {
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await createColumn({ board_id: uuid, title: 'Col', position: 0 })
    expect(result).toEqual({ error: 'Erro ao criar coluna' })
  })
})

describe('updateColumn', () => {
  it('atualiza coluna com input válido', async () => {
    const col = { id: uuid, title: 'Editada' }
    mockResult({ data: col, error: null })

    const result = await updateColumn(uuid, { title: 'Editada' })
    expect(result).toEqual({ success: true, data: col })
  })

  it('retorna erro de validação', async () => {
    const result = await updateColumn(uuid, { title: '' })
    expect(result.error).toBeDefined()
  })

  it('retorna erro se update falhar', async () => {
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await updateColumn(uuid, { title: 'Col' })
    expect(result).toEqual({ error: 'Erro ao atualizar coluna' })
  })
})

describe('deleteColumn', () => {
  it('deleta coluna com sucesso', async () => {
    mockResult({ error: null })

    const result = await deleteColumn(uuid)
    expect(result).toEqual({ success: true })
  })

  it('retorna erro se delete falhar', async () => {
    mockResult({ error: { message: 'fail' } })

    const result = await deleteColumn(uuid)
    expect(result).toEqual({ error: 'Erro ao deletar coluna' })
  })
})

// ========================================
// Tasks
// ========================================

describe('getBoardTasks', () => {
  it('retorna tasks do board', async () => {
    const columns = [{ id: uuid }]
    const tasks = [{ id: uuid, title: 'Task 1', column_id: uuid }]
    // First await: select columns
    mockResult({ data: columns })
    // Second await: select tasks
    mockResult({ data: tasks, error: null })

    const result = await getBoardTasks(uuid)
    expect(result).toEqual({ success: true, data: tasks })
  })

  it('retorna array vazio se não há colunas', async () => {
    mockResult({ data: [] })

    const result = await getBoardTasks(uuid)
    expect(result).toEqual({ success: true, data: [] })
  })

  it('retorna array vazio se columns é null', async () => {
    mockResult({ data: null })

    const result = await getBoardTasks(uuid)
    expect(result).toEqual({ success: true, data: [] })
  })

  it('retorna erro se query de tasks falhar', async () => {
    mockResult({ data: [{ id: uuid }] })
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await getBoardTasks(uuid)
    expect(result).toEqual({ error: 'Erro ao buscar tarefas' })
  })
})

describe('createTask', () => {
  it('cria task com input válido', async () => {
    const task = { id: uuid, title: 'Nova task', priority: 'medium' }
    // First await: count query
    mockResult({ count: 3 })
    // Second await: insert + single
    mockResult({ data: task, error: null })

    const result = await createTask({ column_id: uuid, title: 'Nova task' })
    expect(result).toEqual({ success: true, data: task })
  })

  it('retorna erro de validação com input inválido', async () => {
    const result = await createTask({ column_id: 'bad', title: '' })
    expect(result.error).toBeDefined()
    expect(result).not.toHaveProperty('success')
  })

  it('retorna erro se insert falhar', async () => {
    mockResult({ count: 0 })
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await createTask({ column_id: uuid, title: 'Task' })
    expect(result).toEqual({ error: 'Erro ao criar tarefa' })
  })

  it('usa count 0 quando count é null', async () => {
    const task = { id: uuid, title: 'Task' }
    mockResult({ count: null })
    mockResult({ data: task, error: null })

    const result = await createTask({ column_id: uuid, title: 'Task' })
    expect(result).toEqual({ success: true, data: task })
    // Verify insert was called (position should be 0 when count is null)
    expect(mockSupabaseClient.insert).toHaveBeenCalled()
  })
})

describe('updateTask', () => {
  it('atualiza task com input válido', async () => {
    const task = { id: uuid, title: 'Atualizada' }
    mockResult({ data: task, error: null })

    const result = await updateTask(uuid, { title: 'Atualizada' })
    expect(result).toEqual({ success: true, data: task })
  })

  it('retorna erro de validação', async () => {
    const result = await updateTask(uuid, { priority: 'invalid' as 'high' })
    expect(result.error).toBeDefined()
  })

  it('retorna erro se update falhar', async () => {
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await updateTask(uuid, { title: 'Ok' })
    expect(result).toEqual({ error: 'Erro ao atualizar tarefa' })
  })
})

describe('deleteTask', () => {
  it('deleta task com sucesso', async () => {
    mockResult({ error: null })

    const result = await deleteTask(uuid)
    expect(result).toEqual({ success: true })
  })

  it('retorna erro se delete falhar', async () => {
    mockResult({ error: { message: 'fail' } })

    const result = await deleteTask(uuid)
    expect(result).toEqual({ error: 'Erro ao deletar tarefa' })
  })
})

describe('moveTask', () => {
  it('move task com sucesso', async () => {
    // 1st await: ownership check da coluna destino
    mockResult({ data: { id: uuid } })
    // 2nd await: update da task
    mockResult({ error: null })

    const result = await moveTask({ taskId: uuid, columnId: uuid, position: 2 })
    expect(result).toEqual({ success: true })
  })

  it('retorna erro de validação com input inválido', async () => {
    const result = await moveTask({ taskId: 'bad', columnId: uuid, position: 0 })
    expect(result.error).toBeDefined()
  })

  it('retorna erro se coluna não pertence ao user', async () => {
    mockResult({ data: null })

    const result = await moveTask({ taskId: uuid, columnId: uuid, position: 0 })
    expect(result).toEqual({ error: 'Coluna não encontrada' })
  })

  it('retorna erro se update falhar', async () => {
    mockResult({ data: { id: uuid } })
    mockResult({ error: { message: 'fail' } })

    const result = await moveTask({ taskId: uuid, columnId: uuid, position: 0 })
    expect(result).toEqual({ error: 'Erro ao mover tarefa' })
  })
})

// ========================================
// Tags
// ========================================

describe('addTaskTag', () => {
  it('adiciona tag com sucesso', async () => {
    // 1st await: ownership check da task
    mockResult({ data: { id: uuid } })
    // 2nd await: insert da tag
    mockResult({ error: null })

    const result = await addTaskTag(uuid, 'urgent')
    expect(result).toEqual({ success: true })
  })

  it('retorna erro se task não pertence ao user', async () => {
    mockResult({ data: null })

    const result = await addTaskTag(uuid, 'urgent')
    expect(result).toEqual({ error: 'Tarefa não encontrada' })
  })

  it('retorna erro se insert falhar', async () => {
    mockResult({ data: { id: uuid } })
    mockResult({ error: { message: 'fail' } })

    const result = await addTaskTag(uuid, 'urgent')
    expect(result).toEqual({ error: 'Erro ao adicionar tag' })
  })
})

describe('removeTaskTag', () => {
  it('remove tag com sucesso', async () => {
    // 1st await: ownership check da task
    mockResult({ data: { id: uuid } })
    // 2nd await: delete da tag
    mockResult({ error: null })

    const result = await removeTaskTag(uuid, 'urgent')
    expect(result).toEqual({ success: true })
  })

  it('retorna erro se task não pertence ao user', async () => {
    mockResult({ data: null })

    const result = await removeTaskTag(uuid, 'urgent')
    expect(result).toEqual({ error: 'Tarefa não encontrada' })
  })

  it('retorna erro se delete falhar', async () => {
    mockResult({ data: { id: uuid } })
    mockResult({ error: { message: 'fail' } })

    const result = await removeTaskTag(uuid, 'urgent')
    expect(result).toEqual({ error: 'Erro ao remover tag' })
  })
})
