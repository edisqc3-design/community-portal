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
