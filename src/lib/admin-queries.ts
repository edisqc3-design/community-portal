import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function getAdminStats() {
  const supabase = await createClient()
  const admin = createAdminClient()
  const [posts, users, comments, pendingReports, boards] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    admin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('boards').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  return {
    postCount: posts.count ?? 0,
    userCount: users.count ?? 0,
    commentCount: comments.count ?? 0,
    pendingReportCount: pendingReports.count ?? 0,
    boardCount: boards.count ?? 0,
  }
}

export async function getAllBoardsAdmin() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('boards')
    .select('id, slug, name, description, order_num, is_active')
    .order('order_num', { ascending: true })
  return data ?? []
}

export async function getAllPostsAdmin(limit = 30) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('id, title, view_count, like_count, comment_count, is_notice, is_deleted, created_at, author:profiles!author_id(nickname), board:boards(name, slug)')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getAllReportsAdmin() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('reports')
    .select('id, target_type, target_id, reason, status, created_at, reporter:profiles!reporter_id(nickname)')
    .order('created_at', { ascending: false })
    .limit(50)
  return data ?? []
}

// ------------------------------------------------------------
// 스폰서 광고 관리
// ------------------------------------------------------------
export async function getAllSponsorAdsAdmin() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('sponsor_ads')
    .select('id, title, image_url, link_url, weight, is_active, start_date, end_date, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getAllUsersAdmin() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, nickname, level, points, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(50)
  return data ?? []
}
