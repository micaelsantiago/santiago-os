'use client'

import { useQuery } from '@tanstack/react-query'
import { Pin, Search, Loader2 } from 'lucide-react'

import { notesQueryOptions } from '@/modules/notes/queries/note.queries'
import { useNoteStore } from '@/modules/notes/store/note-store'
import type { Note } from '@/modules/notes/types/note.types'
import { ScrollArea } from '@/components/ui/scroll-area'

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function getPreview(content: string): string {
  const stripped = content.replace(/<[^>]*>/g, '')
  const firstLine = stripped.split('\n').find((line) => line.trim() !== '')
  if (!firstLine) return ''
  return firstLine.slice(0, 80)
}

function NoteItem({ note }: { note: Note }) {
  const { selectedNoteId, selectNote } = useNoteStore()
  const isSelected = selectedNoteId === note.id

  return (
    <button
      type="button"
      onClick={() => selectNote(note.id)}
      className={`note-list__item ${isSelected ? 'note-list__item--active' : ''}`}
    >
      <div className="note-list__item-header">
        {note.is_pinned && <Pin size={12} strokeWidth={1.5} className="note-list__pin-icon" />}
        <span className="note-list__item-title truncate">{note.title}</span>
      </div>
      {getPreview(note.content) && (
        <span className="note-list__item-preview truncate">{getPreview(note.content)}</span>
      )}
      <span className="note-list__item-date">{formatDate(note.updated_at)}</span>
    </button>
  )
}

export function NoteList() {
  const { selectedFolderId, searchQuery, setSearchQuery } = useNoteStore()
  const { data: result, isLoading, isFetching } = useQuery(notesQueryOptions(selectedFolderId))

  const notes = result?.success ? result.data : []

  const filteredNotes = searchQuery
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : notes

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned)
  const unpinnedNotes = filteredNotes.filter((n) => !n.is_pinned)
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes]

  return (
    <div className="note-list">
      <div className="note-list__search">
        <Search size={14} strokeWidth={1.5} className="note-list__search-icon" />
        <input
          type="text"
          placeholder="Buscar notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="note-list__search-input"
        />
        {isFetching && !isLoading && (
          <Loader2 size={14} strokeWidth={1.5} className="note-list__spinner" />
        )}
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="note-list__status">
            <Loader2 size={16} strokeWidth={1.5} className="note-list__spinner" />
            Carregando notas...
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="note-list__empty">Nenhuma nota encontrada</div>
        ) : (
          sortedNotes.map((note) => <NoteItem key={note.id} note={note} />)
        )}
      </ScrollArea>
    </div>
  )
}
