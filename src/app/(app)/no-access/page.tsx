import { ShieldX } from 'lucide-react'

export default function NoAccessPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 12,
      }}
    >
      <ShieldX size={32} strokeWidth={1.5} style={{ color: 'var(--color-text-3)' }} />
      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>Acesso negado</p>
      <p style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
        Você não tem permissão para acessar este módulo.
      </p>
    </div>
  )
}
