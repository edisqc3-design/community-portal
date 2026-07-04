import Link from 'next/link'
import { getRecentPosts } from '@/lib/queries'
import { boardBadgeColor } from '@/lib/board-style'

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

export default async function RecentPostsList() {
  const posts = await getRecentPosts(5)

  return (
    <div className="mod">
      <div className="mod-head">
        <b>최신 게시글</b>
        <span className="more">더보기</span>
      </div>
      {posts.length === 0 ? (
        <p style={{ padding: '20px 16px', color: 'var(--ink-faint)', fontSize: '0.85rem' }}>아직 등록된 글이 없어요.</p>
      ) : (
        <ul className="rank-mini">
          {posts.map(post => (
            <li key={post.id}>
              <span
                style={{
                  fontSize: '0.68rem', fontWeight: 800, color: '#fff',
                  background: boardBadgeColor(post.board?.slug ?? ''),
                  padding: '2px 6px', borderRadius: '3px', flexShrink: 0,
                }}
              >
                {post.board?.name}
              </span>
              <Link href={post.board?.slug ? `/board/${post.board.slug}/${post.id}` : '#'} className="t">
                {post.title}
              </Link>
              <span className="stat" style={{ color: 'var(--ink-faint)' }}>{timeAgo(post.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
