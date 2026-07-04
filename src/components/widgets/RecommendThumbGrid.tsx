import Link from 'next/link'
import { getPopularPosts } from '@/lib/queries'
import { boardIcon, boardBadgeColor } from '@/lib/board-style'

export default async function RecommendThumbGrid() {
  const posts = await getPopularPosts(4)

  return (
    <div>
      <div className="section-heading" style={{ marginTop: '20px' }}>
        오늘의 추천 게시글
      </div>
      {posts.length === 0 ? (
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>아직 등록된 글이 없어요.</p>
      ) : (
        <div className="thumb-grid">
          {posts.map(post => (
            <Link
              key={post.id}
              href={post.board?.slug ? `/board/${post.board.slug}/${post.id}` : '#'}
              className="thumb-grid-card"
            >
              <div className="thumb-grid-img">
                <span className="thumb-grid-badge" style={{ background: boardBadgeColor(post.board?.slug ?? '') }}>
                  {post.board?.name}
                </span>
                {boardIcon(post.board?.slug ?? '')}
              </div>
              <div className="t">{post.title}</div>
              <div className="m">⏱ {new Date(post.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} · 👁 {post.view_count} · 💬 {post.comment_count}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
