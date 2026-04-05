import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { extractModuleFromPath } from '@/lib/rbac'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (c) =>
          c.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const pub = ['/login', '/auth/callback'].some((p) => pathname.startsWith(p))

  if (!user && !pub) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/tasks', request.url))
  }

  // Gate de módulo para members
  if (user && !pub) {
    // Bloquear /settings para members
    if (pathname.startsWith('/settings')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'member') {
        return NextResponse.redirect(new URL('/no-access', request.url))
      }
    }

    // Verificar permissão de módulo
    const routeModule = extractModuleFromPath(pathname)
    if (routeModule) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'member') {
        const { data: perm } = await supabase
          .from('member_permissions')
          .select('module')
          .eq('member_id', user.id)
          .eq('module', routeModule)
          .single()

        if (!perm) {
          return NextResponse.redirect(new URL('/no-access', request.url))
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}
