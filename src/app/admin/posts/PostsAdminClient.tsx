'use client'

import { useRouter } from 'next/navigation'
import { deletePostAdmin, setPostNoticeAdmin } from '@/lib/admin-actions'

interface PostRow {
  id: string
  title: string
  view_count: number
  like_count: number
  comment_count: number
  is_notice: boolean
  is_deleted: boolean
  created_at: string
  author?: { nickname: string } | { nickname: string }[] | null
  board?: { name: string; slug: string } | { name: string; slug: string }[] | null
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

export default function PostsAdminClient({ initialPosts }: { initialPosts: PostRow[] }) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('이 게시글을 삭제(숨김) 처리할까요?')) return
    await deletePostAdmin(id)
    router.refresh()
  }

  const handleToggleNotice = async (id: string, current: boolean) => {
    await setPostNoticeAdmin(id, !current)
    router.refresh()
  }

  return (
    <div>
      <h1>게시글 관리</h1>
      <table className="admin-table">
        <thead><tr><th>제목</th><th>게시판</th><th>작성자</th><th>조회</th><th>댓글</th><th>상태</th><th>작업</th></tr></thead>
        <tbody>
          {initialPosts.map(p => {
            const author = one(p.author)
            const board = one(p.board)
            return (
              <tr key={p.id}>
                <td>{p.is_notice && <span className="admin-badge pending" style={{ marginRight: '6px' }}>공지</span>}{p.title}</td>
                <td>{board?.name ?? '-'}</td>
                <td>{author?.nickname ?? '탈퇴한 회원'}</td>
                <td>{p.view_count}</td>
                <td>{p.comment_count}</td>
                <td><span className={`admin-badge ${p.is_deleted ? 'dismissed' : 'reviewed'}`}>{p.is_deleted ? '삭제됨' : '정상'}</span></td>
                <td style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleToggleNotice(p.id, p.is_notice)} className="admin-btn primary">
                    {p.is_notice ? '공지 해제' : '공지 지정'}
                  </button>
                  {!p.is_deleted && <button onClick={() => handleDelete(p.id)} className="admin-btn danger">삭제</button>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
