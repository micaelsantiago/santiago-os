import { z } from 'zod'

// ========================================
// Entity schemas (full rows)
// ========================================

export const boardSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  type: z.enum(['tasks', 'project']),
  project_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
})

export const columnSchema = z.object({
  id: z.string().uuid(),
  board_id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  position: z.number().int(),
  color: z.string().nullable(),
})

export const taskSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  column_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'in_progress', 'done', 'cancelled']),
  position: z.number().int(),
  due_date: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const taskTagSchema = z.object({
  task_id: z.string().uuid(),
  tag: z.string().min(1).max(100),
})

// ========================================
// Input schemas (mutations)
// ========================================

export const createBoardSchema = z.object({
  title: z.string().min(1).max(255),
  type: z.enum(['tasks', 'project']).default('tasks'),
  project_id: z.string().uuid().nullable().default(null),
})

export const createColumnSchema = z.object({
  board_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  position: z.number().int(),
  color: z.string().nullable().default(null),
})

export const updateColumnSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  color: z.string().nullable().optional(),
})

export const createTaskSchema = z.object({
  column_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().nullable().default(null),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().datetime().nullable().default(null),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['open', 'in_progress', 'done', 'cancelled']).optional(),
  due_date: z.string().datetime().nullable().optional(),
})

export const moveTaskSchema = z.object({
  taskId: z.string().uuid(),
  columnId: z.string().uuid(),
  position: z.number().int(),
})

// ========================================
// Inferred types
// ========================================

export type Board = z.infer<typeof boardSchema>
export type Column = z.infer<typeof columnSchema>
export type Task = z.infer<typeof taskSchema>
export type TaskTag = z.infer<typeof taskTagSchema>
export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type CreateColumnInput = z.infer<typeof createColumnSchema>
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type MoveTaskInput = z.infer<typeof moveTaskSchema>
