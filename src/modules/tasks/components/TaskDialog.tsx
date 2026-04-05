'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  createTask,
  updateTask,
  deleteTask,
} from '@/modules/tasks/actions/task.actions'
import { columnsQueryOptions } from '@/modules/tasks/queries/task.queries'
import { useTaskStore } from '@/modules/tasks/store/task-store'
import type { Task } from '@/modules/tasks/types/task.types'

interface TaskFormValues {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  due_date: string
  column_id: string
}

interface TaskDialogProps {
  tasks: Task[]
}

export function TaskDialog({ tasks }: TaskDialogProps) {
  const queryClient = useQueryClient()
  const isCreatingTask = useTaskStore((s) => s.isCreatingTask)
  const editingTaskId = useTaskStore((s) => s.editingTaskId)
  const setCreatingTask = useTaskStore((s) => s.setCreatingTask)
  const setEditingTaskId = useTaskStore((s) => s.setEditingTaskId)
  const boardId = useTaskStore((s) => s.selectedBoardId)

  const columnsQuery = useQuery(columnsQueryOptions(boardId ?? ''))
  const columns =
    columnsQuery.data && 'success' in columnsQuery.data
      ? (columnsQuery.data.data ?? [])
      : []

  const editingTask = editingTaskId
    ? tasks.find((t) => t.id === editingTaskId)
    : null

  const isOpen = isCreatingTask || !!editingTaskId
  const isEditMode = !!editingTask

  const { register, handleSubmit, reset, formState } = useForm<TaskFormValues>({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      column_id: columns[0]?.id ?? '',
    },
  })

  // Reset form when dialog opens/changes mode
  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title,
        description: editingTask.description ?? '',
        priority: editingTask.priority,
        due_date: editingTask.due_date
          ? editingTask.due_date.slice(0, 16)
          : '',
        column_id: editingTask.column_id,
      })
    } else if (isCreatingTask) {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        column_id: columns[0]?.id ?? '',
      })
    }
  }, [editingTask, isCreatingTask, columns, reset])

  function handleClose() {
    setCreatingTask(false)
    setEditingTaskId(null)
  }

  async function onSubmit(values: TaskFormValues) {
    const payload = {
      title: values.title,
      description: values.description || null,
      priority: values.priority,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
    }

    if (isEditMode && editingTask) {
      await updateTask(editingTask.id, payload)
    } else {
      await createTask({
        ...payload,
        column_id: values.column_id,
      })
    }

    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    handleClose()
  }

  async function handleDelete() {
    if (!editingTask) return
    await deleteTask(editingTask.id)
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar tarefa' : 'Nova tarefa'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Nome da tarefa"
              {...register('title', { required: true, minLength: 1 })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição opcional"
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="priority">Prioridade</Label>
              <select
                id="priority"
                className="task-dialog__select"
                {...register('priority')}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="column_id">Coluna</Label>
              <select
                id="column_id"
                className="task-dialog__select"
                {...register('column_id')}
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="due_date">Data limite</Label>
            <Input
              id="due_date"
              type="datetime-local"
              {...register('due_date')}
            />
          </div>

          <DialogFooter>
            {isEditMode && (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
                onClick={handleDelete}
              >
                Excluir
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {isEditMode ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
