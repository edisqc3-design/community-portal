'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSponsorAdAdmin, deleteSponsorAdAdmin, toggleSponsorAdActiveAdmin } from '@/lib/admin-actions'
import type { SponsorAd } from '@/types'

export default function AdsAdminClient({ initialAds }: { initialAds: SponsorAd[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [weight, setWeight] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const resetForm = () => {
    setTitle('')
    setLinkUrl('')
    setWeight(1)
    setStartDate('')
    setEndDate('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCreate = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!title.trim() || !linkUrl.trim()) {
      setErrorMsg('제목과 링크는 필수입니다.')
      setStatus('error')
      return
    }
    if (!file) {
      setErrorMsg('배너 이미지를 선택해주세요.')
      setStatus('error')
      return
    }

    setStatus('loading')
    const formData = new FormData()
    formData.set('title', title.trim())
    formData.set('link_url', linkUrl.trim())
    formData.set('weight', String(weight))
    formData.set('start_date', startDate)
    formData.set('end_date', endDate)
    formData.set('image', file)

    const result = await createSponsorAdAdmin(formData)
    if (!result.success) {
      setErrorMsg(result.error)
      setStatus('error')
      return
    }
    resetForm()
    setStatus('idle')
    router.refresh()
  }

  const handleToggle = async (id: string, next: boolean) => {
    await toggleSponsorAdActiveAdmin(id, next)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 광고를 완전히 삭제할까요? (되돌릴 수 없습니다)')) return
    await deleteSponsorAdAdmin(id)
    router.refresh()
  }

  const today = new Date().toISOString().slice(0, 10)
  const isExpired = (ad: SponsorAd) => !!ad.end_date && ad.end_date < today
  const isScheduled = (ad: SponsorAd) => !!ad.start_date && ad.start_date > today

  return (
    <div>
      <h1>광고 관리</h1>
      <p style={{ fontSize: '0.84rem', color: 'var(--ink-faint)', marginTop: '-6px', marginBottom: '20px' }}>
        좌측 배너 영역에 노출되는 스폰서 광고입니다 (구글 애드센스와 별도). 여러 개를 등록하면 노출 가중치에 따라 무작위로 순환 노출되고,
        노출 기간이 지나면 자동으로 숨겨집니다.
      </p>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px', padding: '18px', marginBottom: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>광고명 (내부 식별용)</label>
          <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '160px' }} placeholder="예: OO업체 배너" />
        </div>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>클릭 시 이동 링크</label>
          <input className="input-field" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>배너 이미지</label>
          <input ref={fileInputRef} type="file" accept="image/*" className="input-field" style={{ width: '200px' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>노출 가중치</label>
          <input className="input-field" type="number" min={1} value={weight} onChange={e => setWeight(Number(e.target.value))} style={{ width: '70px' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>시작일 (선택)</label>
          <input className="input-field" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>종료일 (선택)</label>
          <input className="input-field" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <button onClick={handleCreate} disabled={status === 'loading'} className="btn-primary">
          {status === 'loading' ? '업로드 중...' : '+ 광고 추가'}
        </button>
      </div>
      {status === 'error' && <p style={{ color: 'var(--pin-red)', fontSize: '0.82rem', marginBottom: '14px' }}>{errorMsg}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>미리보기</th><th>광고명</th><th>링크</th><th>가중치</th><th>노출 기간</th><th>상태</th><th></th>
          </tr>
        </thead>
        <tbody>
          {initialAds.map(ad => (
            <tr key={ad.id}>
              <td>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.image_url} alt={ad.title} style={{ width: '60px', height: 'auto', borderRadius: '4px', border: '1px solid var(--border)' }} />
              </td>
              <td>{ad.title}</td>
              <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink-faint)' }}>{ad.link_url}</td>
              <td>{ad.weight}</td>
              <td style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
                {ad.start_date || '제한없음'} ~ {ad.end_date || '제한없음'}
              </td>
              <td>
                {!ad.is_active && <span className="admin-badge dismissed">비활성</span>}
                {ad.is_active && isExpired(ad) && <span className="admin-badge dismissed">기간만료</span>}
                {ad.is_active && isScheduled(ad) && <span className="admin-badge pending">노출예정</span>}
                {ad.is_active && !isExpired(ad) && !isScheduled(ad) && <span className="admin-badge reviewed">노출중</span>}
              </td>
              <td style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleToggle(ad.id, !ad.is_active)} className="admin-btn primary">
                  {ad.is_active ? '비활성화' : '활성화'}
                </button>
                <button onClick={() => handleDelete(ad.id)} className="admin-btn danger">삭제</button>
              </td>
            </tr>
          ))}
          {initialAds.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: '24px' }}>등록된 광고가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
