import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session

  const isAuthRoute = nextUrl.pathname === '/login'

  // Redirect authenticated users away from /login
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  // Redirect unauthenticated users to /login
  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  // Protect all routes except static assets and auth API
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
