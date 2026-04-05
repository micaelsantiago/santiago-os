import { create } from 'zustand'

interface TaskStoreState {
  selectedBoardId: string | null
  selectedTaskId: string | null
  isCreatingTask: boolean
  editingTaskId: string | null
  searchQuery: string
  filterPriority: 'low' | 'medium' | 'high' | null
}

interface TaskStoreActions {
  setSelectedBoardId: (id: string | null) => void
  selectTask: (id: string | null) => void
  setCreatingTask: (creating: boolean) => void
  setEditingTaskId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setFilterPriority: (priority: 'low' | 'medium' | 'high' | null) => void
  resetFilters: () => void
}

export const useTaskStore = create<TaskStoreState & TaskStoreActions>(
  (set) => ({
    selectedBoardId: null,
    selectedTaskId: null,
    isCreatingTask: false,
    editingTaskId: null,
    searchQuery: '',
    filterPriority: null,
    setSelectedBoardId: (id) => set({ selectedBoardId: id }),
    selectTask: (id) => set({ selectedTaskId: id }),
    setCreatingTask: (creating) => set({ isCreatingTask: creating }),
    setEditingTaskId: (id) => set({ editingTaskId: id }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilterPriority: (priority) => set({ filterPriority: priority }),
    resetFilters: () => set({ searchQuery: '', filterPriority: null }),
  })
)
