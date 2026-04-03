export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside
        className="flex flex-col items-center border-r"
        style={{
          width: 'var(--sidebar-width)',
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg)',
        }}
      />
      <div className="flex flex-1 flex-col">
        <header
          className="flex items-center border-b px-4"
          style={{
            height: 'var(--topbar-height)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)',
          }}
        />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  )
}
