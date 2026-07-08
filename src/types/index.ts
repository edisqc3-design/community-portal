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
  // 관리자가 캐러셀 카드용으로 수동 지정한 썸네일 (없으면 본문 첫 이미지를 자동 사용)
  thumbnail_url?: string | null
  // 조인 결과 (queries.ts에서 select 시 채워짐)
  author?: Pick<Profile, 'id' | 'nickname' | 'avatar_url'> | null
  board?: Pick<Board, 'id' | 'slug' | 'name'> | null
}

// 홈 화면 캐러셀 섹션 (네이버 메인 스타일 가로 스크롤 카드) 설정
export interface CarouselSection {
  id: string
  title: string
  board_id: string
  sort_type: 'latest' | 'views'
  item_count: number
  display_order: number
  is_active: boolean
  created_at?: string
  board?: Pick<Board, 'slug' | 'name'> | null
}

// 홈 화면에 렌더링할 캐러셀 섹션 + 실제 게시글(썸네일 확정본) 묶음
export interface CarouselSectionWithPosts extends CarouselSection {
  posts: (Post & { resolvedThumbnail: string | null })[]
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
