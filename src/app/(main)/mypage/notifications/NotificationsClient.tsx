'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions'

interface NotificationRow {
  id: string
  type: string
  content: string
  link: string | null
  is_read: boolean
  created_at: string
}

const TYPE_ICON: Record<string, string> = { comment: '💬', reply: '↩️', like: '❤️', notice: '📌', message: '✉️' }

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

export default function NotificationsClient({ initialNotifications }: { initialNotifications: NotificationRow[] }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)

  const handleClick = async (n: NotificationRow) => {
    if (!n.is_read) {
      setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, is_read: true } : x)))
      await markNotificationRead(n.id)
    }
    if (n.link) router.push(n.link)
  }

  const handleMarkAll = async () => {
    setNotifications(prev => prev.map(x => ({ ...x, is_read: true })))
    await markAllNotificationsRead()
  }

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '48px', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '1.3rem' }}>알림</h1>
        <button onClick={handleMarkAll} className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>모두 읽음 처리</button>
      </div>

      {notifications.length === 0 ? (
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.86rem' }}>알림이 없습니다.</p>
      ) : (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          {notifications.map(n => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start', width: '100%', textAlign: 'left',
                padding: '14px 18px', borderBottom: '1px solid var(--border)', background: n.is_read ? 'transparent' : 'var(--brand-pale)',
                border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{TYPE_ICON[n.type] ?? '🔔'}</span>
              <span style={{ flex: 1 }}>
                <div style={{ fontSize: '0.86rem', color: 'var(--ink)', fontWeight: n.is_read ? 400 : 700 }}>{n.content}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--ink-faint)', marginTop: '3px' }}>{timeAgo(n.created_at)}</div>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
