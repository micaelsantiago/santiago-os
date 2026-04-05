export const ALL_MODULES = ['tasks', 'calendar', 'projects', 'notes', 'email', 'agent'] as const

export type Module = (typeof ALL_MODULES)[number]

export function isValidModule(value: string): value is Module {
  return ALL_MODULES.includes(value as Module)
}

/** Extrai o módulo do pathname (ex: '/tasks/abc' → 'tasks') */
export function extractModuleFromPath(pathname: string): Module | null {
  const segment = pathname.split('/').filter(Boolean)[0]
  if (segment && isValidModule(segment)) return segment
  return null
}
