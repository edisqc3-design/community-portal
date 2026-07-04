import Link from 'next/link'
import { getPopularPosts } from '@/lib/queries'

export default async function RankingWidget() {
  const posts = await getPopularPosts(5)

  return (
    <div className="mod">
      <div className="mod-head">
        <b>🔥 실시간 인기글</b>
        <span className="more">더보기</span>
      </div>
      {posts.length === 0 ? (
        <p style={{ padding: '16px', color: 'var(--ink-faint)', fontSize: '0.8rem' }}>집계된 인기글이 없습니다.</p>
      ) : (
        <ul className="rank-mini">
          {posts.map((post, i) => (
            <li key={post.id}>
              <span className="n">{i + 1}</span>
              <Link href={post.board?.slug ? `/board/${post.board.slug}/${post.id}` : '#'} className="t">
                {post.title}
              </Link>
              <span className="stat">🔥{post.view_count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
