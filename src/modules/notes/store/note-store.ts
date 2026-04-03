import { create } from 'zustand'

interface NoteStoreState {
  selectedNoteId: string | null
  selectedFolderId: string | null
  isEditing: boolean
  searchQuery: string
}

interface NoteStoreActions {
  selectNote: (id: string | null) => void
  selectFolder: (id: string | null) => void
  setEditing: (editing: boolean) => void
  setSearchQuery: (query: string) => void
}

export const useNoteStore = create<NoteStoreState & NoteStoreActions>(
  (set) => ({
    selectedNoteId: null,
    selectedFolderId: null,
    isEditing: false,
    searchQuery: '',
    selectNote: (id) => set({ selectedNoteId: id }),
    selectFolder: (id) => set({ selectedFolderId: id }),
    setEditing: (editing) => set({ isEditing: editing }),
    setSearchQuery: (query) => set({ searchQuery: query }),
  })
)
