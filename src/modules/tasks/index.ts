export {
  boardSchema,
  columnSchema,
  taskSchema,
  taskTagSchema,
  createBoardSchema,
  createColumnSchema,
  updateColumnSchema,
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} from './types/task.types'
export type {
  Board,
  Column,
  Task,
  TaskTag,
  CreateBoardInput,
  CreateColumnInput,
  UpdateColumnInput,
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
} from './types/task.types'

export {
  getOrCreateDefaultBoard,
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  getBoardTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  addTaskTag,
  removeTaskTag,
} from './actions/task.actions'

export {
  defaultBoardQueryOptions,
  columnsQueryOptions,
  boardTasksQueryOptions,
} from './queries/task.queries'

export { useTaskStore } from './store/task-store'

export { TaskBoard } from './components/TaskBoard'
export { TaskCard } from './components/TaskCard'
export { KanbanColumn } from './components/KanbanColumn'
export { TaskToolbar } from './components/TaskToolbar'
export { TaskDialog } from './components/TaskDialog'
