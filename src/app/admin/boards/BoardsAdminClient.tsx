'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBoardAdmin, deleteBoardAdmin } from '@/lib/admin-actions'

interface BoardRow {
  id: string
  slug: string
  name: string
  description: string | null
  order_num: number
  is_active: boolean
}

export default function BoardsAdminClient({ initialBoards }: { initialBoards: BoardRow[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ slug: '', name: '', description: '', orderNum: initialBoards.length })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleCreate = async () => {
    if (!form.slug.trim() || !form.name.trim()) {
      setErrorMsg('slug와 이름은 필수입니다.')
      setStatus('error')
      return
    }
    setStatus('loading')
    const result = await createBoardAdmin({ ...form, orderNum: Number(form.orderNum) })
    if (!result.success) {
      setErrorMsg(result.error)
      setStatus('error')
      return
    }
    setForm({ slug: '', name: '', description: '', orderNum: initialBoards.length + 1 })
    setStatus('idle')
    router.refresh()
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('이 게시판을 비활성화할까요? (게시글은 유지됩니다)')) return
    await deleteBoardAdmin(id)
    router.refresh()
  }

  return (
    <div>
      <h1>게시판 관리</h1>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px', padding: '18px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>slug</label>
          <input className="input-field" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} style={{ width: '140px' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>이름</label>
          <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '160px' }} />
        </div>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>설명</label>
          <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>순서</label>
          <input className="input-field" type="number" value={form.orderNum} onChange={e => setForm({ ...form, orderNum: Number(e.target.value) })} style={{ width: '70px' }} />
        </div>
        <button onClick={handleCreate} disabled={status === 'loading'} className="btn-primary">+ 게시판 추가</button>
      </div>
      {status === 'error' && <p style={{ color: 'var(--pin-red)', fontSize: '0.82rem', marginBottom: '14px' }}>{errorMsg}</p>}

      <table className="admin-table">
        <thead><tr><th>slug</th><th>이름</th><th>설명</th><th>순서</th><th>상태</th><th></th></tr></thead>
        <tbody>
          {initialBoards.map(b => (
            <tr key={b.id}>
              <td>{b.slug}</td>
              <td>{b.name}</td>
              <td style={{ color: 'var(--ink-faint)' }}>{b.description}</td>
              <td>{b.order_num}</td>
              <td><span className={`admin-badge ${b.is_active ? 'reviewed' : 'dismissed'}`}>{b.is_active ? '활성' : '비활성'}</span></td>
              <td>
                {b.is_active && <button onClick={() => handleDeactivate(b.id)} className="admin-btn danger">비활성화</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
