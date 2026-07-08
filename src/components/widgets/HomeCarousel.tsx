'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { boardIcon, boardBadgeColor } from '@/lib/board-style'
import type { CarouselSectionWithPosts } from '@/types'

// 캐러셀 하나에 여러 섹션(게시판)을 탭으로 묶어서 보여줍니다.
// 탭을 클릭하면 같은 캐러셀 영역 안에서 내용만 바뀌고, 섹션마다 따로 쌓이지 않습니다.
export default function HomeCarousel({ sections }: { sections: CarouselSectionWithPosts[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  if (sections.length === 0) return null

  const active = sections[Math.min(activeIndex, sections.length - 1)]
  const boardSlug = active.board?.slug ?? ''

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  const handleTabClick = (index: number) => {
    setActiveIndex(index)
    trackRef.current?.scrollTo({ left: 0 })
  }

  return (
    <div className="carousel-block">
      <div className="carousel-tabs">
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            className={`carousel-tab${index === activeIndex ? ' active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            {section.title}
          </button>
        ))}
        {boardSlug && (
          <Link href={`/board/${boardSlug}`} className="carousel-tabs-more">더보기 ›</Link>
        )}
      </div>

      <div className="carousel-wrap">
        <button type="button" className="carousel-nav prev" onClick={() => scroll(-1)} aria-label="이전 카드">‹</button>

        <div ref={trackRef} className="carousel-track">
          {active.posts.map(post => (
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
          {active.posts.length === 0 && (
            <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem', padding: '20px 4px' }}>아직 등록된 글이 없어요.</p>
          )}
        </div>

        <button type="button" className="carousel-nav next" onClick={() => scroll(1)} aria-label="다음 카드">›</button>
      </div>
    </div>
  )
}
