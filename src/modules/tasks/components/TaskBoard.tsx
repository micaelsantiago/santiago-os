'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { KanbanColumn } from '@/modules/tasks/components/KanbanColumn'
import { TaskCard } from '@/modules/tasks/components/TaskCard'
import {
  defaultBoardQueryOptions,
  columnsQueryOptions,
  boardTasksQueryOptions,
} from '@/modules/tasks/queries/task.queries'
import { moveTask } from '@/modules/tasks/actions/task.actions'
import { useTaskStore } from '@/modules/tasks/store/task-store'
import type { Task } from '@/modules/tasks/types/task.types'

export function TaskBoard() {
  const queryClient = useQueryClient()
  const searchQuery = useTaskStore((s) => s.searchQuery)
  const filterPriority = useTaskStore((s) => s.filterPriority)
  const setSelectedBoardId = useTaskStore((s) => s.setSelectedBoardId)

  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  // Queries
  const boardQuery = useQuery(defaultBoardQueryOptions())
  const boardId =
    boardQuery.data && 'success' in boardQuery.data ? boardQuery.data.data?.id : undefined

  const columnsQuery = useQuery(columnsQueryOptions(boardId ?? ''))
  const tasksQuery = useQuery(boardTasksQueryOptions(boardId ?? ''))

  // Set board id in store when loaded
  useEffect(() => {
    if (boardId) {
      setSelectedBoardId(boardId)
    }
  }, [boardId, setSelectedBoardId])

  const columns =
    columnsQuery.data && 'success' in columnsQuery.data ? (columnsQuery.data.data ?? []) : []

  const allTasks =
    tasksQuery.data && 'success' in tasksQuery.data ? (tasksQuery.data.data ?? []) : []

  // Client-side filtering
  const filteredTasks = useMemo(() => {
    let tasks = allTasks
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(q))
    }
    if (filterPriority) {
      tasks = tasks.filter((t) => t.priority === filterPriority)
    }
    return tasks
  }, [allTasks, searchQuery, filterPriority])

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const col of columns) {
      map[col.id] = []
    }
    for (const task of filteredTasks) {
      if (map[task.column_id]) {
        map[task.column_id].push(task)
      }
    }
    // Sort by position within each column
    for (const colId of Object.keys(map)) {
      map[colId].sort((a, b) => a.position - b.position)
    }
    return map
  }, [columns, filteredTasks])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = allTasks.find((t) => t.id === event.active.id)
      if (task) setActiveTask(task)
    },
    [allTasks],
  )

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback handled by KanbanColumn's isOver state
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null)
      const { active, over } = event
      if (!over) return

      const taskId = active.id as string
      const task = allTasks.find((t) => t.id === taskId)
      if (!task) return

      // Determine target column
      let targetColumnId: string
      const overData = over.data.current

      if (overData?.type === 'column') {
        // Dropped on column droppable
        targetColumnId = overData.columnId as string
      } else {
        // Dropped on another task — find that task's column
        const overTask = allTasks.find((t) => t.id === over.id)
        if (!overTask) return
        targetColumnId = overTask.column_id
      }

      // Calculate new position
      const tasksInTargetCol = (tasksByColumn[targetColumnId] ?? []).filter((t) => t.id !== taskId)

      let newPosition: number
      if (overData?.type === 'column') {
        // Dropped on empty column or column itself
        newPosition = tasksInTargetCol.length
      } else {
        // Dropped on a task — insert at that task's index
        const overIndex = tasksInTargetCol.findIndex((t) => t.id === over.id)
        newPosition = overIndex >= 0 ? overIndex : tasksInTargetCol.length
      }

      // Skip if nothing changed
      if (task.column_id === targetColumnId && task.position === newPosition) {
        return
      }

      await moveTask({ taskId, columnId: targetColumnId, position: newPosition })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    [allTasks, tasksByColumn, queryClient],
  )

  // Loading state
  if (boardQuery.isLoading || columnsQuery.isLoading) {
    return (
      <div className="tasks-board__loading">
        <Loader2 size={20} strokeWidth={1.5} className="tasks-board__spinner" />
        <span>Carregando board...</span>
      </div>
    )
  }

  // Error state
  if (boardQuery.data && 'error' in boardQuery.data) {
    return (
      <div className="tasks-board__loading">
        <span>Erro ao carregar board</span>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="tasks-board">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} tasks={tasksByColumn[column.id] ?? []} />
        ))}
      </div>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  )
}
