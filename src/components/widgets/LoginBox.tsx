import Link from 'next/link'
import { getUser, getProfile } from '@/lib/auth-actions'

export default async function LoginBox() {
  const user = await getUser()
  const profile = user ? await getProfile(user.id) : null

  if (user && profile) {
    return (
      <div className="login-box">
        <div className="welcome">🎉 {profile.nickname}님, 반가워요</div>
        <div className="points">Lv.{profile.level} · {profile.points}P</div>
        <div className="quick">
          <Link href="/mypage">마이페이지</Link>
          <Link href="/search">인기글</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="login-box">
      <div className="welcome">🎁 로그인 후 더 많은 혜택을!</div>
      <p>로그인하고 다양한 커뮤니티 활동을 즐겨보세요</p>
      <Link href="/auth/login" className="btn">로그인</Link>
      <div className="sub">
        <Link href="/auth/register">회원가입</Link>
        <Link href="/auth/login">아이디 찾기</Link>
      </div>
    </div>
  )
}
