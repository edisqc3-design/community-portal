import Link from 'next/link'
import { getBoards } from '@/lib/queries'
import { boardIcon, boardBadgeColor } from '@/lib/board-style'

export default async function ShortcutRow() {
  const boards = await getBoards()
  const mainBoards = boards.filter(b => b.slug !== 'notice').slice(0, 4)

  return (
    <div className="shortcut-row">
      <div className="container inner">
        <Link href="/" className="shortcut">
          <div className="ico" style={{ background: 'var(--brand)' }}>🏠</div>
          <span className="label">홈</span>
        </Link>
        {mainBoards.map(board => (
          <Link key={board.id} href={`/board/${board.slug}`} className="shortcut">
            <div className="ico" style={{ background: boardBadgeColor(board.slug) }}>{boardIcon(board.slug)}</div>
            <span className="label">{board.name.replace('게시판', '')}</span>
          </Link>
        ))}
        <Link href="/search" className="shortcut">
          <div className="ico" style={{ background: '#7a8a9a' }}>⋯</div>
          <span className="label">더보기</span>
        </Link>
      </div>
    </div>
  )
}
