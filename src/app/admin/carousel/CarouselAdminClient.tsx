'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createCarouselSectionAdmin,
  updateCarouselSectionAdmin,
  toggleCarouselSectionActiveAdmin,
  deleteCarouselSectionAdmin,
  setPostThumbnailAdmin,
  fetchCarouselPreviewPostsAdmin,
} from '@/lib/admin-actions'
import { extractFirstImage } from '@/lib/carousel-utils'

interface BoardOption {
  id: string
  slug: string
  name: string
}

interface SectionRow {
  id: string
  title: string
  board_id: string
  sort_type: string
  item_count: number
  display_order: number
  is_active: boolean
  created_at: string
  board: { name: string; slug: string } | { name: string; slug: string }[] | null
}

interface PreviewPost {
  id: string
  title: string
  content: string
  thumbnail_url: string | null
  view_count: number
  created_at: string
}

const emptyForm = { title: '', boardId: '', sortType: 'latest' as 'latest' | 'views', itemCount: 10, displayOrder: 0 }

function boardNameOf(row: SectionRow): string {
  const b = Array.isArray(row.board) ? row.board[0] : row.board
  return b?.name ?? '(삭제된 게시판)'
}

export default function CarouselAdminClient({
  initialSections,
  boards,
}: {
  initialSections: SectionRow[]
  boards: BoardOption[]
}) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [previewPosts, setPreviewPosts] = useState<PreviewPost[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [thumbDrafts, setThumbDrafts] = useState<Record<string, string>>({})

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.boardId) {
      setErrorMsg('섹션 제목과 게시판을 선택해주세요.')
      setStatus('error')
      return
    }
    setStatus('loading')
    const payload = {
      title: form.title,
      boardId: form.boardId,
      sortType: form.sortType,
      itemCount: form.itemCount,
      displayOrder: form.displayOrder,
    }
    const result = editingId
      ? await updateCarouselSectionAdmin(editingId, payload)
      : await createCarouselSectionAdmin(payload)

    if (!result.success) {
      setErrorMsg(result.error)
      setStatus('error')
      return
    }
    resetForm()
    setStatus('idle')
    router.refresh()
  }

  const startEdit = (row: SectionRow) => {
    setEditingId(row.id)
    setForm({
      title: row.title,
      boardId: row.board_id,
      sortType: row.sort_type === 'views' ? 'views' : 'latest',
      itemCount: row.item_count,
      displayOrder: row.display_order,
    })
    setErrorMsg('')
    setStatus('idle')
  }

  const handleToggle = async (id: string, next: boolean) => {
    await toggleCarouselSectionActiveAdmin(id, next)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 캐러셀 섹션을 완전히 삭제할까요? (되돌릴 수 없습니다)')) return
    await deleteCarouselSectionAdmin(id)
    if (expandedId === id) setExpandedId(null)
    router.refresh()
  }

  const toggleExpand = async (row: SectionRow) => {
    if (expandedId === row.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(row.id)
    setPreviewLoading(true)
    const result = await fetchCarouselPreviewPostsAdmin(row.board_id, row.sort_type === 'views' ? 'views' : 'latest', row.item_count)
    setPreviewLoading(false)
    if (result.success) {
      setPreviewPosts(result.data)
      const drafts: Record<string, string> = {}
      result.data.forEach(p => { drafts[p.id] = p.thumbnail_url ?? '' })
      setThumbDrafts(drafts)
    } else {
      setPreviewPosts([])
    }
  }

  const handleSaveThumbnail = async (postId: string) => {
    const value = thumbDrafts[postId]?.trim() || null
    await setPostThumbnailAdmin(postId, value)
    router.refresh()
  }

  return (
    <div>
      <h1>홈 캐러셀 관리</h1>
      <p style={{ fontSize: '0.84rem', color: 'var(--ink-faint)', marginTop: '-6px', marginBottom: '20px' }}>
        네이버 메인처럼 홈 화면 상단에 가로 스크롤 카드 섹션을 만듭니다. 연결한 게시판의 글이 정렬 기준(최신순/조회수순)에
        따라 자동으로 카드에 노출되고, 썸네일은 본문 첫 이미지가 기본값이며 필요하면 아래에서 직접 지정할 수 있습니다.
      </p>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px', padding: '18px', marginBottom: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>섹션 제목</label>
          <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '160px' }} placeholder="예: 핫서머 베스트" />
        </div>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>연결 게시판</label>
          <select className="input-field" value={form.boardId} onChange={e => setForm({ ...form, boardId: e.target.value })} style={{ width: '150px' }}>
            <option value="">선택</option>
            {boards.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>정렬 기준</label>
          <select className="input-field" value={form.sortType} onChange={e => setForm({ ...form, sortType: e.target.value as 'latest' | 'views' })} style={{ width: '110px' }}>
            <option value="latest">최신순</option>
            <option value="views">조회수순</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>노출 개수</label>
          <input className="input-field" type="number" min={1} max={30} value={form.itemCount} onChange={e => setForm({ ...form, itemCount: Number(e.target.value) })} style={{ width: '70px' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.76rem', color: 'var(--ink-faint)' }}>표시 순서</label>
          <input className="input-field" type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} style={{ width: '70px' }} />
        </div>
        <button onClick={handleSubmit} disabled={status === 'loading'} className="btn-primary">
          {status === 'loading' ? '저장 중...' : editingId ? '섹션 수정 저장' : '+ 섹션 추가'}
        </button>
        {editingId && (
          <button onClick={resetForm} className="admin-btn" type="button">취소</button>
        )}
      </div>
      {status === 'error' && <p style={{ color: 'var(--pin-red)', fontSize: '0.82rem', marginBottom: '14px' }}>{errorMsg}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>순서</th><th>제목</th><th>게시판</th><th>정렬</th><th>개수</th><th>상태</th><th></th>
          </tr>
        </thead>
        <tbody>
          {initialSections.map(row => (
            <>
              <tr key={row.id}>
                <td>{row.display_order}</td>
                <td>{row.title}</td>
                <td>{boardNameOf(row)}</td>
                <td>{row.sort_type === 'views' ? '조회수순' : '최신순'}</td>
                <td>{row.item_count}</td>
                <td>
                  <span className={`admin-badge ${row.is_active ? 'reviewed' : 'dismissed'}`}>{row.is_active ? '노출중' : '비활성'}</span>
                </td>
                <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button onClick={() => toggleExpand(row)} className="admin-btn primary">
                    {expandedId === row.id ? '썸네일 닫기' : '썸네일 관리'}
                  </button>
                  <button onClick={() => startEdit(row)} className="admin-btn">수정</button>
                  <button onClick={() => handleToggle(row.id, !row.is_active)} className="admin-btn primary">
                    {row.is_active ? '비활성화' : '활성화'}
                  </button>
                  <button onClick={() => handleDelete(row.id)} className="admin-btn danger">삭제</button>
                </td>
              </tr>
              {expandedId === row.id && (
                <tr>
                  <td colSpan={7} style={{ background: 'var(--bg)' }}>
                    {previewLoading ? (
                      <p style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--ink-faint)' }}>불러오는 중...</p>
                    ) : previewPosts.length === 0 ? (
                      <p style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--ink-faint)' }}>이 게시판에 아직 글이 없습니다.</p>
                    ) : (
                      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {previewPosts.map(post => {
                          const autoThumb = extractFirstImage(post.content)
                          return (
                            <div key={post.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 10px' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumbDrafts[post.id] || autoThumb || ''}
                                alt=""
                                style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', background: 'var(--bg)', border: '1px solid var(--border)', display: (thumbDrafts[post.id] || autoThumb) ? 'block' : 'none' }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--ink-faint)' }}>
                                  {autoThumb ? '본문 첫 이미지 있음' : '본문에 이미지 없음 (아이콘으로 표시됨)'}
                                </div>
                              </div>
                              <input
                                className="input-field"
                                placeholder="썸네일 이미지 URL (비우면 자동)"
                                value={thumbDrafts[post.id] ?? ''}
                                onChange={e => setThumbDrafts({ ...thumbDrafts, [post.id]: e.target.value })}
                                style={{ width: '260px' }}
                              />
                              <button onClick={() => handleSaveThumbnail(post.id)} className="admin-btn primary">저장</button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </>
          ))}
          {initialSections.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: '24px' }}>등록된 캐러셀 섹션이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
