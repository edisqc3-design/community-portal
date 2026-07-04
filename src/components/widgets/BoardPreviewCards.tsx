import Link from 'next/link'
import { getBoards, getBoardPreview } from '@/lib/queries'
import { boardIcon, boardBadgeColor } from '@/lib/board-style'

export default async function BoardPreviewCards() {
  const boards = await getBoards()
  const featured = boards.filter(b => b.slug !== 'notice').slice(0, 4)

  const cards = await Promise.all(
    featured.map(async board => ({
      board,
      posts: await getBoardPreview(board.slug, 3),
    }))
  )

  return (
    <div>
      <div className="section-heading" style={{ marginTop: '20px' }}>
        게시판별 최신글
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--ink-faint)', fontWeight: 400 }}>더보기 ›</span>
      </div>
      <div className="board-card-grid">
        {cards.map(({ board, posts }) => (
          <div key={board.id} className="board-card">
            <Link href={`/board/${board.slug}`} className="board-card-head">
              <span className="ic" style={{ background: boardBadgeColor(board.slug) }}>{boardIcon(board.slug)}</span>
              <b>{board.name}</b>
            </Link>
            <ul>
              {posts.length === 0 ? (
                <li style={{ color: 'var(--ink-faint)' }}>아직 게시글이 없습니다</li>
              ) : (
                posts.map(post => (
                  <li key={post.id}>
                    <Link href={`/board/${board.slug}/${post.id}`}>{post.title}</Link>
                  </li>
                ))
              )}
            </ul>
            <Link href={`/board/${board.slug}`} className="more">더보기 ›</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
