import { createClient } from '@/lib/supabase-server'
import type { Board, Post, SponsorAd } from '@/types'
import { getKstDateString } from '@/lib/date-utils'

const POST_SELECT = `
  id, board_id, author_id, title, content, view_count, like_count, comment_count,
  is_notice, is_deleted, created_at, updated_at,
  author:profiles!author_id(id, nickname, avatar_url),
  board:boards(id, slug, name)
`

export async function getBoards(): Promise<Board[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('boards')
    .select('id, slug, name, description, order_num, is_active')
    .eq('is_active', true)
    .order('order_num', { ascending: true })

  if (error) {
    console.error('getBoards error:', error.message)
    return []
  }
  return data ?? []
}

export async function getBoardBySlug(slug: string): Promise<Board | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('boards')
    .select('id, slug, name, description, order_num, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}

// 메인 대시보드: 실시간 인기글 (조회수 기준, 최근 7일)
export async function getPopularPosts(limit = 6): Promise<Post[]> {
  const supabase = await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('is_deleted', false)
    .gte('created_at', sevenDaysAgo)
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getPopularPosts error:', error.message)
    return []
  }
  return (data as unknown as Post[]) ?? []
}

// 메인 대시보드: 공지사항
export async function getNoticePosts(limit = 5): Promise<Post[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('is_deleted', false)
    .eq('is_notice', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getNoticePosts error:', error.message)
    return []
  }
  return (data as unknown as Post[]) ?? []
}

// 게시판별 최신글 미리보기
export async function getBoardPreview(boardSlug: string, limit = 5): Promise<Post[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('is_deleted', false)
    .eq('board.slug', boardSlug)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getBoardPreview error:', error.message)
    return []
  }
  return (data as unknown as Post[]) ?? []
}

// 게시판 목록 페이지 (페이지네이션)
export async function getPostsByBoard(boardId: string, page = 1, pageSize = 20) {
  const supabase = await createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('posts')
    .select(POST_SELECT, { count: 'exact' })
    .eq('board_id', boardId)
    .eq('is_deleted', false)
    .order('is_notice', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getPostsByBoard error:', error.message)
    return { posts: [] as Post[], total: 0 }
  }
  return { posts: (data as unknown as Post[]) ?? [], total: count ?? 0 }
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error) return null
  return data as unknown as Post
}

// 최신글 (추천/최신 탭용)
export async function getRecentPosts(limit = 6): Promise<Post[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getRecentPosts error:', error.message)
    return []
  }
  return (data as unknown as Post[]) ?? []
}

// 인기회원 (포인트 기준)
export async function getPopularMembers(limit = 5) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url, level, points')
    .order('points', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getPopularMembers error:', error.message)
    return []
  }
  return data ?? []
}

// 실시간 댓글 (전체 게시판 최신 댓글)
export async function getRecentComments(limit = 5) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, content, created_at, author:profiles!author_id(id, nickname), post:posts(id, board:boards(slug))')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getRecentComments error:', error.message)
    return []
  }
  return data ?? []
}

// 오늘 출석체크 여부 확인
export async function getTodayAttendance(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('attendance')
    .select('id')
    .eq('user_id', userId)
    .eq('checked_date', getKstDateString())
    .maybeSingle()
  return !!data
}

// 알림 목록 (최신순)
export async function getNotifications(userId: string, limit = 20) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, content, link, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getNotifications error:', error.message)
    return []
  }
  return data ?? []
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  return count ?? 0
}

// 쪽지함 (받은 쪽지 + 보낸 쪽지 통합, 최신순)
export async function getMessages(userId: string, limit = 30) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, content, is_read, created_at, sender:profiles!messages_sender_id_fkey(nickname), receiver:profiles!messages_receiver_id_fkey(nickname)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getMessages error:', error.message)
    return []
  }
  return data ?? []
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)
  return count ?? 0
}

// 통합검색 (제목+본문 tsvector)
export async function searchPosts(query: string, limit = 20): Promise<Post[]> {
  if (!query.trim()) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('is_deleted', false)
    .textSearch('search_vector', query, { type: 'websearch', config: 'simple' })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('searchPosts error:', error.message)
    return []
  }
  return (data as unknown as Post[]) ?? []
}

// ------------------------------------------------------------
// 스폰서 광고 (좌측 배너) — 애드센스가 아닌 직접 계약 광고
// 노출 조건: is_active=true + (시작일 지났거나 없음) + (종료일 안 지났거나 없음)
// 여러 개가 조건을 만족하면 weight(노출 가중치)를 반영한 랜덤으로 1개 선택
// ------------------------------------------------------------
export async function getActiveSponsorAd(): Promise<SponsorAd | null> {
  const supabase = await createClient()
  const today = getKstDateString()

  const { data, error } = await supabase
    .from('sponsor_ads')
    .select('id, title, image_url, link_url, weight, is_active, start_date, end_date, created_at')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)

  if (error) {
    console.error('getActiveSponsorAd error:', error.message)
    return null
  }
  const candidates = (data as SponsorAd[]) ?? []
  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]

  const totalWeight = candidates.reduce((sum, ad) => sum + Math.max(ad.weight, 1), 0)
  let roll = Math.random() * totalWeight
  for (const ad of candidates) {
    roll -= Math.max(ad.weight, 1)
    if (roll <= 0) return ad
  }
  return candidates[candidates.length - 1]
}
