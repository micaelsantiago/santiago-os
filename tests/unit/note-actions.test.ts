import { beforeEach, describe, expect, it } from 'vitest'
import { mockResult, resetMocks } from '../helpers/supabase-mock'
import {
  createFolder,
  createNote,
  deleteFolder,
  deleteNote,
  getFolders,
  getNoteById,
  getNotes,
  updateNote,
} from '@/modules/notes/actions/note.actions'

const uuid = '550e8400-e29b-41d4-a716-446655440000'

beforeEach(() => {
  resetMocks()
})

// ========================================
// Notes
// ========================================

describe('createNote', () => {
  it('cria nota com input válido', async () => {
    const note = { id: uuid, title: 'Nota', content: '' }
    mockResult({ data: note, error: null })

    const result = await createNote({ title: 'Nota' })
    expect(result).toEqual({ success: true, data: note })
  })

  it('cria nota com defaults', async () => {
    const note = { id: uuid, title: 'Sem título', content: '' }
    mockResult({ data: note, error: null })

    const result = await createNote({})
    expect(result).toEqual({ success: true, data: note })
  })

  it('retorna erro de validação com título vazio', async () => {
    const result = await createNote({ title: '' })
    expect(result.error).toBeDefined()
    expect(result).not.toHaveProperty('success')
  })

  it('retorna erro se insert falhar', async () => {
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await createNote({ title: 'Nota' })
    expect(result).toEqual({ error: 'Erro ao criar nota' })
  })
})

describe('updateNote', () => {
  it('atualiza nota com input válido', async () => {
    const note = { id: uuid, title: 'Editada' }
    mockResult({ data: note, error: null })

    const result = await updateNote(uuid, { title: 'Editada' })
    expect(result).toEqual({ success: true, data: note })
  })

  it('atualiza is_pinned', async () => {
    const note = { id: uuid, is_pinned: true }
    mockResult({ data: note, error: null })

    const result = await updateNote(uuid, { is_pinned: true })
    expect(result).toEqual({ success: true, data: note })
  })

  it('retorna erro de validação', async () => {
    const result = await updateNote(uuid, { title: '' })
    expect(result.error).toBeDefined()
  })

  it('retorna erro se update falhar', async () => {
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await updateNote(uuid, { title: 'Ok' })
    expect(result).toEqual({ error: 'Erro ao atualizar nota' })
  })
})

describe('deleteNote', () => {
  it('deleta nota com sucesso', async () => {
    mockResult({ error: null })

    const result = await deleteNote(uuid)
    expect(result).toEqual({ success: true })
  })

  it('retorna erro se delete falhar', async () => {
    mockResult({ error: { message: 'fail' } })

    const result = await deleteNote(uuid)
    expect(result).toEqual({ error: 'Erro ao deletar nota' })
  })
})

describe('getNotes', () => {
  it('retorna todas as notas sem filtro', async () => {
    const notes = [{ id: uuid, title: 'Nota 1' }]
    mockResult({ data: notes, error: null })

    const result = await getNotes()
    expect(result).toEqual({ success: true, data: notes })
  })

  it('filtra por folder_id', async () => {
    const notes = [{ id: uuid, title: 'Nota na pasta' }]
    mockResult({ data: notes, error: null })

    const result = await getNotes(uuid)
    expect(result).toEqual({ success: true, data: notes })
  })

  it('filtra por folder_id null (notas sem pasta)', async () => {
    mockResult({ data: [], error: null })

    const result = await getNotes(null)
    expect(result).toEqual({ success: true, data: [] })
  })

  it('retorna erro se query falhar', async () => {
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await getNotes()
    expect(result).toEqual({ error: 'Erro ao buscar notas' })
  })

  it('retorna array vazio se data é null', async () => {
    mockResult({ data: null, error: null })

    const result = await getNotes()
    expect(result).toEqual({ success: true, data: [] })
  })
})

describe('getNoteById', () => {
  it('retorna nota por id', async () => {
    const note = { id: uuid, title: 'Nota' }
    mockResult({ data: note, error: null })

    const result = await getNoteById(uuid)
    expect(result).toEqual({ success: true, data: note })
  })

  it('retorna erro se query falhar', async () => {
    mockResult({ data: null, error: { message: 'not found' } })

    const result = await getNoteById(uuid)
    expect(result).toEqual({ error: 'Erro ao buscar nota' })
  })
})

// ========================================
// Folders
// ========================================

describe('createFolder', () => {
  it('cria pasta com input válido', async () => {
    const folder = { id: uuid, title: 'Pasta' }
    mockResult({ data: folder, error: null })

    const result = await createFolder({ title: 'Pasta' })
    expect(result).toEqual({ success: true, data: folder })
  })

  it('retorna erro de validação sem título', async () => {
    const result = await createFolder({ title: '' })
    expect(result.error).toBeDefined()
  })

  it('retorna erro se insert falhar', async () => {
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await createFolder({ title: 'Pasta' })
    expect(result).toEqual({ error: 'Erro ao criar pasta' })
  })
})

describe('getFolders', () => {
  it('retorna pastas ordenadas', async () => {
    const folders = [{ id: uuid, title: 'Pasta 1', position: 0 }]
    mockResult({ data: folders, error: null })

    const result = await getFolders()
    expect(result).toEqual({ success: true, data: folders })
  })

  it('retorna erro se query falhar', async () => {
    mockResult({ data: null, error: { message: 'fail' } })

    const result = await getFolders()
    expect(result).toEqual({ error: 'Erro ao buscar pastas' })
  })
})

describe('deleteFolder', () => {
  it('deleta pasta com sucesso', async () => {
    mockResult({ error: null })

    const result = await deleteFolder(uuid)
    expect(result).toEqual({ success: true })
  })

  it('retorna erro se delete falhar', async () => {
    mockResult({ error: { message: 'fail' } })

    const result = await deleteFolder(uuid)
    expect(result).toEqual({ error: 'Erro ao deletar pasta' })
  })
})
