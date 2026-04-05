'use client'

import { useQuery } from '@tanstack/react-query'

import { QueryProvider } from '@/components/shared/QueryProvider'
import { TaskBoard } from '@/modules/tasks/components/TaskBoard'
import { TaskDialog } from '@/modules/tasks/components/TaskDialog'
import { TaskToolbar } from '@/modules/tasks/components/TaskToolbar'
import { boardTasksQueryOptions } from '@/modules/tasks/queries/task.queries'
import { useTaskStore } from '@/modules/tasks/store/task-store'
import type { Task } from '@/modules/tasks/types/task.types'

function TasksPageInner() {
  const boardId = useTaskStore((s) => s.selectedBoardId)

  const tasksQuery = useQuery(boardTasksQueryOptions(boardId ?? ''))
  const tasks: Task[] =
    tasksQuery.data && 'success' in tasksQuery.data
      ? (tasksQuery.data.data ?? [])
      : []

  return (
    <div className="tasks-page">
      <TaskToolbar />
      <TaskBoard />
      <TaskDialog tasks={tasks} />
    </div>
  )
}

export function TasksPageClient() {
  return (
    <QueryProvider>
      <TasksPageInner />
    </QueryProvider>
  )
}
