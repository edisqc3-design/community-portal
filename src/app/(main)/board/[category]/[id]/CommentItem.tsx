'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createComment } from '@/lib/actions'
import ReportButton from '@/components/ui/ReportButton'
import type { Comment } from '@/types'

export default function CommentItem({
  comment,
  replies,
  postId,
  currentUserId,
  depth = 0,
}: {
  comment: Comment
  replies: Comment[]
  postId: string
  currentUserId: string | null
  depth?: number
}) {
  const router = useRouter()
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleReplySubmit = async () => {
    if (!currentUserId) {
      router.push('/auth/login')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    const result = await createComment({ postId, content: replyContent, parentId: comment.id })
    if (!result.success) {
      setErrorMsg(result.error)
      setStatus('error')
      return
    }
    setReplyContent('')
    setReplyOpen(false)
    setStatus('idle')
    router.refresh()
  }

  return (
    <div style={{ marginLeft: depth > 0 ? '28px' : 0 }}>
      <div style={{
        background: depth > 0 ? 'var(--bg)' : 'var(--bg-panel)',
        border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', marginTop: depth > 0 ? '8px' : 0,
      }}>
        {depth > 0 && <span style={{ color: 'var(--ink-faint)', marginRight: '4px' }}>↳</span>}
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--ink-faint)', marginBottom: '4px', alignItems: 'center' }}>
          <strong style={{ color: 'var(--ink)' }}>{comment.author?.nickname ?? '탈퇴한 회원'}</strong>
          <span>{new Date(comment.created_at).toLocaleString('ko-KR')}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
            {depth === 0 && (
              <button
                type="button"
                onClick={() => setReplyOpen(v => !v)}
                style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', fontSize: '0.76rem', cursor: 'pointer' }}
              >
                💬 답글
              </button>
            )}
            <ReportButton targetType="comment" targetId={comment.id} />
          </span>
        </div>
        <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{comment.content}</p>

        {replyOpen && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input
              className="input-field"
              placeholder={currentUserId ? '답글을 입력하세요' : '로그인 후 답글을 작성할 수 있습니다'}
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReplySubmit()}
            />
            <button onClick={handleReplySubmit} disabled={status === 'loading'} className="btn-primary" style={{ flexShrink: 0 }}>
              등록
            </button>
          </div>
        )}
        {status === 'error' && <p style={{ color: 'var(--pin-red)', fontSize: '0.78rem', marginTop: '6px' }}>{errorMsg}</p>}
      </div>

      {replies.map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          replies={[]}
          postId={postId}
          currentUserId={currentUserId}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}
