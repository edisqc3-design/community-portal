'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { boardIcon, boardBadgeColor } from '@/lib/board-style'
import type { CarouselSectionWithPosts } from '@/types'

export default function HomeCarousel({ section }: { section: CarouselSectionWithPosts }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const boardSlug = section.board?.slug ?? ''

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <div className="carousel-block">
      <div className="section-heading" style={{ marginTop: '20px' }}>
        {section.title}
        {boardSlug && (
          <Link href={`/board/${boardSlug}`} style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--ink-faint)', fontWeight: 400 }}>
            더보기 ›
          </Link>
        )}
      </div>

      <div className="carousel-wrap">
        <button type="button" className="carousel-nav prev" onClick={() => scroll(-1)} aria-label="이전 카드">‹</button>

        <div ref={trackRef} className="carousel-track">
          {section.posts.map(post => (
            <Link
              key={post.id}
              href={boardSlug ? `/board/${boardSlug}/${post.id}` : '#'}
              className="carousel-card"
            >
              <div className="carousel-card-img">
                {post.resolvedThumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.resolvedThumbnail} alt={post.title} loading="lazy" />
                ) : (
                  <span className="carousel-card-fallback" style={{ background: boardBadgeColor(boardSlug) }}>
                    {boardIcon(boardSlug)}
                  </span>
                )}
              </div>
              <div className="carousel-card-title">{post.title}</div>
              <div className="carousel-card-meta">👁 {post.view_count} · 💬 {post.comment_count}</div>
            </Link>
          ))}
        </div>

        <button type="button" className="carousel-nav next" onClick={() => scroll(1)} aria-label="다음 카드">›</button>
      </div>
    </div>
  )
}
