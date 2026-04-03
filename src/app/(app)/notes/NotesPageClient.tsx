'use client'

import { QueryProvider } from '@/components/shared/QueryProvider'
import { NoteEditor } from '@/modules/notes/components/NoteEditor'
import { NoteList } from '@/modules/notes/components/NoteList'
import { NoteSidebar } from '@/modules/notes/components/NoteSidebar'
import { NoteToolbar } from '@/modules/notes/components/NoteToolbar'

export function NotesPageClient() {
  return (
    <QueryProvider>
      <div
        className="flex h-full"
        style={{
          margin: '-16px',
          height: 'calc(100% + 32px)',
        }}
      >
        <NoteSidebar />
        <div className="flex flex-1 flex-col">
          <NoteToolbar />
          <div className="flex flex-1 overflow-hidden">
            <NoteList />
            <NoteEditor />
          </div>
        </div>
      </div>
    </QueryProvider>
  )
}
