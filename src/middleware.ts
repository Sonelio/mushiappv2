import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Handle protected routes
  if (!session && (
    req.nextUrl.pathname.startsWith('/templates') ||
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/account')
  )) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Handle auth routes when logged in
  if (session && (
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname === '/signup'
  )) {
    return NextResponse.redirect(new URL('/templates', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}