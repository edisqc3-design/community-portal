// 캐러셀 카드 썸네일 관련 유틸.
// 서버/클라이언트 어디서든 호출 가능한 순수 함수만 둡니다 (fs, supabase 등 의존성 없음).

// 게시글 본문(HTML)에서 첫 번째 <img> 태그의 src를 추출합니다.
// 관리자가 썸네일을 직접 지정하지 않은 경우의 기본값으로 사용됩니다.
export function extractFirstImage(html: string | null | undefined): string | null {
  if (!html) return null
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match ? match[1] : null
}

// 게시글의 최종 썸네일 결정: 관리자 수동 지정 > 본문 첫 이미지 > null(폴백 아이콘 표시)
export function resolveThumbnail(post: { thumbnail_url?: string | null; content?: string | null }): string | null {
  if (post.thumbnail_url) return post.thumbnail_url
  return extractFirstImage(post.content)
}
