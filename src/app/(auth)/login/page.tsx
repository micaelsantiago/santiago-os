import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        fontFamily: 'var(--font)',
      }}
    >
      <LoginForm />
    </div>
  )
}
