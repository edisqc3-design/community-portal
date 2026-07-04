import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) redirect('/')

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="title">⚙️ 관리자</div>
        <Link href="/admin">대시보드</Link>
        <Link href="/admin/boards">게시판 관리</Link>
        <Link href="/admin/posts">게시글 관리</Link>
        <Link href="/admin/reports">신고 관리</Link>
        <Link href="/admin/users">회원 관리</Link>
        <Link href="/" style={{ marginTop: '16px', opacity: 0.6 }}>← 사이트로 돌아가기</Link>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  )
}
