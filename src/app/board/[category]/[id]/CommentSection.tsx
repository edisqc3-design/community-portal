'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createComment } from '@/lib/actions'
import CommentItem from './CommentItem'
import type { Comment } from '@/types'

export default function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: {
  postId: string
  initialComments: Comment[]
  currentUserId: string | null
}) {
  const router = useRouter()
  const comments = initialComments
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async () => {
    if (!currentUserId) {
      router.push('/auth/login')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    const result = await createComment({ postId, content })
    if (!result.success) {
      setErrorMsg(result.error)
      setStatus('error')
      return
    }
    setContent('')
    setStatus('idle')
    router.refresh()
  }

  // 대댓글은 1단계만 지원: parent_id가 없는 댓글을 루트로, 나머지는 전부 해당 루트의 답글로 묶습니다.
  const roots = comments.filter(c => !c.parent_id)
  const repliesByRoot = new Map<string, Comment[]>()
  comments.filter(c => c.parent_id).forEach(reply => {
    const rootId = reply.parent_id!
    if (!repliesByRoot.has(rootId)) repliesByRoot.set(rootId, [])
    repliesByRoot.get(rootId)!.push(reply)
  })

  return (
    <div>
      <h2 className="section-heading">💬 댓글 {comments.length}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
        {roots.length === 0 ? (
          <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>첫 댓글을 남겨보세요!</p>
        ) : (
          roots.map(root => (
            <CommentItem
              key={root.id}
              comment={root}
              replies={repliesByRoot.get(root.id) ?? []}
              postId={postId}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          className="input-field"
          placeholder={currentUserId ? '댓글을 입력하세요' : '로그인 후 댓글을 작성할 수 있습니다'}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <button onClick={handleSubmit} disabled={status === 'loading'} className="btn-primary" style={{ flexShrink: 0 }}>
          등록
        </button>
      </div>
      {status === 'error' && <p style={{ color: 'var(--pin-red)', fontSize: '0.8rem', marginTop: '6px' }}>{errorMsg}</p>}
    </div>
  )
}
