import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUser } from '@/lib/auth-actions'
import { getMessages } from '@/lib/queries'
import MessagesClient from './MessagesClient'

export const metadata: Metadata = {
  title: '쪽지함',
  robots: { index: false, follow: false },
}

export default async function MessagesPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login?next=/mypage/messages')

  const messages = await getMessages(user.id, 30)
  return <MessagesClient initialMessages={messages} currentUserId={user.id} />
}
