'use client'

import { useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link2, Unlink, Image as ImageIcon,
  Paperclip, List, ListOrdered, Quote, Heading2, Heading3, Code, Minus,
  Undo2, Redo2, Eraser, AlignLeft, AlignCenter, AlignRight, Loader2, X,
} from 'lucide-react'
import { uploadEditorImage, uploadEditorFile } from '@/lib/actions'
import { ResizableImage, AttachmentLink } from './extensions'

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요',
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [uploading, setUploading] = useState<'image' | 'file' | null>(null)
  const [uploadError, setUploadError] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    content: value || '',
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow ugc', target: '_blank' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      ResizableImage,
      AttachmentLink,
    ],
    editorProps: {
      attributes: { class: 'rte-editor editor-content' },
      // 외부 서식(워드/노션 등)이 섞여 들어오는 것을 막기 위해 일반 텍스트로만 붙여넣습니다.
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain')
        if (!text) return false
        event.preventDefault()
        const { state, dispatch } = view
        const lines = text.split(/\r?\n/)
        let tr = state.tr.deleteSelection()
        lines.forEach((line, i) => {
          if (i > 0) tr = tr.split(tr.selection.from)
          tr = tr.insertText(line)
        })
        dispatch(tr)
        return true
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? '' : editor.getHTML())
    },
  })

  const openLinkPopover = useCallback(() => {
    if (!editor) return
    setLinkUrl(editor.getAttributes('link').href || '')
    setLinkPopoverOpen(true)
  }, [editor])

  const applyLink = useCallback(() => {
    const url = linkUrl.trim()
    setLinkPopoverOpen(false)
    if (!editor || !url) return
    const safeUrl = /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(
        `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer nofollow ugc">${safeUrl}</a>`
      ).run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: safeUrl }).run()
    }
  }, [editor, linkUrl])

  const handleImagePick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editor) return
    setUploadError('')
    setUploading('image')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadEditorImage(formData)
      if (result.success) {
        editor.chain().focus().insertContent({
          type: 'resizableImage',
          attrs: { src: result.data.url, alt: file.name },
        }).run()
      } else {
        setUploadError(result.error)
      }
    } finally {
      setUploading(null)
    }
  }, [editor])

  const handleFilePick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editor) return
    setUploadError('')
    setUploading('file')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadEditorFile(formData)
      if (result.success) {
        editor.chain().focus().insertContent({
          type: 'attachmentLink',
          attrs: { href: result.data.url, name: result.data.name, size: result.data.size },
        }).run()
      } else {
        setUploadError(result.error)
      }
    } finally {
      setUploading(null)
    }
  }, [editor])

  if (!editor) return null

  type ToolbarBtn = { key: string; title: string; icon: React.ReactNode; onClick: () => void; active?: boolean }

  const toolbarGroups: ToolbarBtn[][] = [
    [
      { key: 'h2', title: '제목 2', icon: <Heading2 size={17} />, onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
      { key: 'h3', title: '제목 3', icon: <Heading3 size={17} />, onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    ],
    [
      { key: 'bold', title: '굵게 (Ctrl+B)', icon: <Bold size={17} />, onClick: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
      { key: 'italic', title: '기울임 (Ctrl+I)', icon: <Italic size={17} />, onClick: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
      { key: 'underline', title: '밑줄 (Ctrl+U)', icon: <UnderlineIcon size={17} />, onClick: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
      { key: 'strike', title: '취소선', icon: <Strikethrough size={17} />, onClick: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    ],
    [
      { key: 'ul', title: '글머리 기호 목록', icon: <List size={17} />, onClick: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
      { key: 'ol', title: '번호 매기기 목록', icon: <ListOrdered size={17} />, onClick: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
      { key: 'quote', title: '인용구', icon: <Quote size={17} />, onClick: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
      { key: 'code', title: '코드 블록', icon: <Code size={17} />, onClick: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
    ],
    [
      { key: 'left', title: '왼쪽 정렬', icon: <AlignLeft size={17} />, onClick: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }) },
      { key: 'center', title: '가운데 정렬', icon: <AlignCenter size={17} />, onClick: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }) },
      { key: 'right', title: '오른쪽 정렬', icon: <AlignRight size={17} />, onClick: () => editor.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }) },
    ],
    [
      { key: 'link', title: '링크 삽입', icon: <Link2 size={17} />, onClick: openLinkPopover, active: editor.isActive('link') },
      { key: 'unlink', title: '링크 제거', icon: <Unlink size={17} />, onClick: () => editor.chain().focus().unsetLink().run() },
      { key: 'image', title: '사진 업로드', icon: uploading === 'image' ? <Loader2 size={17} className="rte-spin" /> : <ImageIcon size={17} />, onClick: () => document.getElementById('rte-image-input')?.click() },
      { key: 'file', title: '파일 업로드', icon: uploading === 'file' ? <Loader2 size={17} className="rte-spin" /> : <Paperclip size={17} />, onClick: () => document.getElementById('rte-file-input')?.click() },
    ],
    [
      { key: 'hr', title: '구분선 삽입', icon: <Minus size={17} />, onClick: () => editor.chain().focus().setHorizontalRule().run() },
      { key: 'clear', title: '서식 지우기', icon: <Eraser size={17} />, onClick: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
    ],
    [
      { key: 'undo', title: '실행 취소', icon: <Undo2 size={17} />, onClick: () => editor.chain().focus().undo().run() },
      { key: 'redo', title: '다시 실행', icon: <Redo2 size={17} />, onClick: () => editor.chain().focus().redo().run() },
    ],
  ]

  return (
    <div className="rte-wrap">
      <div className="rte-toolbar">
        {toolbarGroups.map((group, gi) => (
          <div className="rte-group" key={gi}>
            {group.map(btn => (
              <button
                key={btn.key}
                type="button"
                title={btn.title}
                aria-label={btn.title}
                className={`rte-btn${btn.active ? ' is-active' : ''}`}
                onMouseDown={e => e.preventDefault()}
                onClick={btn.onClick}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        ))}
      </div>

      {linkPopoverOpen && (
        <div className="rte-link-popover">
          <input
            className="rte-link-input"
            type="text"
            placeholder="https://example.com"
            value={linkUrl}
            autoFocus
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink() }
              if (e.key === 'Escape') setLinkPopoverOpen(false)
            }}
          />
          <button type="button" className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.82rem' }} onClick={applyLink}>삽입</button>
          <button type="button" className="rte-icon-close" onClick={() => setLinkPopoverOpen(false)} aria-label="닫기"><X size={16} /></button>
        </div>
      )}

      <div className="rte-editor-outer">
        <EditorContent editor={editor} />
      </div>

      {uploadError && <div className="rte-error">{uploadError}</div>}

      <input id="rte-image-input" type="file" accept="image/*" hidden onChange={handleImagePick} />
      <input id="rte-file-input" type="file" hidden onChange={handleFilePick} />
    </div>
  )
}
