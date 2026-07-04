'use client'

import { useRouter } from 'next/navigation'
import { updateReportStatusAdmin, deletePostAdmin } from '@/lib/admin-actions'

interface ReportRow {
  id: string
  target_type: string
  target_id: string
  reason: string
  status: string
  created_at: string
  reporter?: { nickname: string } | { nickname: string }[] | null
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

const STATUS_LABEL: Record<string, string> = { pending: '대기중', reviewed: '조치완료', dismissed: '반려' }

export default function ReportsAdminClient({ initialReports }: { initialReports: ReportRow[] }) {
  const router = useRouter()

  const handleResolve = async (id: string, status: 'reviewed' | 'dismissed') => {
    await updateReportStatusAdmin(id, status)
    router.refresh()
  }

  const handleDeleteContent = async (report: ReportRow) => {
    if (report.target_type !== 'post') {
      alert('댓글 강제 삭제는 게시글 관리 화면에서 지원 예정입니다. 우선 신고를 "조치완료" 처리해 주세요.')
      return
    }
    if (!confirm('신고된 게시글을 삭제(숨김) 처리할까요?')) return
    await deletePostAdmin(report.target_id)
    await updateReportStatusAdmin(report.id, 'reviewed')
    router.refresh()
  }

  return (
    <div>
      <h1>신고 관리</h1>
      {initialReports.length === 0 ? (
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.86rem' }}>접수된 신고가 없습니다.</p>
      ) : (
        <table className="admin-table">
          <thead><tr><th>대상</th><th>사유</th><th>신고자</th><th>접수일</th><th>상태</th><th>작업</th></tr></thead>
          <tbody>
            {initialReports.map(r => {
              const reporter = one(r.reporter)
              return (
                <tr key={r.id}>
                  <td>{r.target_type === 'post' ? '게시글' : '댓글'}</td>
                  <td>{r.reason}</td>
                  <td>{reporter?.nickname ?? '탈퇴한 회원'}</td>
                  <td>{new Date(r.created_at).toLocaleDateString('ko-KR')}</td>
                  <td><span className={`admin-badge ${r.status}`}>{STATUS_LABEL[r.status] ?? r.status}</span></td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => handleDeleteContent(r)} className="admin-btn danger">콘텐츠 삭제</button>
                        <button onClick={() => handleResolve(r.id, 'dismissed')} className="admin-btn">반려</button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
