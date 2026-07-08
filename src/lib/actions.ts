'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { getKstDateString } from '@/lib/date-utils'
import { sanitizeHtml } from '@/lib/sanitize'

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

// 게시글/댓글 작성은 반드시 이 서버 액션(쿠키 세션 기반 인증 클라이언트)을 통해서만 수행합니다.
// posts_insert_own / comments_insert_own RLS 정책이 auth.uid() = author_id 를 검사하므로,
// 클라이언트에서 anon key로 직접 insert하면 세션이 없어 실패하거나 다른 사람 글로 오작동할 수 있습니다.

export async function createPost(payload: {
  boardId: string
  title: string
  content: string
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const plainContent = payload.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
  if (!payload.title.trim() || (!plainContent && !/<img[\s>]/i.test(payload.content))) {
    return { success: false, error: '제목과 내용을 입력해 주세요.' }
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      board_id: payload.boardId,
      author_id: user.id,
      title: payload.title.trim(),
      content: sanitizeHtml(payload.content),
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true, data }
}

export async function updatePost(
  id: string,
  payload: { title: string; content: string }
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('posts')
    .update({ title: payload.title.trim(), content: sanitizeHtml(payload.content) })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function deletePost(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('posts').update({ is_deleted: true }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true, data: undefined }
}

export async function incrementViewCount(id: string): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc('increment_view_count', { post_id: id }).then(
    () => {},
    // RPC가 아직 없을 수 있으므로 폴백으로 직접 갱신
    async () => {
      const { data } = await supabase.from('posts').select('view_count').eq('id', id).single()
      if (data) {
        await supabase.from('posts').update({ view_count: data.view_count + 1 }).eq('id', id)
      }
    }
  )
}

export async function createComment(payload: {
  postId: string
  content: string
  parentId?: string
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }
  if (!payload.content.trim()) return { success: false, error: '댓글 내용을 입력해 주세요.' }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: payload.postId,
      author_id: user.id,
      content: payload.content.trim(),
      parent_id: payload.parentId ?? null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath(`/board`)
  return { success: true, data }
}

export async function deleteComment(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('comments').update({ is_deleted: true }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath(`/board`)
  return { success: true, data: undefined }
}

export async function toggleLike(postId: string): Promise<ActionResult<{ liked: boolean }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const { data: existing } = await supabase
    .from('post_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
    if (error) return { success: false, error: error.message }
    return { success: true, data: { liked: false } }
  }

  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
  if (error) return { success: false, error: error.message }
  return { success: true, data: { liked: true } }
}

export async function toggleBookmark(postId: string): Promise<ActionResult<{ bookmarked: boolean }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const { data: existing } = await supabase
    .from('post_bookmarks')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('post_bookmarks')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
    if (error) return { success: false, error: error.message }
    return { success: true, data: { bookmarked: false } }
  }

  const { error } = await supabase.from('post_bookmarks').insert({ post_id: postId, user_id: user.id })
  if (error) return { success: false, error: error.message }
  return { success: true, data: { bookmarked: true } }
}

export async function checkAttendance(): Promise<ActionResult<{ points: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const today = getKstDateString()
  const { error } = await supabase.from('attendance').insert({ user_id: user.id, checked_date: today, points_earned: 10 })

  if (error) {
    if (error.code === '23505') return { success: false, error: '오늘은 이미 출석체크를 완료했어요.' }
    return { success: false, error: error.message }
  }
  revalidatePath('/')
  return { success: true, data: { points: 10 } }
}

export async function createReport(payload: {
  targetType: 'post' | 'comment'
  targetId: string
  reason: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }
  if (!payload.reason.trim()) return { success: false, error: '신고 사유를 선택해 주세요.' }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: payload.targetType,
    target_id: payload.targetId,
    reason: payload.reason,
  })

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
  if (error) return { success: false, error: error.message }
  revalidatePath('/mypage/notifications')
  return { success: true, data: undefined }
}

export async function sendMessage(payload: { receiverNickname: string; content: string }): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }
  if (!payload.content.trim()) return { success: false, error: '내용을 입력해 주세요.' }

  // nickname은 profiles 테이블에서 unique 제약이 걸려있어 항상 유일한 회원을 찾습니다.
  const { data: receiver } = await supabase
    .from('profiles')
    .select('id')
    .eq('nickname', payload.receiverNickname.trim())
    .maybeSingle()

  if (!receiver) return { success: false, error: '해당 닉네임의 회원을 찾을 수 없습니다.' }
  if (receiver.id === user.id) return { success: false, error: '자신에게는 쪽지를 보낼 수 없습니다.' }

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiver.id,
    content: payload.content.trim(),
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/mypage/messages')
  return { success: true, data: undefined }
}

export async function markMessageRead(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

// ------------------------------------------------------------
// 에디터 첨부(이미지/파일) 업로드
// 로그인한 사용자만 업로드할 수 있으며, RLS 정책과 무관하게 동작하도록
// service_role 기반 admin 클라이언트로 스토리지에 업로드합니다.
// ------------------------------------------------------------
const EDITOR_IMAGE_BUCKET = 'post-images'
const EDITOR_FILE_BUCKET = 'post-attachments'
const MAX_IMAGE_SIZE = 8 * 1024 * 1024 // 8MB
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

function safeFileName(name: string) {
  const ext = (name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
}

export async function uploadEditorImage(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: '로그인이 필요합니다.' }

    const file = formData.get('file')
    if (!(file instanceof File)) return { success: false, error: '파일이 없습니다.' }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { success: false, error: '지원하지 않는 이미지 형식입니다. (jpg, png, gif, webp, svg)' }
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return { success: false, error: '이미지 용량은 8MB를 초과할 수 없습니다.' }
    }

    const admin = createAdminClient()
    const path = `${user.id}/${safeFileName(file.name)}`
    const { error: uploadError } = await admin.storage
      .from(EDITOR_IMAGE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) return { success: false, error: `이미지 업로드 실패: ${uploadError.message}` }

    const { data } = admin.storage.from(EDITOR_IMAGE_BUCKET).getPublicUrl(path)
    return { success: true, data: { url: data.publicUrl } }
  } catch (err) {
    console.error('uploadEditorImage error:', err)
    return { success: false, error: `서버 오류: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export async function uploadEditorFile(
  formData: FormData
): Promise<ActionResult<{ url: string; name: string; size: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: '로그인이 필요합니다.' }

    const file = formData.get('file')
    if (!(file instanceof File)) return { success: false, error: '파일이 없습니다.' }
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: '파일 용량은 20MB를 초과할 수 없습니다.' }
    }

    const admin = createAdminClient()
    const path = `${user.id}/${safeFileName(file.name)}`
    const { error: uploadError } = await admin.storage
      .from(EDITOR_FILE_BUCKET)
      .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false })
    if (uploadError) return { success: false, error: `파일 업로드 실패: ${uploadError.message}` }

    const { data } = admin.storage.from(EDITOR_FILE_BUCKET).getPublicUrl(path)
    return { success: true, data: { url: data.publicUrl, name: file.name, size: file.size } }
  } catch (err) {
    console.error('uploadEditorFile error:', err)
    return { success: false, error: `서버 오류: ${err instanceof Error ? err.message : String(err)}` }
  }
}
