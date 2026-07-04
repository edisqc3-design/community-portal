// 게시판 slug별 아이콘/색상 매핑. 새 게시판이 추가되면 fallback(순환 색상 + 기본 이모지)이 적용됩니다.

const ICON_BY_SLUG: Record<string, string> = {
  notice: '📌',
  free: '💬',
  question: '❓',
  info: 'ℹ️',
  review: '⭐',
  news: '📰',
  game: '🎮',
  humor: '😂',
  hotdeal: '🏷️',
  travel: '✈️',
  food: '🍜',
  living: '🛋️',
  health: '💪',
  lotto: '🎱',
}

const COLOR_BY_SLUG: Record<string, string> = {
  notice: '#ee4a3f',
  free: '#1fae67',
  question: '#2f6fe0',
  info: '#0891b2',
  review: '#d9a233',
  news: '#ee7a3f',
  game: '#a05ce0',
  humor: '#e0475c',
  hotdeal: '#dc2626',
  travel: '#2fa7c9',
  food: '#c2410c',
  living: '#0d9488',
  health: '#16a34a',
  lotto: '#7a5cf0',
}

const COLOR_CYCLE = ['#3a7bf0', '#1fae67', '#ee7a3f', '#a05ce0', '#e0475c', '#2fa7c9', '#7a8a9a', '#c9a13a']

export function boardIcon(slug: string): string {
  return ICON_BY_SLUG[slug] ?? '📋'
}

export function boardColor(index: number): string {
  return COLOR_CYCLE[index % COLOR_CYCLE.length]
}

// slug가 고정된 게시판은 항상 같은 색(리스트 인덱스와 무관)이 필요할 때 사용 — 최신글 목록의 배지 등
export function boardBadgeColor(slug: string, fallbackIndex = 0): string {
  return COLOR_BY_SLUG[slug] ?? COLOR_CYCLE[fallbackIndex % COLOR_CYCLE.length]
}
