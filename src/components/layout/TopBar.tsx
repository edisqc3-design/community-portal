import Link from 'next/link'
import { getUser, getProfile, logout } from '@/lib/auth-actions'
import { getUnreadNotificationCount, getUnreadMessageCount, getBoards } from '@/lib/queries'
import HamburgerMenu from './HamburgerMenu'

export default async function TopBar() {
  const user = await getUser()
  const profile = user ? await getProfile(user.id) : null
  const unreadNoti = user ? await getUnreadNotificationCount(user.id) : 0
  const unreadMsg = user ? await getUnreadMessageCount(user.id) : 0
  const bellCount = unreadNoti + unreadMsg
  const boards = await getBoards()

  return (
    <div className="container">
      <div className="util-row">
        <HamburgerMenu boards={boards} />
        <Link href="/" className="brand-logo">Community Portal</Link>
        <div className="right-icons">
          {user && profile ? (
            <>
              {profile.is_admin && (
                <Link href="/admin" className="nick" style={{ color: 'var(--pin-red)', fontWeight: 700 }}>관리자</Link>
              )}
              <Link href="/mypage" className="nick">{profile.nickname}님</Link>
              <form action={logout}>
                <button type="submit" className="logout-btn">로그아웃</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="nick">로그인</Link>
              <Link href="/auth/register" className="nick" style={{ color: 'var(--brand)', fontWeight: 700 }}>회원가입</Link>
            </>
          )}
          <Link href={user ? '/mypage/notifications' : '/auth/login'} className="icon-btn" style={{ position: 'relative' }}>
            🔔
            {bellCount > 0 && (
              <span
                style={{
                  position: 'absolute', top: '-4px', right: '-4px', background: 'var(--pin-red)', color: '#fff',
                  fontSize: '0.62rem', fontWeight: 800, borderRadius: '10px', padding: '1px 5px', minWidth: '16px', textAlign: 'center',
                }}
              >
                {bellCount > 9 ? '9+' : bellCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="search-hero">
        <div className="search-mark">C</div>
        <form action="/search">
          <input type="text" name="q" placeholder="궁금한 내용을 검색해 주세요" />
          <button type="submit">검색</button>
        </form>
      </div>
    </div>
  )
}
