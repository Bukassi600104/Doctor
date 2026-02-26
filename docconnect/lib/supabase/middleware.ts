import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Paths that never require authentication
const PUBLIC_PATHS = ['/', '/doctors', '/about', '/contact', '/privacy', '/terms']

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/doctors/'))
}

function isAuth(pathname: string) {
  return pathname.startsWith('/login') || pathname.startsWith('/register')
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth entirely for public routes and static assets — prevents slow Supabase
  // network calls from delaying page render when credentials aren't yet configured.
  if (isPublic(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users from protected routes to login
  if (!user && !isAuth(pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from login/register
  if (user && isAuth(pathname)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'patient'
    const redirectUrl = request.nextUrl.clone()

    if (role === 'doctor') {
      redirectUrl.pathname = '/doctor/dashboard'
    } else if (role === 'admin') {
      redirectUrl.pathname = '/admin/verification'
    } else {
      redirectUrl.pathname = '/patient/dashboard'
    }
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
