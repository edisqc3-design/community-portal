import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getUser, getProfile } from '@/lib/auth-actions'
import { getUnreadNotificationCount, getUnreadMessageCount } from '@/lib/queries'

export const metadata: Metadata = {
  title: '마이페이지',
  robots: { index: false, follow: false },
}

export default async function MyPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login?next=/mypage')
  const profile = await getProfile(user.id)
  const unreadNoti = await getUnreadNotificationCount(user.id)
  const unreadMsg = await getUnreadMessageCount(user.id)

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '48px', maxWidth: '560px' }}>
      <h1 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>마이페이지</h1>
      <div style={{ background: 'var(--paper)', borderRadius: '10px', padding: 'clamp(18px, 5vw, 28px)', boxShadow: '0 4px 16px var(--paper-shadow)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{profile?.nickname}</p>
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem', marginTop: '4px' }}>{user.email}</p>
        <div style={{ display: 'flex', gap: '20px', marginTop: '18px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>등급</div>
            <div style={{ fontWeight: 700 }}>Lv.{profile?.level ?? 1}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>포인트</div>
            <div style={{ fontWeight: 700 }}>{profile?.points ?? 0}P</div>
          </div>
        </div>
      </div>

      <div className="two-col-row" style={{ marginTop: '16px' }}>
        <Link href="/mypage/notifications" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', display: 'block' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>🔔 알림 {unreadNoti > 0 && <span style={{ color: 'var(--pin-red)' }}>({unreadNoti})</span>}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: '4px' }}>댓글·답글·좋아요 알림 확인</div>
        </Link>
        <Link href="/mypage/messages" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', display: 'block' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>✉️ 쪽지함 {unreadMsg > 0 && <span style={{ color: 'var(--pin-red)' }}>({unreadMsg})</span>}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: '4px' }}>다른 회원과 쪽지 주고받기</div>
        </Link>
      </div>

      <p style={{ color: 'var(--ink-faint)', fontSize: '0.8rem', marginTop: '16px' }}>
        내가 쓴 글 · 스크랩 목록은 다음 업데이트에서 추가될 예정입니다.
      </p>
    </div>
  )
}
