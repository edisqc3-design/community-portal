import { getAdminStats } from '@/lib/admin-queries'

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  const cards = [
    { label: '전체 게시글', num: stats.postCount },
    { label: '전체 댓글', num: stats.commentCount },
    { label: '전체 회원', num: stats.userCount },
    { label: '운영 게시판', num: stats.boardCount },
    { label: '대기중 신고', num: stats.pendingReportCount },
  ]

  return (
    <div>
      <h1>대시보드</h1>
      <div className="stat-grid">
        {cards.map(c => (
          <div key={c.label} className="stat-card">
            <div className="num">{c.num.toLocaleString()}</div>
            <div className="label">{c.label}</div>
          </div>
        ))}
      </div>
      {stats.pendingReportCount > 0 && (
        <p style={{ fontSize: '0.86rem', color: 'var(--pin-red)' }}>
          🚩 처리 대기중인 신고가 {stats.pendingReportCount}건 있습니다. <a href="/admin/reports" style={{ textDecoration: 'underline' }}>신고 관리로 이동</a>
        </p>
      )}
    </div>
  )
}
