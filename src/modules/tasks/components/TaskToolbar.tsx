'use client'

import { Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTaskStore } from '@/modules/tasks/store/task-store'

const priorities = [
  { value: 'high' as const, label: 'Alta', className: 'task-priority-filter--high' },
  { value: 'medium' as const, label: 'Média', className: 'task-priority-filter--medium' },
  { value: 'low' as const, label: 'Baixa', className: 'task-priority-filter--low' },
]

export function TaskToolbar() {
  const searchQuery = useTaskStore((s) => s.searchQuery)
  const filterPriority = useTaskStore((s) => s.filterPriority)
  const setSearchQuery = useTaskStore((s) => s.setSearchQuery)
  const setFilterPriority = useTaskStore((s) => s.setFilterPriority)
  const setCreatingTask = useTaskStore((s) => s.setCreatingTask)

  return (
    <div className="tasks-toolbar">
      <div className="tasks-toolbar__search">
        <Search size={14} strokeWidth={1.5} className="tasks-toolbar__search-icon" />
        <input
          type="text"
          placeholder="Buscar tarefas..."
          className="tasks-toolbar__search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="tasks-toolbar__filters">
        {priorities.map((p) => (
          <button
            key={p.value}
            className={`task-priority-filter ${p.className} ${filterPriority === p.value ? 'task-priority-filter--active' : ''}`}
            onClick={() => setFilterPriority(filterPriority === p.value ? null : p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={() => setCreatingTask(true)}
        className="tasks-toolbar__new-btn"
      >
        <Plus size={14} strokeWidth={1.5} />
        Nova tarefa
      </Button>
    </div>
  )
}
