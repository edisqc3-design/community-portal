import Link from 'next/link'
import { getBoards } from '@/lib/queries'

export default async function BoardNavTabs() {
  const boards = await getBoards()

  return (
    <nav className="nav-tabs">
      <div className="container inner">
        <Link href="/" className="active">홈</Link>
        {boards.map(board => (
          <Link key={board.id} href={`/board/${board.slug}`}>{board.name}</Link>
        ))}
        <span className="more">더보기 ⌄</span>
      </div>
    </nav>
  )
}
