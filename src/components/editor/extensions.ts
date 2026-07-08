import { Node, mergeAttributes } from '@tiptap/core'

/**
 * ResizableImage
 * - 이미지 노드. 선택 시 우측 하단 핸들을 드래그하여 폭을 조절할 수 있습니다.
 * - 저장 시에는 <img style="width:...px" ...> 형태로 직렬화되며,
 *   width 스타일은 src/lib/sanitize.ts 의 ALLOWED_ATTR('style')을 통과합니다.
 */
export const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: false,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null }, // 예: "320px"
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (el) => {
          const element = el as HTMLElement
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            title: element.getAttribute('title'),
            width: element.style.width || null,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { width, ...rest } = HTMLAttributes
    const style = [
      width ? `width:${width}` : null,
      'max-width:100%',
      'border-radius:8px',
    ].filter(Boolean).join(';')
    return ['img', mergeAttributes(rest, { style })]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const wrap = document.createElement('span')
      wrap.className = 'rte-img-wrap'

      const img = document.createElement('img')
      img.src = node.attrs.src
      if (node.attrs.alt) img.alt = node.attrs.alt
      if (node.attrs.title) img.title = node.attrs.title
      img.draggable = false
      if (node.attrs.width) img.style.width = node.attrs.width
      wrap.appendChild(img)

      const handle = document.createElement('span')
      handle.className = 'rte-img-resize-handle'
      handle.contentEditable = 'false'
      wrap.appendChild(handle)

      let startX = 0
      let startWidth = 0

      const onPointerMove = (e: PointerEvent) => {
        const dx = e.clientX - startX
        const parentWidth = wrap.parentElement?.clientWidth || 640
        const newWidth = Math.max(60, Math.min(startWidth + dx, parentWidth))
        img.style.width = `${newWidth}px`
      }

      const commitWidth = () => {
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerup', commitWidth)
        if (typeof getPos === 'function') {
          const pos = getPos()
          if (typeof pos === 'number') {
            editor.view.dispatch(
              editor.view.state.tr.setNodeAttribute(pos, 'width', img.style.width)
            )
          }
        }
      }

      handle.addEventListener('pointerdown', (e) => {
        e.preventDefault()
        e.stopPropagation()
        startX = e.clientX
        startWidth = img.getBoundingClientRect().width
        document.addEventListener('pointermove', onPointerMove)
        document.addEventListener('pointerup', commitWidth)
      })
      handle.addEventListener('mousedown', (e) => e.stopPropagation())

      return {
        dom: wrap,
        update: (updatedNode) => {
          if (updatedNode.type.name !== node.type.name) return false
          node = updatedNode
          img.src = node.attrs.src
          img.alt = node.attrs.alt || ''
          if (node.attrs.title) img.title = node.attrs.title
          if (node.attrs.width) img.style.width = node.attrs.width
          return true
        },
        selectNode: () => wrap.classList.add('is-selected'),
        deselectNode: () => wrap.classList.remove('is-selected'),
        stopEvent: (event) => event.target === handle,
      }
    }
  },
})

/**
 * AttachmentLink
 * - 업로드한 첨부파일을 나타내는 다운로드 링크 칩(atom 노드).
 */
export const AttachmentLink = Node.create({
  name: 'attachmentLink',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      href: { default: null },
      name: { default: '' },
      size: { default: 0 },
    }
  },

  parseHTML() {
    return [{ tag: 'a.rte-attachment[href]' }]
  },

  renderHTML({ node }) {
    const { href, name, size } = node.attrs
    return [
      'a',
      mergeAttributes({
        href,
        class: 'rte-attachment',
        target: '_blank',
        rel: 'noopener noreferrer',
        download: name,
      }),
      `📎 ${name} (${formatBytes(size)})`,
    ]
  },
})

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
