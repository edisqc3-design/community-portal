import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'
import { getPostById } from '@/lib/queries'
import { incrementViewCount } from '@/lib/actions'
import { SITE_URL, SITE_NAME } from '@/lib/site-config'
import { htmlToPlainText } from '@/lib/sanitize'
import type { Comment } from '@/types'
import CommentSection from './CommentSection'
import LikeButton from './LikeButton'
import BookmarkButton from './BookmarkButton'
import ReportButton from '@/components/ui/ReportButton'

function excerpt(html: string, len = 120) {
  const clean = htmlToPlainText(html)
  return clean.length > len ? `${clean.slice(0, len)}…` : clean
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>
}): Promise<Metadata> {
  const { category, id } = await params
  const post = await getPostById(id)
  if (!post || post.board?.slug !== category) return { title: '게시글을 찾을 수 없습니다' }

  const description = excerpt(post.content)
  const url = `/board/${category}/${id}`

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: { card: 'summary', title: post.title, description },
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>
}) {
  const { category, id } = await params
  const post = await getPostById(id)
  if (!post || post.board?.slug !== category) notFound()

  incrementViewCount(id) // fire-and-forget

  const supabase = await createClient()
  const { data: commentsRaw } = await supabase
    .from('comments')
    .select('id, post_id, author_id, content, parent_id, is_deleted, created_at, author:profiles(id, nickname, avatar_url)')
    .eq('post_id', id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  const comments = (commentsRaw as unknown as Comment[] | null)

  const { data: { user } } = await supabase.auth.getUser()
  let liked = false
  let bookmarked = false
  if (user) {
    const { data: likeRow } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    liked = !!likeRow

    const { data: bookmarkRow } = await supabase
      .from('post_bookmarks')
      .select('post_id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    bookmarked = !!bookmarkRow
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: post.title,
    text: excerpt(post.content, 300),
    datePublished: post.created_at,
    dateModified: post.updated_at,
    url: `${SITE_URL}/board/${category}/${id}`,
    author: { '@type': 'Person', name: post.author?.nickname ?? '탈퇴한 회원' },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    interactionStatistic: [
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: post.like_count },
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: post.comment_count },
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/ViewAction', userInteractionCount: post.view_count },
    ],
  }

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '48px', maxWidth: '760px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav aria-label="breadcrumb" style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginBottom: '10px' }}>
        <Link href="/">홈</Link> <span>›</span> <Link href={`/board/${category}`}>{post.board?.name}</Link> <span>›</span> <span style={{ color: 'var(--ink-soft)' }}>{post.title}</span>
      </nav>
      <Link href={`/board/${category}`} style={{ fontSize: '0.85rem', color: 'var(--ink-faint)' }}>← {post.board?.name} 목록으로</Link>

      <div style={{ background: 'var(--paper)', borderRadius: '10px', padding: 'clamp(18px, 5vw, 32px)', boxShadow: '0 4px 16px var(--paper-shadow)', marginTop: '14px' }}>
        <h1 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>
          {post.is_notice && <span className="notice-tag">공지</span>}
          {post.title}
        </h1>
        <div className="pin-card__meta" style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <span>{post.author?.nickname ?? '탈퇴한 회원'}</span>
          <span>·</span>
          <span>{new Date(post.created_at).toLocaleString('ko-KR')}</span>
          <span>·</span>
          <span>조회 {post.view_count}</span>
        </div>

        <div className="editor-content" style={{ minHeight: '120px' }} dangerouslySetInnerHTML={{ __html: post.content }} />

        <div style={{ marginTop: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <LikeButton postId={post.id} initialLiked={liked} initialCount={post.like_count} />
          <BookmarkButton postId={post.id} initialBookmarked={bookmarked} />
          <span style={{ marginLeft: 'auto' }}>
            <ReportButton targetType="post" targetId={post.id} />
          </span>
        </div>
      </div>

      <div className="thread-divider" />

      <CommentSection postId={post.id} initialComments={comments ?? []} currentUserId={user?.id ?? null} />
    </div>
  )
}
