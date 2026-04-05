'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, GripVertical } from 'lucide-react'

import { useTaskStore } from '@/modules/tasks/store/task-store'
import type { Task } from '@/modules/tasks/types/task.types'

interface TaskCardProps {
  task: Task
}

const priorityConfig = {
  high: { label: 'Alta', className: 'task-card__priority--high' },
  medium: { label: 'Média', className: 'task-card__priority--medium' },
  low: { label: 'Baixa', className: 'task-card__priority--low' },
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return 'Atrasada'
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Amanhã'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function TaskCard({ task }: TaskCardProps) {
  const setEditingTaskId = useTaskStore((s) => s.setEditingTaskId)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = priorityConfig[task.priority]
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'task-card--dragging' : ''}`}
      onClick={() => setEditingTaskId(task.id)}
    >
      <div className="task-card__header">
        <button
          className="task-card__drag-handle"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} strokeWidth={1.5} />
        </button>
        <span className={`task-card__priority ${priority.className}`}>
          {priority.label}
        </span>
      </div>
      <p className="task-card__title">{task.title}</p>
      {task.due_date && (
        <div
          className={`task-card__due-date ${isOverdue ? 'task-card__due-date--overdue' : ''}`}
        >
          <Calendar size={12} strokeWidth={1.5} />
          <span>{formatDueDate(task.due_date)}</span>
        </div>
      )}
    </div>
  )
}
