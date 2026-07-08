'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/lib/actions'
import RichTextEditor from '@/components/editor/RichTextEditor'

export default function WriteClient({ boardId, boardName, boardSlug }: { boardId: string; boardName: string; boardSlug: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg('제목을 입력해 주세요.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    const result = await createPost({ boardId, title, content })
    if (result.success) {
      router.push(`/board/${boardSlug}/${result.data.id}`)
    } else {
      setErrorMsg(result.error)
      setStatus('error')
    }
  }

  return (
    <div className="container" style={{ paddingTop: '28px', paddingBottom: '48px', maxWidth: '760px' }}>
      <h1 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{boardName}에 글쓰기</h1>
      <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem', marginBottom: '24px' }}>
        작성한 글은 본인만 수정·삭제할 수 있습니다.
      </p>

      <div style={{ background: 'var(--paper)', borderRadius: '10px', padding: 'clamp(18px, 5vw, 28px)', boxShadow: '0 4px 16px var(--paper-shadow)' }}>
        <input
          className="input-field"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ marginBottom: '14px', fontSize: '1rem', fontWeight: 700, background: 'var(--white)' }}
        />

        <RichTextEditor value={content} onChange={setContent} placeholder="내용을 입력하세요" />

        {status === 'error' && (
          <div style={{ padding: '12px 14px', background: '#fdeeee', border: '1px solid var(--pin-red)', borderRadius: '8px', color: '#8a2c26', fontSize: '0.875rem', marginTop: '14px' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
          <button onClick={() => router.back()} className="btn-outline">취소</button>
          <button onClick={handleSubmit} disabled={status === 'loading'} className="btn-primary">
            {status === 'loading' ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
