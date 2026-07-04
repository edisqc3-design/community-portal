'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Board } from '@/types'
import { boardIcon, boardBadgeColor } from '@/lib/board-style'

export default function HamburgerMenu({ boards }: { boards: Board[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label="전체 메뉴 열기">
        ☰
      </button>

      {open && (
        <div className="side-menu-overlay" onClick={() => setOpen(false)}>
          <div className="side-menu-panel" onClick={e => e.stopPropagation()}>
            <div className="side-menu-header">
              <span>전체 메뉴</span>
              <button type="button" className="side-menu-close" onClick={() => setOpen(false)} aria-label="닫기">✕</button>
            </div>

            <nav className="side-menu-list">
              <Link href="/" onClick={() => setOpen(false)} className="side-menu-item">
                <span className="ico" style={{ background: 'var(--brand)' }}>🏠</span>홈
              </Link>
              <Link href="/search" onClick={() => setOpen(false)} className="side-menu-item">
                <span className="ico" style={{ background: '#7a8a9a' }}>🔍</span>검색
              </Link>

              <div className="side-menu-divider">게시판</div>
              {boards.map(board => (
                <Link key={board.id} href={`/board/${board.slug}`} onClick={() => setOpen(false)} className="side-menu-item">
                  <span className="ico" style={{ background: boardBadgeColor(board.slug) }}>{boardIcon(board.slug)}</span>
                  {board.name}
                </Link>
              ))}

              <div className="side-menu-divider">내 계정</div>
              <Link href="/mypage" onClick={() => setOpen(false)} className="side-menu-item">
                <span className="ico" style={{ background: '#3a7bf0' }}>👤</span>마이페이지
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
