'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getAuthenticatedUser } from '@/lib/supabase/get-user'

const uuidParam = z.string().uuid()
import {
  createFolderSchema,
  createNoteSchema,
  updateNoteSchema,
} from '@/modules/notes/types/note.types'
import type {
  CreateFolderInput,
  CreateNoteInput,
  Note,
  NoteFolder,
  UpdateNoteInput,
} from '@/modules/notes/types/note.types'

export async function createNote(input: CreateNoteInput) {
  const { supabase, user } = await getAuthenticatedUser()
  const parsed = createNoteSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      ...parsed.data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) return { error: 'Erro ao criar nota' }
  revalidatePath('/notes')
  return { success: true, data: data as Note }
}

export async function updateNote(id: string, input: UpdateNoteInput) {
  if (!uuidParam.safeParse(id).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()
  const parsed = updateNoteSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from('notes')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: 'Erro ao atualizar nota' }
  revalidatePath('/notes')
  return { success: true, data: data as Note }
}

export async function deleteNote(id: string) {
  if (!uuidParam.safeParse(id).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()

  const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { error: 'Erro ao deletar nota' }
  revalidatePath('/notes')
  return { success: true }
}

export async function getNotes(folderId?: string | null) {
  const { supabase, user } = await getAuthenticatedUser()

  let query = supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (folderId !== undefined) {
    if (folderId === null) {
      query = query.is('folder_id', null)
    } else {
      query = query.eq('folder_id', folderId)
    }
  }

  const { data, error } = await query

  if (error) return { error: 'Erro ao buscar notas' }
  return { success: true, data: (data ?? []) as Note[] }
}

export async function getNoteById(id: string) {
  if (!uuidParam.safeParse(id).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return { error: 'Erro ao buscar nota' }
  return { success: true, data: data as Note }
}

export async function createFolder(input: CreateFolderInput) {
  const { supabase, user } = await getAuthenticatedUser()
  const parsed = createFolderSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data, error } = await supabase
    .from('note_folders')
    .insert({
      ...parsed.data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) return { error: 'Erro ao criar pasta' }
  revalidatePath('/notes')
  return { success: true, data: data as NoteFolder }
}

export async function getFolders() {
  const { supabase, user } = await getAuthenticatedUser()

  const { data, error } = await supabase
    .from('note_folders')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  if (error) return { error: 'Erro ao buscar pastas' }
  return { success: true, data: (data ?? []) as NoteFolder[] }
}

export async function deleteFolder(id: string) {
  if (!uuidParam.safeParse(id).success) return { error: 'ID inválido' }
  const { supabase, user } = await getAuthenticatedUser()

  const { error } = await supabase.from('note_folders').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { error: 'Erro ao deletar pasta' }
  revalidatePath('/notes')
  return { success: true }
}
