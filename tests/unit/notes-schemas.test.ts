import { describe, expect, it } from 'vitest'
import {
  createFolderSchema,
  createNoteSchema,
  noteFolderSchema,
  noteSchema,
  updateNoteSchema,
} from '@/modules/notes/types/note.types'

const uuid = '550e8400-e29b-41d4-a716-446655440000'
const datetime = '2026-01-01T00:00:00Z'

describe('noteSchema', () => {
  const valid = {
    id: uuid,
    user_id: uuid,
    folder_id: null,
    title: 'Minha nota',
    content: 'Conteúdo',
    is_pinned: false,
    created_at: datetime,
    updated_at: datetime,
  }

  it('valida entidade completa', () => {
    expect(noteSchema.safeParse(valid).success).toBe(true)
  })

  it('aceita folder_id como uuid', () => {
    expect(noteSchema.safeParse({ ...valid, folder_id: uuid }).success).toBe(true)
  })

  it('usa defaults para content e is_pinned', () => {
    const { title, id, user_id, folder_id, created_at, updated_at } = valid
    const result = noteSchema.safeParse({ id, user_id, folder_id, title, created_at, updated_at })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.content).toBe('')
      expect(result.data.is_pinned).toBe(false)
    }
  })

  it('rejeita título vazio', () => {
    expect(noteSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
  })

  it('rejeita título maior que 255 chars', () => {
    expect(noteSchema.safeParse({ ...valid, title: 'a'.repeat(256) }).success).toBe(false)
  })

  it('rejeita id inválido', () => {
    expect(noteSchema.safeParse({ ...valid, id: 'not-uuid' }).success).toBe(false)
  })

  it('rejeita sem campos obrigatórios', () => {
    expect(noteSchema.safeParse({}).success).toBe(false)
  })
})

describe('noteFolderSchema', () => {
  const valid = { id: uuid, user_id: uuid, parent_id: null, title: 'Pasta', position: 0 }

  it('valida entidade completa', () => {
    expect(noteFolderSchema.safeParse(valid).success).toBe(true)
  })

  it('aceita parent_id como uuid', () => {
    expect(noteFolderSchema.safeParse({ ...valid, parent_id: uuid }).success).toBe(true)
  })

  it('usa default para position', () => {
    const result = noteFolderSchema.safeParse({ id: uuid, user_id: uuid, parent_id: null, title: 'Test' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.position).toBe(0)
  })

  it('rejeita título vazio', () => {
    expect(noteFolderSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
  })

  it('rejeita position decimal', () => {
    expect(noteFolderSchema.safeParse({ ...valid, position: 1.5 }).success).toBe(false)
  })
})

describe('createNoteSchema', () => {
  it('valida input mínimo (usa defaults)', () => {
    const result = createNoteSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Sem título')
      expect(result.data.content).toBe('')
      expect(result.data.folder_id).toBeNull()
    }
  })

  it('valida input completo', () => {
    const result = createNoteSchema.safeParse({
      title: 'Nota',
      content: '# Hello',
      folder_id: uuid,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita título vazio', () => {
    expect(createNoteSchema.safeParse({ title: '' }).success).toBe(false)
  })

  it('rejeita folder_id inválido', () => {
    expect(createNoteSchema.safeParse({ folder_id: 'bad' }).success).toBe(false)
  })
})

describe('updateNoteSchema', () => {
  it('valida objeto vazio (tudo opcional)', () => {
    expect(updateNoteSchema.safeParse({}).success).toBe(true)
  })

  it('valida campos parciais', () => {
    expect(updateNoteSchema.safeParse({ title: 'Novo título' }).success).toBe(true)
    expect(updateNoteSchema.safeParse({ is_pinned: true }).success).toBe(true)
    expect(updateNoteSchema.safeParse({ folder_id: null }).success).toBe(true)
  })

  it('rejeita título vazio', () => {
    expect(updateNoteSchema.safeParse({ title: '' }).success).toBe(false)
  })
})

describe('createFolderSchema', () => {
  it('valida com título', () => {
    const result = createFolderSchema.safeParse({ title: 'Nova pasta' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.parent_id).toBeNull()
  })

  it('valida com parent_id', () => {
    expect(createFolderSchema.safeParse({ title: 'Sub', parent_id: uuid }).success).toBe(true)
  })

  it('rejeita sem título', () => {
    expect(createFolderSchema.safeParse({}).success).toBe(false)
  })

  it('rejeita título vazio', () => {
    expect(createFolderSchema.safeParse({ title: '' }).success).toBe(false)
  })
})
