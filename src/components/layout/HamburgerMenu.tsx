'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Board } from '@/types'
import { boardIcon, boardBadgeColor } from '@/lib/board-style'

export default function HamburgerMenu({ boards }: { boards: Board[] }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const half = Math.ceil(boards.length / 2)
  const boardsCol1 = boards.slice(0, half)
  const boardsCol2 = boards.slice(half)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="sitemap-wrap" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setOpen(v => !v)}
        aria-label="전체 사이트맵 열기"
        aria-expanded={open}
      >
        ☰
      </button>

      {open && (
        <>
          {/* 모바일에서 배경 탭으로 닫기 위한 스크림 (드롭다운 자체는 아래에 별도 렌더) */}
          <div className="sitemap-scrim" onClick={() => setOpen(false)} />

          <div className="sitemap-dropdown" role="menu">
            <div className="sitemap-header">
              <span>전체 사이트맵</span>
              <button type="button" className="sitemap-close" onClick={() => setOpen(false)} aria-label="닫기">✕</button>
            </div>

            <div className="sitemap-body">
              <div className="sitemap-col">
                <div className="sitemap-col-title">바로가기</div>
                <Link href="/" onClick={() => setOpen(false)} className="sitemap-link">
                  <span className="ico" style={{ background: 'var(--brand)' }}>🏠</span>홈
                </Link>
                <Link href="/search" onClick={() => setOpen(false)} className="sitemap-link">
                  <span className="ico" style={{ background: '#7a8a9a' }}>🔍</span>검색
                </Link>
                <Link href="/mypage" onClick={() => setOpen(false)} className="sitemap-link">
                  <span className="ico" style={{ background: '#3a7bf0' }}>👤</span>마이페이지
                </Link>

                <div className="sitemap-col-title">게시판</div>
                {boardsCol1.map(board => (
                  <Link key={board.id} href={`/board/${board.slug}`} onClick={() => setOpen(false)} className="sitemap-link">
                    <span className="ico" style={{ background: boardBadgeColor(board.slug) }}>{boardIcon(board.slug)}</span>
                    {board.name}
                  </Link>
                ))}
              </div>

              <div className="sitemap-col">
                <div className="sitemap-col-title">게시판 더보기</div>
                {boardsCol2.map(board => (
                  <Link key={board.id} href={`/board/${board.slug}`} onClick={() => setOpen(false)} className="sitemap-link">
                    <span className="ico" style={{ background: boardBadgeColor(board.slug) }}>{boardIcon(board.slug)}</span>
                    {board.name}
                  </Link>
                ))}
                {boardsCol2.length === 0 && (
                  <p style={{ padding: '9px 10px', fontSize: '0.82rem', color: 'var(--ink-faint)' }}>
                    등록된 게시판이 모두 왼쪽에 표시됩니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
