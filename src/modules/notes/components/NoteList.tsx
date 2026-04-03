'use client'

import { useQuery } from '@tanstack/react-query'
import { Pin, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { notesQueryOptions } from '@/modules/notes/queries/note.queries'
import { useNoteStore } from '@/modules/notes/store/note-store'
import type { Note } from '@/modules/notes/types/note.types'
import { ScrollArea } from '@/components/ui/scroll-area'

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function getPreview(content: string): string {
  const firstLine = content.split('\n').find((line) => line.trim() !== '')
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
      className={cn(
        'flex w-full flex-col gap-1 px-3 py-2 text-left transition-colors',
      )}
      style={{
        borderBottom: '0.5px solid var(--color-border-app)',
        backgroundColor: isSelected ? 'var(--color-accent-bg)' : 'transparent',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div className="flex items-center gap-1.5">
        {note.is_pinned && (
          <Pin
            size={12}
            strokeWidth={1.5}
            style={{ color: 'var(--color-accent-text)', flexShrink: 0 }}
          />
        )}
        <span
          className="truncate"
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text)',
          }}
        >
          {note.title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="truncate"
          style={{
            fontSize: '12px',
            fontWeight: 400,
            color: 'var(--color-text-2)',
          }}
        >
          {getPreview(note.content)}
        </span>
      </div>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--color-text-3)',
        }}
      >
        {formatDate(note.updated_at)}
      </span>
    </button>
  )
}

export function NoteList() {
  const { selectedFolderId, searchQuery, setSearchQuery } = useNoteStore()
  const { data: result } = useQuery(notesQueryOptions(selectedFolderId))

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
    <div
      className="flex flex-col"
      style={{
        width: '240px',
        minWidth: '240px',
        borderRight: '0.5px solid var(--color-border-app)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2"
        style={{
          borderBottom: '0.5px solid var(--color-border-app)',
        }}
      >
        <Search
          size={14}
          strokeWidth={1.5}
          style={{ color: 'var(--color-text-3)', flexShrink: 0 }}
        />
        <input
          type="text"
          placeholder="Buscar notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-none bg-transparent outline-none"
          style={{
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--color-text)',
          }}
        />
      </div>
      <ScrollArea className="flex-1">
        {sortedNotes.length === 0 ? (
          <div
            className="px-3 py-4 text-center"
            style={{
              fontSize: '12px',
              fontWeight: 400,
              color: 'var(--color-text-3)',
            }}
          >
            Nenhuma nota encontrada
          </div>
        ) : (
          sortedNotes.map((note) => <NoteItem key={note.id} note={note} />)
        )}
      </ScrollArea>
    </div>
  )
}
