'use client'

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'

import { TaskCard } from '@/modules/tasks/components/TaskCard'
import { useTaskStore } from '@/modules/tasks/store/task-store'
import type { Column, Task } from '@/modules/tasks/types/task.types'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const setCreatingTask = useTaskStore((s) => s.setCreatingTask)
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column', columnId: column.id },
  })

  const taskIds = tasks.map((t) => t.id)

  return (
    <div className={`kanban-column ${isOver ? 'kanban-column--over' : ''}`}>
      <div className="kanban-column__header">
        <div className="kanban-column__title-group">
          <span className="kanban-column__title">{column.title}</span>
          <span className="kanban-column__count">{tasks.length}</span>
        </div>
        <button
          className="kanban-column__add-btn"
          onClick={() => setCreatingTask(true)}
          title="Nova tarefa"
        >
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </div>
      <div ref={setNodeRef} className="kanban-column__list">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="kanban-column__empty">Sem tarefas</div>
        )}
      </div>
    </div>
  )
}
