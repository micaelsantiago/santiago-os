import { queryOptions } from '@tanstack/react-query'

import {
  getBoardTasks,
  getColumns,
  getOrCreateDefaultBoard,
} from '@/modules/tasks/actions/task.actions'

export function defaultBoardQueryOptions() {
  return queryOptions({
    queryKey: ['boards', 'default'],
    queryFn: () => getOrCreateDefaultBoard(),
  })
}

export function columnsQueryOptions(boardId: string) {
  return queryOptions({
    queryKey: ['columns', boardId],
    queryFn: () => getColumns(boardId),
    enabled: !!boardId,
  })
}

export function boardTasksQueryOptions(boardId: string) {
  return queryOptions({
    queryKey: ['tasks', boardId],
    queryFn: () => getBoardTasks(boardId),
    enabled: !!boardId,
  })
}
