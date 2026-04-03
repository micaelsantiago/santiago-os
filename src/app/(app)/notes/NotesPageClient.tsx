'use client'

import { QueryProvider } from '@/components/shared/QueryProvider'
import { NoteEditor } from '@/modules/notes/components/NoteEditor'
import { NoteList } from '@/modules/notes/components/NoteList'
import { NoteSidebar } from '@/modules/notes/components/NoteSidebar'
import { NoteToolbar } from '@/modules/notes/components/NoteToolbar'

export function NotesPageClient() {
  return (
    <QueryProvider>
      <div className="notes-page">
        <NoteSidebar />
        <div className="notes-page__main">
          <NoteToolbar />
          <div className="notes-page__content">
            <NoteList />
            <NoteEditor />
          </div>
        </div>
      </div>
    </QueryProvider>
  )
}
