'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Loader2, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ALL_MODULES } from '@/lib/rbac'
import type { Module } from '@/lib/rbac'
import type { Member } from '@/modules/settings/types/member.types'
import {
  createMember,
  updateMemberPermissions,
  deleteMember,
} from '@/modules/settings/actions/member.actions'

const MODULE_LABELS: Record<Module, string> = {
  tasks: 'Tarefas',
  calendar: 'Calendário',
  projects: 'Projetos',
  notes: 'Notas',
  email: 'Email',
  agent: 'Agente',
}

interface MembersPageClientProps {
  initialMembers: Member[]
}

export function MembersPageClient({ initialMembers }: MembersPageClientProps) {
  const router = useRouter()
  const [members] = useState(initialMembers)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Member | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedModules, setSelectedModules] = useState<Module[]>([])

  const resetCreateForm = useCallback(() => {
    setName('')
    setEmail('')
    setPassword('')
    setSelectedModules([])
    setError(null)
  }, [])

  const toggleModule = useCallback((module: Module) => {
    setSelectedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module],
    )
  }, [])

  const handleCreate = useCallback(async () => {
    setError(null)
    setLoading(true)
    const result = await createMember({ email, password, name, modules: selectedModules })
    setLoading(false)
    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : 'Erro ao criar membro')
      return
    }
    setCreateOpen(false)
    resetCreateForm()
    router.refresh()
  }, [email, password, name, selectedModules, router, resetCreateForm])

  const handleUpdatePermissions = useCallback(async () => {
    if (!editTarget) return
    setError(null)
    setLoading(true)
    const result = await updateMemberPermissions({
      memberId: editTarget.id,
      modules: selectedModules,
    })
    setLoading(false)
    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : 'Erro ao atualizar')
      return
    }
    setEditTarget(null)
    router.refresh()
  }, [editTarget, selectedModules, router])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setLoading(true)
    const result = await deleteMember(deleteTarget.id)
    setLoading(false)
    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : 'Erro ao deletar')
      return
    }
    setDeleteTarget(null)
    router.refresh()
  }, [deleteTarget, router])

  const openEdit = useCallback((member: Member) => {
    setEditTarget(member)
    setSelectedModules(member.modules as Module[])
    setError(null)
  }, [])

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text)' }}>Membros</h1>
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open)
            if (!open) resetCreateForm()
          }}
        >
          <DialogTrigger render={<Button variant="outline" size="sm" />}>
            <Plus size={14} strokeWidth={1.5} />
            Criar membro
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar membro</DialogTitle>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Label style={{ fontSize: 12, color: 'var(--color-text-2)' }}>Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do membro"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Label style={{ fontSize: 12, color: 'var(--color-text-2)' }}>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Label style={{ fontSize: 12, color: 'var(--color-text-2)' }}>Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Label style={{ fontSize: 12, color: 'var(--color-text-2)' }}>
                  Módulos permitidos
                </Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ALL_MODULES.map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => toggleModule(mod)}
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '0.5px solid',
                        borderColor: selectedModules.includes(mod)
                          ? 'var(--color-accent)'
                          : 'var(--color-border)',
                        backgroundColor: selectedModules.includes(mod)
                          ? 'var(--color-accent-bg)'
                          : 'transparent',
                        color: selectedModules.includes(mod)
                          ? 'var(--color-accent-text)'
                          : 'var(--color-text-2)',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                    >
                      {MODULE_LABELS[mod]}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <p style={{ fontSize: 12, color: 'var(--color-danger)', margin: 0 }}>{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="default"
                size="sm"
                disabled={loading || !name || !email || !password || selectedModules.length === 0}
                onClick={handleCreate}
              >
                {loading && <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />}
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Member list */}
      <div
        style={{
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius)',
          border: '0.5px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        {members.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              color: 'var(--color-text-3)',
              fontSize: 13,
            }}
          >
            Nenhum membro cadastrado
          </div>
        ) : (
          members.map((member, i) => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderTop: i > 0 ? '0.5px solid var(--color-border)' : 'none',
              }}
            >
              {/* Avatar placeholder */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {member.role === 'master' ? (
                  <Shield size={14} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                ) : (
                  <User size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {member.name || 'Sem nome'}
                  </span>
                  <Badge
                    variant={member.role === 'master' ? 'default' : 'outline'}
                    style={{ fontSize: 11 }}
                  >
                    {member.role}
                  </Badge>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-3)',
                    marginTop: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>{member.email}</span>
                  {member.role === 'member' && member.modules.length > 0 && (
                    <>
                      <span style={{ color: 'var(--color-border-2)' }}>·</span>
                      <span>
                        {member.modules.map((m) => MODULE_LABELS[m as Module] || m).join(', ')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              {member.role === 'member' && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <Button variant="ghost" size="icon-xs" onClick={() => openEdit(member)}>
                    <Pencil size={14} strokeWidth={1.5} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setDeleteTarget(member)
                      setError(null)
                    }}
                  >
                    <Trash2 size={14} strokeWidth={1.5} style={{ color: 'var(--color-danger)' }} />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit permissions dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permissões — {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label style={{ fontSize: 12, color: 'var(--color-text-2)' }}>Módulos permitidos</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_MODULES.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => toggleModule(mod)}
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '0.5px solid',
                    borderColor: selectedModules.includes(mod)
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                    backgroundColor: selectedModules.includes(mod)
                      ? 'var(--color-accent-bg)'
                      : 'transparent',
                    color: selectedModules.includes(mod)
                      ? 'var(--color-accent-text)'
                      : 'var(--color-text-2)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {MODULE_LABELS[mod]}
                </button>
              ))}
            </div>
            {error && (
              <p style={{ fontSize: 12, color: 'var(--color-danger)', margin: 0 }}>{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="default"
              size="sm"
              disabled={loading || selectedModules.length === 0}
              onClick={handleUpdatePermissions}
            >
              {loading && <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover membro</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: 13, color: 'var(--color-text-2)', margin: 0 }}>
            Tem certeza que deseja remover{' '}
            <strong style={{ fontWeight: 500 }}>{deleteTarget?.name}</strong>? Esta ação não pode
            ser desfeita.
          </p>
          {error && (
            <p style={{ fontSize: 12, color: 'var(--color-danger)', margin: 0 }}>{error}</p>
          )}
          <DialogFooter>
            <Button variant="destructive" size="sm" disabled={loading} onClick={handleDelete}>
              {loading && <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
