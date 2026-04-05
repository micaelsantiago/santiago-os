'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getAuthenticatedUser } from '@/lib/supabase/get-user'
import {
  createColumnSchema,
  createTaskSchema,
  moveTaskSchema,
  updateColumnSchema,
  updateTaskSchema,
} from '@/modules/tasks/types/task.types'

const uuidParam = z.string().uuid()
import type {
  Board,
  Column,
  CreateColumnInput,
  CreateTaskInput,
  MoveTaskInput,
  Task,
  UpdateColumnInput,
  UpdateTaskInput,
} from '@/modules/tasks/types/task.types'

// ========================================
// Boards
// ========================================

export async function getOrCreateDefaultBoard() {
  const { supabase, user } = await getAuthenticatedUser()

  // Buscar board padrão do usuário
  const { data: existing, error: selectError } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'tasks')
    .limit(1)
    .single()

  if (existing) return { success: true, data: existing as Board }

  // Criar board padrão com 3 colunas
  if (selectError && selectError.code !== 'PGRST116') {
    return { error: 'Erro ao buscar board' }
  }

  const { data: board, error: boardError } = await supabase
    .from('boards')
    .insert({ title: 'Minhas Tarefas', type: 'tasks', user_id: user.id })
    .select()
    .single()

  if (boardError || !board) return { error: 'Erro ao criar board' }

  const defaultColumns = [
    { board_id: board.id, user_id: user.id, title: 'Backlog', position: 0 },
    { board_id: board.id, user_id: user.id, title: 'Em progresso', position: 1 },
    { board_id: board.id, user_id: user.id, title: 'Concluído', position: 2 },
  ]

  const { error: colError } = await supabase.from('columns').insert(defaultColumns)

  if (colError) return { error: 'Erro ao criar colunas padrão' }

  revalidatePath('/tasks')
  return { success: true, data: board as Board }
}

// ========================================
// Columns
// ========================================

export async function getColumns(boardId: string) {
  if (!uuidParam.safeParse(boardId).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()

  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  if (error) return { error: 'Erro ao buscar colunas' }
  return { success: true, data: (data ?? []) as Column[] }
}

export async function createColumn(input: CreateColumnInput) {
  const { supabase, user } = await getAuthenticatedUser()
  const parsed = createColumnSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from('columns')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return { error: 'Erro ao criar coluna' }
  revalidatePath('/tasks')
  return { success: true, data: data as Column }
}

export async function updateColumn(id: string, input: UpdateColumnInput) {
  if (!uuidParam.safeParse(id).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()
  const parsed = updateColumnSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from('columns')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: 'Erro ao atualizar coluna' }
  revalidatePath('/tasks')
  return { success: true, data: data as Column }
}

export async function deleteColumn(id: string) {
  if (!uuidParam.safeParse(id).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()

  const { error } = await supabase.from('columns').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { error: 'Erro ao deletar coluna' }
  revalidatePath('/tasks')
  return { success: true }
}

// ========================================
// Tasks
// ========================================

export async function getBoardTasks(boardId: string) {
  if (!uuidParam.safeParse(boardId).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()

  // Buscar todas tasks do board via columns
  const { data: columns } = await supabase
    .from('columns')
    .select('id')
    .eq('board_id', boardId)
    .eq('user_id', user.id)

  if (!columns || columns.length === 0) {
    return { success: true, data: [] as Task[] }
  }

  const columnIds = columns.map((c) => c.id)

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .in('column_id', columnIds)
    .order('position', { ascending: true })

  if (error) return { error: 'Erro ao buscar tarefas' }
  return { success: true, data: (data ?? []) as Task[] }
}

export async function createTask(input: CreateTaskInput) {
  const { supabase, user } = await getAuthenticatedUser()
  const parsed = createTaskSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  // Calcular próxima posição na coluna
  const { count } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('column_id', parsed.data.column_id)
    .eq('user_id', user.id)

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...parsed.data,
      user_id: user.id,
      position: count ?? 0,
    })
    .select()
    .single()

  if (error) return { error: 'Erro ao criar tarefa' }
  revalidatePath('/tasks')
  return { success: true, data: data as Task }
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  if (!uuidParam.safeParse(id).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()
  const parsed = updateTaskSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from('tasks')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: 'Erro ao atualizar tarefa' }
  revalidatePath('/tasks')
  return { success: true, data: data as Task }
}

export async function deleteTask(id: string) {
  if (!uuidParam.safeParse(id).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()

  const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { error: 'Erro ao deletar tarefa' }
  revalidatePath('/tasks')
  return { success: true }
}

export async function moveTask(input: MoveTaskInput) {
  const { supabase, user } = await getAuthenticatedUser()
  const parsed = moveTaskSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { taskId, columnId, position } = parsed.data

  // Verificar que a coluna destino pertence ao usuário
  const { data: column } = await supabase
    .from('columns')
    .select('id')
    .eq('id', columnId)
    .eq('user_id', user.id)
    .single()

  if (!column) return { error: 'Coluna não encontrada' }

  const { error } = await supabase
    .from('tasks')
    .update({ column_id: columnId, position })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao mover tarefa' }
  revalidatePath('/tasks')
  return { success: true }
}

// ========================================
// Tags
// ========================================

export async function addTaskTag(taskId: string, tag: string) {
  if (!uuidParam.safeParse(taskId).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()

  // Verificar ownership da task antes de adicionar tag
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  if (!task) return { error: 'Tarefa não encontrada' }

  const { error } = await supabase.from('task_tags').insert({ task_id: taskId, tag })

  if (error) return { error: 'Erro ao adicionar tag' }
  revalidatePath('/tasks')
  return { success: true }
}

export async function removeTaskTag(taskId: string, tag: string) {
  if (!uuidParam.safeParse(taskId).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()

  // Verificar ownership da task antes de remover tag
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  if (!task) return { error: 'Tarefa não encontrada' }

  const { error } = await supabase.from('task_tags').delete().eq('task_id', taskId).eq('tag', tag)

  if (error) return { error: 'Erro ao remover tag' }
  revalidatePath('/tasks')
  return { success: true }
}
