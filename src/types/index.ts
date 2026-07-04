export interface Profile {
  id: string
  nickname: string
  avatar_url: string | null
  level: number
  points: number
  is_admin: boolean
  created_at: string
}

export interface Board {
  id: string
  slug: string
  name: string
  description: string | null
  order_num: number
  is_active: boolean
}

export interface Post {
  id: string
  board_id: string
  author_id: string | null
  title: string
  content: string
  view_count: number
  like_count: number
  comment_count: number
  is_notice: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  // 조인 결과 (queries.ts에서 select 시 채워짐)
  author?: Pick<Profile, 'id' | 'nickname' | 'avatar_url'> | null
  board?: Pick<Board, 'id' | 'slug' | 'name'> | null
}

export interface Comment {
  id: string
  post_id: string
  author_id: string | null
  content: string
  parent_id: string | null
  is_deleted: boolean
  created_at: string
  author?: Pick<Profile, 'id' | 'nickname' | 'avatar_url'> | null
}

export interface SponsorAd {
  id: string
  title: string
  image_url: string
  link_url: string
  weight: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'comment' | 'like' | 'notice' | 'reply'
  content: string
  link: string | null
  is_read: boolean
  created_at: string
}
