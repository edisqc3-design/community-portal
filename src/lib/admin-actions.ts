'use server'

import { requireAdmin } from '@/lib/auth-actions'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

async function assertAdmin(): Promise<ActionResult | null> {
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
