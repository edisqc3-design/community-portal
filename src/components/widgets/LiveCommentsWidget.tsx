import Link from 'next/link'
import { getRecentComments } from '@/lib/queries'

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

export default async function LiveCommentsWidget() {
  const comments = await getRecentComments(5)

  return (
    <div className="mod">
      <div className="mod-head">
        <b>💬 실시간 댓글</b>
        <span className="more">더보기</span>
      </div>
      {comments.length === 0 ? (
        <p style={{ padding: '16px', color: 'var(--ink-faint)', fontSize: '0.8rem' }}>아직 댓글이 없습니다.</p>
      ) : (
        <ul className="live-comments">
          {comments.map(c => {
            const boardSlug = (c as { post?: { board?: { slug?: string } } }).post?.board?.slug
            const authorNickname = (c.author as unknown as { nickname?: string } | null)?.nickname
            const href = boardSlug ? `/board/${boardSlug}/${c.post_id}` : '/search'
            return (
              <li key={c.id}>
                <Link href={href} className="c-text">{c.content}</Link>
                <div className="c-meta">{authorNickname ?? '탈퇴한 회원'} · {timeAgo(c.created_at)}</div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
