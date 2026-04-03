'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Pin, PinOff, Plus, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { noteQueryOptions } from '@/modules/notes/queries/note.queries'
import {
  createNote,
  deleteNote,
  updateNote,
} from '@/modules/notes/actions/note.actions'
import { useNoteStore } from '@/modules/notes/store/note-store'

export function NoteToolbar() {
  const { selectedNoteId, selectedFolderId, selectNote } = useNoteStore()
  const queryClient = useQueryClient()
  const { data: result } = useQuery(
    noteQueryOptions(selectedNoteId ?? ''),
  )
  const note = result?.success ? result.data : null

  const handleCreate = async () => {
    const res = await createNote({
      title: 'Sem título',
      content: '',
      folder_id: selectedFolderId,
    })
    if (res.success && res.data) {
      selectNote(res.data.id)
    }
    queryClient.invalidateQueries({ queryKey: ['notes'] })
  }

  const handleDelete = async () => {
    if (!selectedNoteId) return
    await deleteNote(selectedNoteId)
    selectNote(null)
    queryClient.invalidateQueries({ queryKey: ['notes'] })
  }

  const handleTogglePin = async () => {
    if (!selectedNoteId || !note) return
    await updateNote(selectedNoteId, { is_pinned: !note.is_pinned })
    queryClient.invalidateQueries({ queryKey: ['notes'] })
  }

  return (
    <div
      className="flex items-center gap-1 px-2"
      style={{
        height: '36px',
        borderBottom: '0.5px solid var(--color-border-app)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <button
        type="button"
        onClick={handleCreate}
        title="Nova nota"
        className="flex items-center justify-center rounded p-1 transition-colors"
        style={{
          color: 'var(--color-text-2)',
          borderRadius: 'var(--radius-sm)',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = 'var(--color-bg-2)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = 'transparent')
        }
      >
        <Plus size={16} strokeWidth={1.5} />
      </button>

      {selectedNoteId && (
        <>
          <button
            type="button"
            onClick={handleTogglePin}
            title={note?.is_pinned ? 'Desafixar' : 'Fixar'}
            className="flex items-center justify-center rounded p-1 transition-colors"
            style={{
              color: note?.is_pinned
                ? 'var(--color-accent-text)'
                : 'var(--color-text-2)',
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--color-bg-2)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            {note?.is_pinned ? (
              <PinOff size={16} strokeWidth={1.5} />
            ) : (
              <Pin size={16} strokeWidth={1.5} />
            )}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            title="Deletar nota"
            className="flex items-center justify-center rounded p-1 transition-colors"
            style={{
              color: 'var(--color-text-2)',
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)'
              e.currentTarget.style.color = 'var(--color-danger)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-text-2)'
            }}
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </>
      )}
    </div>
  )
}
