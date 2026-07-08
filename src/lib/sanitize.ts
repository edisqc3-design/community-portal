import sanitizeHtmlLib from 'sanitize-html'

// 에디터에서 생성된 HTML을 저장하기 전에 항상 이 함수로 정화합니다.
// 스크립트/이벤트 핸들러/위험한 태그를 제거하여 저장형 XSS를 방지합니다.
// (jsdom 기반 isomorphic-dompurify는 Vercel 서버리스 번들에서 로딩 오류가
//  발생할 수 있어, jsdom 의존성이 없는 sanitize-html로 대체했습니다.)
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
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { '*': ALLOWED_ATTR },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
      a: ['http', 'https', 'mailto'],
    },
    allowProtocolRelative: false,
    // style 속성 중 이미지 리사이즈(width)와 정렬(text-align)만 허용
    allowedStyles: {
      '*': {
        width: [/^\d+(?:px|%)$/],
        'max-width': [/^\d+(?:px|%)$/],
        'text-align': [/^(left|center|right|justify)$/],
        'border-radius': [/^\d+(?:px|%)$/],
      },
    },
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
