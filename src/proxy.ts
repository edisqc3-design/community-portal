import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 세션 갱신
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 글쓰기 페이지 보호 (/board/[category]/write)
  const isWritePage = /^\/board\/[^/]+\/write$/.test(path)
  if (isWritePage && !user) {
    return NextResponse.redirect(new URL(`/auth/login?next=${path}`, request.url))
  }

  // 마이페이지 보호
  if (path.startsWith('/mypage') && !user) {
    return NextResponse.redirect(new URL('/auth/login?next=/mypage', request.url))
  }

  // 어드민 페이지 보호 (Phase 5에서 실제 관리자 CMS 추가 예정)
  if (path.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/auth/login?next=/admin', request.url))
  }

  // 로그인 상태에서 auth 페이지 접근 시 홈으로 (callback 제외)
  const isCallback = path === '/auth/callback'
  if (path.startsWith('/auth') && !isCallback && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
