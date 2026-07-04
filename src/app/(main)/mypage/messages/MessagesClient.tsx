'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendMessage, markMessageRead } from '@/lib/actions'

interface MessageRow {
  id: string
  sender_id: string | null
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: { nickname: string } | { nickname: string }[] | null
  receiver?: { nickname: string } | { nickname: string }[] | null
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

export default function MessagesClient({ initialMessages, currentUserId }: { initialMessages: MessageRow[]; currentUserId: string }) {
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSend = async () => {
    setStatus('loading')
    setErrorMsg('')
    const result = await sendMessage({ receiverNickname: nickname, content })
    if (!result.success) {
      setErrorMsg(result.error)
      setStatus('error')
      return
    }
    setNickname('')
    setContent('')
    setStatus('idle')
    router.refresh()
  }

  const handleOpen = async (m: MessageRow) => {
    if (!m.is_read && m.receiver_id === currentUserId) {
      setMessages(prev => prev.map(x => (x.id === m.id ? { ...x, is_read: true } : x)))
      await markMessageRead(m.id)
    }
  }

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '48px', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.3rem', marginBottom: '18px' }}>쪽지함</h1>

      <div style={{ background: 'var(--paper)', borderRadius: '10px', padding: '18px', boxShadow: '0 4px 16px var(--paper-shadow)', marginBottom: '20px' }}>
        <p className="section-heading" style={{ fontSize: '0.95rem', marginBottom: '10px' }}>쪽지 보내기</p>
        <input
          className="input-field"
          placeholder="받는 사람 닉네임"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          style={{ marginBottom: '8px' }}
        />
        <textarea
          className="input-field"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          style={{ marginBottom: '8px', fontFamily: 'inherit' }}
        />
        {status === 'error' && <p style={{ color: 'var(--pin-red)', fontSize: '0.78rem', marginBottom: '8px' }}>{errorMsg}</p>}
        <button onClick={handleSend} disabled={status === 'loading'} className="btn-primary" style={{ width: '100%' }}>
          {status === 'loading' ? '보내는 중...' : '보내기'}
        </button>
      </div>

      {messages.length === 0 ? (
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.86rem' }}>주고받은 쪽지가 없습니다.</p>
      ) : (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          {messages.map(m => {
            const isSent = m.sender_id === currentUserId
            const counterpart = one(isSent ? m.receiver : m.sender)?.nickname ?? '탈퇴한 회원'
            return (
              <div
                key={m.id}
                onClick={() => handleOpen(m)}
                style={{
                  padding: '14px 18px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  background: !isSent && !m.is_read ? 'var(--brand-pale)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--ink-faint)', marginBottom: '4px' }}>
                  <span>{isSent ? `${counterpart}님에게 보냄` : `${counterpart}님이 보냄`}</span>
                  <span>{timeAgo(m.created_at)}</span>
                </div>
                <p style={{ fontSize: '0.88rem' }}>{m.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
