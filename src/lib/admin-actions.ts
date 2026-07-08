'use server'

import { requireAdmin } from '@/lib/auth-actions'
import { createAdminClient } from '@/lib/supabase-admin'
import { getCarouselSectionPostsAdmin } from '@/lib/admin-queries'
import { revalidatePath } from 'next/cache'

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

async function assertAdmin(): Promise<{ success: false; error: string } | null> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: '관리자만 이용할 수 있습니다.' }
  return null
}

// ------------------------------------------------------------
// 게시판 관리
// ------------------------------------------------------------
export async function createBoardAdmin(payload: { slug: string; name: string; description?: string; orderNum: number }): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('boards').insert({
    slug: payload.slug.trim(),
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
    order_num: payload.orderNum,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/boards')
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function deleteBoardAdmin(id: string): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('boards').update({ is_active: false }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/boards')
  revalidatePath('/')
  return { success: true, data: undefined }
}

// ------------------------------------------------------------
// 게시글 강제 삭제 (신고 처리 등)
// ------------------------------------------------------------
export async function deletePostAdmin(id: string): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('posts').update({ is_deleted: true }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/posts')
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function setPostNoticeAdmin(id: string, isNotice: boolean): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('posts').update({ is_notice: isNotice }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/posts')
  revalidatePath('/')
  return { success: true, data: undefined }
}

// ------------------------------------------------------------
// 신고 처리
// ------------------------------------------------------------
export async function updateReportStatusAdmin(id: string, status: 'reviewed' | 'dismissed'): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('reports').update({ status }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/reports')
  return { success: true, data: undefined }
}

// ------------------------------------------------------------
// 스폰서 광고 관리 (좌측 배너 — 애드센스 아닌 직접 계약 광고)
// ------------------------------------------------------------
const SPONSOR_BUCKET = 'sponsor-ads'

export async function createSponsorAdAdmin(formData: FormData): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const title = String(formData.get('title') ?? '').trim()
  const linkUrl = String(formData.get('link_url') ?? '').trim()
  const weight = Number(formData.get('weight') ?? 1) || 1
  const startDate = String(formData.get('start_date') ?? '').trim() || null
  const endDate = String(formData.get('end_date') ?? '').trim() || null
  const file = formData.get('image') as File | null

  if (!title || !linkUrl) return { success: false, error: '제목과 링크는 필수입니다.' }
  if (!file || file.size === 0) return { success: false, error: '배너 이미지를 선택해주세요.' }

  const admin = createAdminClient()

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error: uploadError } = await admin.storage
    .from(SPONSOR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) return { success: false, error: `이미지 업로드 실패: ${uploadError.message}` }

  const { data: publicUrlData } = admin.storage.from(SPONSOR_BUCKET).getPublicUrl(path)

  const { error } = await admin.from('sponsor_ads').insert({
    title,
    link_url: linkUrl,
    image_url: publicUrlData.publicUrl,
    weight,
    start_date: startDate,
    end_date: endDate,
    is_active: true,
  })
  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/ads')
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function toggleSponsorAdActiveAdmin(id: string, isActive: boolean): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('sponsor_ads').update({ is_active: isActive }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/ads')
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function deleteSponsorAdAdmin(id: string): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('sponsor_ads').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/ads')
  revalidatePath('/')
  return { success: true, data: undefined }
}

// ------------------------------------------------------------
// 홈 캐러셀 관리 (네이버 메인 스타일 가로 스크롤 카드 섹션)
// ------------------------------------------------------------
type CarouselSectionPayload = {
  title: string
  boardId: string
  sortType: 'latest' | 'views'
  itemCount: number
  displayOrder: number
}

export async function createCarouselSectionAdmin(payload: CarouselSectionPayload): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  if (!payload.title.trim() || !payload.boardId) return { success: false, error: '제목과 게시판은 필수입니다.' }

  const admin = createAdminClient()
  const { error } = await admin.from('carousel_sections').insert({
    title: payload.title.trim(),
    board_id: payload.boardId,
    sort_type: payload.sortType,
    item_count: payload.itemCount,
    display_order: payload.displayOrder,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/carousel')
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function updateCarouselSectionAdmin(id: string, payload: CarouselSectionPayload): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  if (!payload.title.trim() || !payload.boardId) return { success: false, error: '제목과 게시판은 필수입니다.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('carousel_sections')
    .update({
      title: payload.title.trim(),
      board_id: payload.boardId,
      sort_type: payload.sortType,
      item_count: payload.itemCount,
      display_order: payload.displayOrder,
    })
    .eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/carousel')
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function toggleCarouselSectionActiveAdmin(id: string, isActive: boolean): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('carousel_sections').update({ is_active: isActive }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/carousel')
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function deleteCarouselSectionAdmin(id: string): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('carousel_sections').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/carousel')
  revalidatePath('/')
  return { success: true, data: undefined }
}

// 캐러셀 카드 썸네일 수동 지정 (비우면 본문 첫 이미지로 자동 복귀)
export async function setPostThumbnailAdmin(postId: string, thumbnailUrl: string | null): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('posts').update({ thumbnail_url: thumbnailUrl }).eq('id', postId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/carousel')
  revalidatePath('/')
  return { success: true, data: undefined }
}

// 특정 섹션이 실제로 노출할 게시글 미리보기 (클라이언트 컴포넌트에서 호출하기 위한 서버 액션 래퍼)
export async function fetchCarouselPreviewPostsAdmin(
  boardId: string,
  sortType: 'latest' | 'views',
  limit: number
): Promise<{ success: true; data: Awaited<ReturnType<typeof getCarouselSectionPostsAdmin>> } | { success: false; error: string }> {
  const denied = await assertAdmin()
  if (denied) return { success: false, error: denied.error }

  const posts = await getCarouselSectionPostsAdmin(boardId, sortType, limit)
  return { success: true, data: posts }
}

// ------------------------------------------------------------
// 회원 관리
// ------------------------------------------------------------
export async function toggleAdminRoleAdmin(userId: string, isAdmin: boolean): Promise<ActionResult> {
  const denied = await assertAdmin()
  if (denied) return denied

  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update({ is_admin: isAdmin }).eq('id', userId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/users')
  return { success: true, data: undefined }
}
