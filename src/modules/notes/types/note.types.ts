import { z } from 'zod'

export const noteFolderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable(),
  title: z.string().min(1).max(255),
  position: z.number().int().default(0),
})

export const noteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  folder_id: z.string().uuid().nullable(),
  title: z.string().min(1).max(255),
  content: z.string().default(''),
  is_pinned: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createNoteSchema = z.object({
  title: z.string().min(1).max(255).default('Sem título'),
  content: z.string().default(''),
  folder_id: z.string().uuid().nullable().default(null),
})

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  folder_id: z.string().uuid().nullable().optional(),
  is_pinned: z.boolean().optional(),
})

export const createFolderSchema = z.object({
  title: z.string().min(1).max(255),
  parent_id: z.string().uuid().nullable().default(null),
})

export type Note = z.infer<typeof noteSchema>
export type NoteFolder = z.infer<typeof noteFolderSchema>
export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type CreateFolderInput = z.infer<typeof createFolderSchema>
