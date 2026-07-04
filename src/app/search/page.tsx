import Link from 'next/link'
import type { Metadata } from 'next'
import { searchPosts } from '@/lib/queries'

export const metadata: Metadata = {
  title: '통합검색',
  robots: { index: false, follow: true },
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const posts = query ? await searchPosts(query) : []

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '48px' }}>
      <h1 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>
        {query ? <>&lsquo;{query}&rsquo; 검색 결과</> : '통합검색'}
      </h1>
      <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem', marginBottom: '20px' }}>{posts.length}건</p>

      {!query ? (
        <p style={{ color: 'var(--ink-faint)' }}>검색어를 입력해 주세요.</p>
      ) : posts.length === 0 ? (
        <p style={{ color: 'var(--ink-faint)' }}>검색 결과가 없습니다.</p>
      ) : (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          {posts.map(post => (
            <Link
              key={post.id}
              href={post.board?.slug ? `/board/${post.board.slug}/${post.id}` : '#'}
              style={{ display: 'block', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}
            >
              <div style={{ fontWeight: 700 }}>{post.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: '4px' }}>
                {post.board?.name} · {post.author?.nickname ?? '탈퇴한 회원'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
