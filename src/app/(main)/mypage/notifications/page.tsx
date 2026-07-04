import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUser } from '@/lib/auth-actions'
import { getNotifications } from '@/lib/queries'
import NotificationsClient from './NotificationsClient'

export const metadata: Metadata = {
  title: '알림',
  robots: { index: false, follow: false },
}

export default async function NotificationsPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login?next=/mypage/notifications')

  const notifications = await getNotifications(user.id, 30)
  return <NotificationsClient initialNotifications={notifications} />
}
