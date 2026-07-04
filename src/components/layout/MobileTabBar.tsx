import Link from 'next/link'
import { getUser } from '@/lib/auth-actions'
import { getBoards } from '@/lib/queries'

export default async function MobileTabBar() {
  const user = await getUser()
  const boards = await getBoards()
  const firstWritableBoard = boards.find(b => b.slug !== 'notice') ?? boards[0]

  return (
    <div className="mobile-tabbar">
      <div className="inner">
        <Link href="/" className="active">
          <span className="ico">🏠</span>홈
        </Link>
        <Link href="/search">
          <span className="ico">🔍</span>검색
        </Link>
        <Link href={firstWritableBoard ? `/board/${firstWritableBoard.slug}/write` : '/auth/login'} className="fab">
          +
        </Link>
        <Link href="/mypage">
          <span className="ico">🔔</span>알림
        </Link>
        <Link href={user ? '/mypage' : '/auth/login'}>
          <span className="ico">👤</span>마이
        </Link>
      </div>
    </div>
  )
}
