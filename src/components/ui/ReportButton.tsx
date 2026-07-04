'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createReport } from '@/lib/actions'

const REASONS = ['스팸/광고', '욕설/비방', '음란물', '허위정보', '기타']

export default function ReportButton({ targetType, targetId }: { targetType: 'post' | 'comment'; targetId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleOpen = () => {
    setOpen(v => !v)
    setStatus('idle')
  }

  const handleSubmit = () => {
    if (!reason) {
      setErrorMsg('신고 사유를 선택해 주세요.')
      setStatus('error')
      return
    }
    setStatus('loading')
    startTransition(async () => {
      const result = await createReport({ targetType, targetId, reason })
      if (!result.success) {
        if (result.error === '로그인이 필요합니다.') { router.push('/auth/login'); return }
        setErrorMsg(result.error)
        setStatus('error')
        return
      }
      setStatus('done')
    })
  }

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={handleOpen}
        style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', fontSize: '0.76rem', cursor: 'pointer' }}
      >
        🚩 신고
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', zIndex: 10, top: '22px', right: 0, width: '200px',
            background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '12px',
          }}
        >
          {status === 'done' ? (
            <p style={{ fontSize: '0.78rem', color: 'var(--brand-dark)' }}>신고가 접수되었습니다.</p>
          ) : (
            <>
              <p style={{ fontSize: '0.76rem', fontWeight: 700, marginBottom: '8px' }}>신고 사유 선택</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                {REASONS.map(r => (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--ink-soft)' }}>
                    <input type="radio" name={`report-${targetId}`} checked={reason === r} onChange={() => setReason(r)} />
                    {r}
                  </label>
                ))}
              </div>
              {status === 'error' && <p style={{ fontSize: '0.72rem', color: 'var(--pin-red)', marginBottom: '8px' }}>{errorMsg}</p>}
              <button onClick={handleSubmit} disabled={isPending} className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.78rem' }}>
                {isPending ? '접수 중...' : '신고하기'}
              </button>
            </>
          )}
        </div>
      )}
    </span>
  )
}
