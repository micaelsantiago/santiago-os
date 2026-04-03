'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/tasks')
  }


  return (
    <div
      style={{
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Entrar no Santiago OS
        </h1>
        <p
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: 'var(--color-text-2)',
            margin: 0,
          }}
        >
          Entre com email e senha
        </p>
      </div>

      <form
        onSubmit={handleEmailLogin}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label
            htmlFor="email"
            style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text)' }}
          >
            Email
          </Label>
          <div style={{ position: 'relative' }}>
            <Mail
              size={16}
              strokeWidth={1.5}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-3)',
                pointerEvents: 'none',
              }}
            />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                paddingLeft: 34,
                borderWidth: '0.5px',
                borderColor: 'var(--color-border-app)',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label
            htmlFor="password"
            style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text)' }}
          >
            Senha
          </Label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={16}
              strokeWidth={1.5}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-3)',
                pointerEvents: 'none',
              }}
            />
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                paddingLeft: 34,
                borderWidth: '0.5px',
                borderColor: 'var(--color-border-app)',
              }}
            />
          </div>
        </div>

        {error && (
          <p
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: 'var(--color-danger)',
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: 'var(--color-accent-app)',
            color: '#ffffff',
            gap: 8,
          }}
        >
          {loading && <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />}
          Entrar
        </Button>
      </form>
    </div>
  )
}
