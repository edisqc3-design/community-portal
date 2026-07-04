import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBoardBySlug, getPostsByBoard } from '@/lib/queries'

const PAGE_SIZE = 20

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const board = await getBoardBySlug(category)
  if (!board) return { title: '게시판을 찾을 수 없습니다' }

  const title = board.name
  const description = board.description ?? `${board.name} 게시판의 최신 글을 확인해보세요.`

  return {
    title,
    description,
    alternates: { canonical: `/board/${board.slug}` },
    openGraph: { title, description, url: `/board/${board.slug}` },
  }
}

export default async function BoardListPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { category } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const board = await getBoardBySlug(category)
  if (!board) notFound()

  const { posts, total } = await getPostsByBoard(board.id, page, PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>{board.name}</h1>
          {board.description && <p style={{ color: 'var(--ink-faint)', fontSize: '0.88rem', marginTop: '4px' }}>{board.description}</p>}
        </div>
        <Link href={`/board/${board.slug}/write`} className="btn-primary">✏️ 글쓰기</Link>
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        {posts.length === 0 ? (
          <p style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--ink-faint)' }}>아직 게시글이 없습니다. 첫 글을 남겨보세요!</p>
        ) : (
          posts.map(post => (
            <Link
              key={post.id}
              href={`/board/${board.slug}/${post.id}`}
              style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {post.is_notice && <span className="notice-tag">공지</span>}
                {post.title}
                {post.comment_count > 0 && <span style={{ color: 'var(--pin-red)', fontWeight: 700 }}> [{post.comment_count}]</span>}
              </span>
              <span style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--ink-faint)', flexShrink: 0 }}>
                <span>{post.author?.nickname ?? '탈퇴한 회원'}</span>
                <span>조회 {post.view_count}</span>
              </span>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/board/${board.slug}?page=${p}`}
              style={{
                padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem',
                background: p === page ? 'var(--ink)' : 'transparent',
                color: p === page ? 'var(--paper)' : 'var(--ink-soft)',
                border: '1px solid var(--border)',
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
