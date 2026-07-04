import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin, logout } from '@/lib/auth-actions'
import { getUnreadNotificationCount, getUnreadMessageCount } from '@/lib/queries'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  const unreadNoti = await getUnreadNotificationCount(admin.user.id)
  const unreadMsg = await getUnreadMessageCount(admin.user.id)
  const bellCount = unreadNoti + unreadMsg

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <Link href="/admin" className="admin-topbar-brand">🏘️ Community Portal</Link>
        <div className="right-icons">
          <Link href="/admin" className="nick" style={{ color: 'var(--pin-red)', fontWeight: 700 }}>관리자</Link>
          <Link href="/mypage" className="nick">{admin.profile.nickname}님</Link>
          <form action={logout}>
            <button type="submit" className="logout-btn">로그아웃</button>
          </form>
          <Link href="/mypage/notifications" className="icon-btn" style={{ position: 'relative' }}>
            🔔
            {bellCount > 0 && (
              <span
                style={{
                  position: 'absolute', top: '-4px', right: '-4px', background: 'var(--pin-red)', color: '#fff',
                  fontSize: '0.62rem', fontWeight: 800, borderRadius: '10px', padding: '1px 5px', minWidth: '16px', textAlign: 'center',
                }}
              >
                {bellCount > 9 ? '9+' : bellCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <Link href="/admin" className="title">⚙️ 관리자</Link>
          <Link href="/admin">대시보드</Link>
          <Link href="/admin/boards">게시판 관리</Link>
          <Link href="/admin/posts">게시글 관리</Link>
          <Link href="/admin/reports">신고 관리</Link>
          <Link href="/admin/users">회원 관리</Link>
          <Link href="/" style={{ marginTop: '16px', opacity: 0.6 }}>← 사이트로 돌아가기</Link>
        </aside>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}
