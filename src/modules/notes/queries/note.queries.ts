import { queryOptions } from '@tanstack/react-query'

import { getFolders, getNoteById, getNotes } from '@/modules/notes/actions/note.actions'

export function notesQueryOptions(folderId?: string | null) {
  return queryOptions({
    queryKey: ['notes', { folderId }],
    queryFn: () => getNotes(folderId),
  })
}

export function noteQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['notes', id],
    queryFn: () => getNoteById(id),
    enabled: !!id,
  })
}

export function foldersQueryOptions() {
  return queryOptions({
    queryKey: ['note-folders'],
    queryFn: () => getFolders(),
  })
}
