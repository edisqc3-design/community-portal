'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Board } from '@/types'

interface Props {
  boards: Board[]
}

export default function BoardNavTabsClient({ boards }: Props) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const moreRef = useRef<HTMLDivElement>(null)

  // 전부 보인다고 가정하고 시작 (측정 전 깜빡임 방지를 위해 넉넉하게 시작)
  const [visibleCount, setVisibleCount] = useState(boards.length + 1)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const allItems = [{ id: 'home', slug: '', name: '홈' }, ...boards.map(b => ({ id: b.id, slug: b.slug, name: b.name }))]

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current
      if (!container) return
      const containerWidth = container.offsetWidth
      const moreWidth = 70 // "더보기" 버튼 예상 폭 확보

      let used = 0
      let count = 0
      for (let i = 0; i < allItems.length; i++) {
        const el = itemRefs.current[i]
        if (!el) continue
        const w = el.offsetWidth + 22 // gap 포함
        // 마지막 항목까지 다 들어가면 더보기 버튼 자리 안 빼도 됨
        const isLast = i === allItems.length - 1
        const reserve = isLast ? 0 : moreWidth
        if (used + w + reserve <= containerWidth) {
          used += w
          count = i + 1
        } else {
          break
        }
      }
      setVisibleCount(Math.max(count, 1))
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boards.length])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const overflowItems = allItems.slice(visibleCount)
  const hasOverflow = overflowItems.length > 0

  return (
    <nav className="nav-tabs">
      <div className="container">
        <div className="inner" ref={containerRef}>
          {/* 실제로 보여주는 탭 (측정된 개수만큼만) */}
          {allItems.map((item, i) => {
            const href = item.slug ? `/board/${item.slug}` : '/'
            const isActive = item.slug ? pathname === href : pathname === '/'
            const hidden = i >= visibleCount
            return (
              <Link
                key={item.id}
                href={href}
                ref={el => { itemRefs.current[i] = el }}
                className={isActive ? 'active' : ''}
                style={hidden ? { position: 'absolute', visibility: 'hidden', pointerEvents: 'none' } : undefined}
              >
                {item.name}
              </Link>
            )
          })}

          {hasOverflow && (
            <div className="nav-more-wrap" ref={moreRef}>
              <span className="more" role="button" onClick={() => setDropdownOpen(v => !v)}>
                더보기 {dropdownOpen ? '⌃' : '⌄'}
              </span>
              {dropdownOpen && (
                <div className="nav-more-dropdown">
                  {overflowItems.map(item => {
                    const href = item.slug ? `/board/${item.slug}` : '/'
                    return (
                      <Link key={item.id} href={href} onClick={() => setDropdownOpen(false)}>
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
