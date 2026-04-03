'use client'

import { useQueryClient, useQuery } from '@tanstack/react-query'
import { Pin, PinOff, Plus, Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
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
  const { data: result } = useQuery(noteQueryOptions(selectedNoteId ?? ''))
  const note = result?.success ? result.data : null

  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pinning, setPinning] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    const res = await createNote({
      title: 'Sem título',
      content: '',
      folder_id: selectedFolderId,
    })
    if (res.success && res.data) selectNote(res.data.id)
    await queryClient.invalidateQueries({ queryKey: ['notes'] })
    setCreating(false)
  }

  const handleDelete = async () => {
    if (!selectedNoteId) return
    setDeleting(true)
    await deleteNote(selectedNoteId)
    selectNote(null)
    await queryClient.invalidateQueries({ queryKey: ['notes'] })
    setDeleting(false)
  }

  const handleTogglePin = async () => {
    if (!selectedNoteId || !note) return
    setPinning(true)
    await updateNote(selectedNoteId, { is_pinned: !note.is_pinned })
    await queryClient.invalidateQueries({ queryKey: ['notes'] })
    setPinning(false)
  }

  const statusText = creating
    ? 'Criando nota...'
    : deleting
      ? 'Deletando nota...'
      : pinning
        ? 'Atualizando...'
        : null

  return (
    <div className="note-toolbar">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCreate}
        title="Nova nota"
        disabled={creating}
        className="note-toolbar__btn"
      >
        {creating ? (
          <Loader2 size={16} strokeWidth={1.5} className="note-toolbar__spinner" />
        ) : (
          <Plus size={16} strokeWidth={1.5} />
        )}
      </Button>

      {selectedNoteId && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTogglePin}
            title={note?.is_pinned ? 'Desafixar' : 'Fixar'}
            disabled={pinning}
            className={`note-toolbar__btn ${note?.is_pinned ? 'note-toolbar__btn--pinned' : ''}`}
          >
            {pinning ? (
              <Loader2 size={16} strokeWidth={1.5} className="note-toolbar__spinner" />
            ) : note?.is_pinned ? (
              <PinOff size={16} strokeWidth={1.5} />
            ) : (
              <Pin size={16} strokeWidth={1.5} />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            title="Deletar nota"
            disabled={deleting}
            className="note-toolbar__btn note-toolbar__btn--danger"
          >
            {deleting ? (
              <Loader2 size={16} strokeWidth={1.5} className="note-toolbar__spinner" />
            ) : (
              <Trash2 size={16} strokeWidth={1.5} />
            )}
          </Button>
        </>
      )}

      {statusText && <span className="note-toolbar__status">{statusText}</span>}
    </div>
  )
}
