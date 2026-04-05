import { describe, expect, it } from 'vitest'
import {
  boardSchema,
  columnSchema,
  createBoardSchema,
  createColumnSchema,
  createTaskSchema,
  moveTaskSchema,
  taskSchema,
  taskTagSchema,
  updateColumnSchema,
  updateTaskSchema,
} from '@/modules/tasks/types/task.types'

const uuid = '550e8400-e29b-41d4-a716-446655440000'
const datetime = '2026-01-01T00:00:00Z'

// ========================================
// Entity schemas
// ========================================

describe('boardSchema', () => {
  const valid = {
    id: uuid,
    user_id: uuid,
    title: 'Board',
    type: 'tasks' as const,
    project_id: null,
    created_at: datetime,
  }

  it('valida entidade completa', () => {
    expect(boardSchema.safeParse(valid).success).toBe(true)
  })

  it('aceita type project', () => {
    expect(boardSchema.safeParse({ ...valid, type: 'project' }).success).toBe(true)
  })

  it('rejeita type inválido', () => {
    expect(boardSchema.safeParse({ ...valid, type: 'invalid' }).success).toBe(false)
  })

  it('rejeita título vazio', () => {
    expect(boardSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
  })

  it('aceita project_id uuid', () => {
    expect(boardSchema.safeParse({ ...valid, project_id: uuid }).success).toBe(true)
  })
})

describe('columnSchema', () => {
  const valid = {
    id: uuid,
    board_id: uuid,
    user_id: uuid,
    title: 'Backlog',
    position: 0,
    color: null,
  }

  it('valida entidade completa', () => {
    expect(columnSchema.safeParse(valid).success).toBe(true)
  })

  it('aceita color como string', () => {
    expect(columnSchema.safeParse({ ...valid, color: '#ff0000' }).success).toBe(true)
  })

  it('rejeita position decimal', () => {
    expect(columnSchema.safeParse({ ...valid, position: 1.5 }).success).toBe(false)
  })

  it('rejeita título vazio', () => {
    expect(columnSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
  })
})

describe('taskSchema', () => {
  const valid = {
    id: uuid,
    user_id: uuid,
    column_id: uuid,
    title: 'Tarefa',
    description: null,
    priority: 'medium' as const,
    status: 'open' as const,
    position: 0,
    due_date: null,
    created_at: datetime,
    updated_at: datetime,
  }

  it('valida entidade completa', () => {
    expect(taskSchema.safeParse(valid).success).toBe(true)
  })

  it('aceita todas as prioridades', () => {
    for (const p of ['low', 'medium', 'high']) {
      expect(taskSchema.safeParse({ ...valid, priority: p }).success).toBe(true)
    }
  })

  it('aceita todos os status', () => {
    for (const s of ['open', 'in_progress', 'done', 'cancelled']) {
      expect(taskSchema.safeParse({ ...valid, status: s }).success).toBe(true)
    }
  })

  it('rejeita prioridade inválida', () => {
    expect(taskSchema.safeParse({ ...valid, priority: 'urgent' }).success).toBe(false)
  })

  it('rejeita status inválido', () => {
    expect(taskSchema.safeParse({ ...valid, status: 'pending' }).success).toBe(false)
  })

  it('aceita due_date como datetime', () => {
    expect(taskSchema.safeParse({ ...valid, due_date: datetime }).success).toBe(true)
  })

  it('aceita description como string', () => {
    expect(taskSchema.safeParse({ ...valid, description: 'Detalhes' }).success).toBe(true)
  })
})

describe('taskTagSchema', () => {
  it('valida tag válida', () => {
    expect(taskTagSchema.safeParse({ task_id: uuid, tag: 'urgent' }).success).toBe(true)
  })

  it('rejeita tag vazia', () => {
    expect(taskTagSchema.safeParse({ task_id: uuid, tag: '' }).success).toBe(false)
  })

  it('rejeita tag maior que 100 chars', () => {
    expect(taskTagSchema.safeParse({ task_id: uuid, tag: 'a'.repeat(101) }).success).toBe(false)
  })

  it('rejeita task_id inválido', () => {
    expect(taskTagSchema.safeParse({ task_id: 'bad', tag: 'ok' }).success).toBe(false)
  })
})

// ========================================
// Input schemas
// ========================================

describe('createBoardSchema', () => {
  it('valida com título (usa defaults)', () => {
    const result = createBoardSchema.safeParse({ title: 'Board' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('tasks')
      expect(result.data.project_id).toBeNull()
    }
  })

  it('valida input completo', () => {
    expect(
      createBoardSchema.safeParse({ title: 'Board', type: 'project', project_id: uuid }).success,
    ).toBe(true)
  })

  it('rejeita sem título', () => {
    expect(createBoardSchema.safeParse({}).success).toBe(false)
  })
})

describe('createColumnSchema', () => {
  it('valida input completo', () => {
    const result = createColumnSchema.safeParse({ board_id: uuid, title: 'Col', position: 0 })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.color).toBeNull()
  })

  it('rejeita sem board_id', () => {
    expect(createColumnSchema.safeParse({ title: 'Col', position: 0 }).success).toBe(false)
  })

  it('rejeita sem position', () => {
    expect(createColumnSchema.safeParse({ board_id: uuid, title: 'Col' }).success).toBe(false)
  })
})

describe('updateColumnSchema', () => {
  it('valida objeto vazio', () => {
    expect(updateColumnSchema.safeParse({}).success).toBe(true)
  })

  it('valida title parcial', () => {
    expect(updateColumnSchema.safeParse({ title: 'Novo' }).success).toBe(true)
  })

  it('valida color null', () => {
    expect(updateColumnSchema.safeParse({ color: null }).success).toBe(true)
  })

  it('rejeita título vazio', () => {
    expect(updateColumnSchema.safeParse({ title: '' }).success).toBe(false)
  })
})

describe('createTaskSchema', () => {
  it('valida input mínimo (usa defaults)', () => {
    const result = createTaskSchema.safeParse({ column_id: uuid, title: 'Task' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.priority).toBe('medium')
      expect(result.data.description).toBeNull()
      expect(result.data.due_date).toBeNull()
    }
  })

  it('valida input completo', () => {
    expect(
      createTaskSchema.safeParse({
        column_id: uuid,
        title: 'Task',
        description: 'Desc',
        priority: 'high',
        due_date: datetime,
      }).success,
    ).toBe(true)
  })

  it('rejeita sem column_id', () => {
    expect(createTaskSchema.safeParse({ title: 'Task' }).success).toBe(false)
  })

  it('rejeita sem título', () => {
    expect(createTaskSchema.safeParse({ column_id: uuid }).success).toBe(false)
  })

  it('rejeita prioridade inválida', () => {
    expect(
      createTaskSchema.safeParse({ column_id: uuid, title: 'T', priority: 'urgent' }).success,
    ).toBe(false)
  })
})

describe('updateTaskSchema', () => {
  it('valida objeto vazio', () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(true)
  })

  it('valida campos parciais', () => {
    expect(updateTaskSchema.safeParse({ title: 'Novo' }).success).toBe(true)
    expect(updateTaskSchema.safeParse({ status: 'done' }).success).toBe(true)
    expect(updateTaskSchema.safeParse({ priority: 'low', due_date: null }).success).toBe(true)
  })

  it('rejeita status inválido', () => {
    expect(updateTaskSchema.safeParse({ status: 'pending' }).success).toBe(false)
  })
})

describe('moveTaskSchema', () => {
  it('valida input completo', () => {
    expect(moveTaskSchema.safeParse({ taskId: uuid, columnId: uuid, position: 0 }).success).toBe(
      true,
    )
  })

  it('rejeita position decimal', () => {
    expect(moveTaskSchema.safeParse({ taskId: uuid, columnId: uuid, position: 1.5 }).success).toBe(
      false,
    )
  })

  it('rejeita sem campos', () => {
    expect(moveTaskSchema.safeParse({}).success).toBe(false)
  })
})
