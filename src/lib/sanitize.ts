import DOMPurify from 'isomorphic-dompurify'

// 에디터에서 생성된 HTML을 저장하기 전에 항상 이 함수로 정화합니다.
// 스크립트/이벤트 핸들러/위험한 태그를 제거하여 저장형 XSS를 방지합니다.
const ALLOWED_TAGS = [
  'p', 'br', 'div', 'span',
  'h2', 'h3', 'h4',
  'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'code', 'pre', 'blockquote',
  'ul', 'ol', 'li',
  'a', 'img',
  'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel', 'style', 'class', 'download']

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    // http/https/mailto 프로토콜만 허용 (javascript: 등 차단)
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
  }).trim()
}

// 저장된 HTML에서 순수 텍스트만 추출 (메타 description, 목록 미리보기 등에 사용)
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
