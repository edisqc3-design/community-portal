'use client'

/* eslint-disable react-hooks/refs -- 이 컴포넌트의 모든 ref(.current) 접근은 useCallback으로
   감싼 이벤트 핸들러 내부에서만 실행됩니다(saveSelection/restoreSelection/exec/openImagePicker 등).
   toolbarGroups 배열이 렌더링 중에 생성되며 그 안에서 이 핸들러들을 참조하다 보니, 컴파일러가
   실제 호출 시점을 추적하지 못하고 렌더링 중 접근으로 오탐지합니다. */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Underline, Strikethrough, Link2, Unlink, Image as ImageIcon,
  Paperclip, List, ListOrdered, Quote, Heading2, Heading3, Code, Minus,
  Undo2, Redo2, Eraser, AlignLeft, AlignCenter, AlignRight, Loader2, X,
} from 'lucide-react'
import { uploadEditorImage, uploadEditorFile } from '@/lib/actions'

type FormatState = {
  bold: boolean
  italic: boolean
  underline: boolean
  strikeThrough: boolean
  insertUnorderedList: boolean
  insertOrderedList: boolean
  justifyLeft: boolean
  justifyCenter: boolean
  justifyRight: boolean
  blockquote: boolean
  h2: boolean
  h3: boolean
}

const EMPTY_FORMAT_STATE: FormatState = {
  bold: false, italic: false, underline: false, strikeThrough: false,
  insertUnorderedList: false, insertOrderedList: false,
  justifyLeft: false, justifyCenter: false, justifyRight: false,
  blockquote: false, h2: false, h3: false,
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요',
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  const [isEmpty, setIsEmpty] = useState(true)
  const [formatState, setFormatState] = useState<FormatState>(EMPTY_FORMAT_STATE)
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [uploading, setUploading] = useState<'image' | 'file' | null>(null)
  const [uploadError, setUploadError] = useState('')

  // 최초 마운트 시에만 초기 value 를 채워 넣는다 (이후에는 DOM이 소스오브트루스)
  useEffect(() => {
    if (!initialized.current && editorRef.current) {
      editorRef.current.innerHTML = value || ''
      setIsEmpty(!value || value === '<br>')
      initialized.current = true
    }
  }, [value])

  const emitChange = useCallback(() => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    const empty = html === '' || html === '<br>' || html === '<p><br></p>'
    setIsEmpty(empty)
    onChange(empty ? '' : html)
  }, [onChange])

  const saveSelection = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange()
    }
  }, [])

  const restoreSelection = useCallback(() => {
    editorRef.current?.focus()
    const sel = window.getSelection()
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges()
      sel.addRange(savedRangeRef.current)
    }
  }, [])

  const refreshFormatState = useCallback(() => {
    if (typeof document === 'undefined' || !document.queryCommandState) return
    try {
      const block = document.queryCommandValue('formatBlock')?.toLowerCase() || ''
      setFormatState({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        blockquote: block === 'blockquote',
        h2: block === 'h2',
        h3: block === 'h3',
      })
    } catch {
      // 일부 브라우저에서 queryCommandState 가 예외를 던질 수 있어 무시
    }
  }, [])

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0 || !editorRef.current) return
      if (editorRef.current.contains(sel.anchorNode)) {
        saveSelection()
        refreshFormatState()
      }
    }
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [saveSelection, refreshFormatState])

  const exec = useCallback((command: string, arg?: string) => {
    editorRef.current?.focus()
    restoreSelection()
    document.execCommand(command, false, arg)
    emitChange()
    refreshFormatState()
  }, [emitChange, refreshFormatState, restoreSelection])

  const toggleBlock = useCallback((tag: 'h2' | 'h3' | 'blockquote' | 'pre' | 'p') => {
    const current = document.queryCommandValue('formatBlock')?.toLowerCase()
    exec('formatBlock', current === tag ? 'p' : tag)
  }, [exec])

  const handleLinkButton = useCallback(() => {
    saveSelection()
    const sel = window.getSelection()
    const existingHref = sel && sel.anchorNode
      ? (sel.anchorNode.parentElement?.closest('a')?.getAttribute('href') ?? '')
      : ''
    setLinkUrl(existingHref)
    setLinkPopoverOpen(true)
  }, [saveSelection])

  const applyLink = useCallback(() => {
    const url = linkUrl.trim()
    setLinkPopoverOpen(false)
    if (!url) return
    const safeUrl = /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`
    restoreSelection()
    if (window.getSelection()?.isCollapsed) {
      document.execCommand('insertHTML', false, `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer nofollow ugc">${safeUrl}</a>`)
    } else {
      document.execCommand('createLink', false, safeUrl)
      // execCommand createLink 는 target 속성을 못 넣으므로 방금 만든 링크에 보정
      const sel = window.getSelection()
      const a = sel?.anchorNode?.parentElement?.closest('a')
      if (a) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer nofollow ugc') }
    }
    emitChange()
  }, [linkUrl, restoreSelection, emitChange])

  const removeLink = useCallback(() => {
    exec('unlink')
  }, [exec])

  const insertImageAt = useCallback((url: string, alt: string) => {
    restoreSelection()
    document.execCommand(
      'insertHTML',
      false,
      `<img src="${url}" alt="${alt.replace(/"/g, '&quot;')}" style="max-width:100%;border-radius:8px;" /><br>`
    )
    emitChange()
  }, [restoreSelection, emitChange])

  const insertAttachmentAt = useCallback((url: string, name: string, size: number) => {
    restoreSelection()
    document.execCommand(
      'insertHTML',
      false,
      `<a href="${url}" target="_blank" rel="noopener noreferrer" download="${name.replace(/"/g, '&quot;')}" class="rte-attachment">📎 ${name} (${formatBytes(size)})</a><br>`
    )
    emitChange()
  }, [restoreSelection, emitChange])

  const openImagePicker = useCallback(() => {
    saveSelection()
    imageInputRef.current?.click()
  }, [saveSelection])

  const openFilePicker = useCallback(() => {
    saveSelection()
    fileInputRef.current?.click()
  }, [saveSelection])

  const handleImagePick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError('')
    setUploading('image')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadEditorImage(formData)
      if (result.success) {
        insertImageAt(result.data.url, file.name)
      } else {
        setUploadError(result.error)
      }
    } finally {
      setUploading(null)
    }
  }, [insertImageAt])

  const handleFilePick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError('')
    setUploading('file')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadEditorFile(formData)
      if (result.success) {
        insertAttachmentAt(result.data.url, result.data.name, result.data.size)
      } else {
        setUploadError(result.error)
      }
    } finally {
      setUploading(null)
    }
  }, [insertAttachmentAt])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    // 외부 서식(워드/노션 등)이 섞여 들어오는 것을 막기 위해 일반 텍스트로만 붙여넣습니다.
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    emitChange()
  }, [emitChange])

  type ToolbarBtn = {
    key: string
    title: string
    icon: React.ReactNode
    onClick: () => void
    active?: boolean
  }

  const toolbarGroups: ToolbarBtn[][] = [
    [
      { key: 'h2', title: '제목 2', icon: <Heading2 size={17} />, onClick: () => toggleBlock('h2'), active: formatState.h2 },
      { key: 'h3', title: '제목 3', icon: <Heading3 size={17} />, onClick: () => toggleBlock('h3'), active: formatState.h3 },
    ],
    [
      { key: 'bold', title: '굵게 (Ctrl+B)', icon: <Bold size={17} />, onClick: () => exec('bold'), active: formatState.bold },
      { key: 'italic', title: '기울임 (Ctrl+I)', icon: <Italic size={17} />, onClick: () => exec('italic'), active: formatState.italic },
      { key: 'underline', title: '밑줄 (Ctrl+U)', icon: <Underline size={17} />, onClick: () => exec('underline'), active: formatState.underline },
      { key: 'strike', title: '취소선', icon: <Strikethrough size={17} />, onClick: () => exec('strikeThrough'), active: formatState.strikeThrough },
    ],
    [
      { key: 'ul', title: '글머리 기호 목록', icon: <List size={17} />, onClick: () => exec('insertUnorderedList'), active: formatState.insertUnorderedList },
      { key: 'ol', title: '번호 매기기 목록', icon: <ListOrdered size={17} />, onClick: () => exec('insertOrderedList'), active: formatState.insertOrderedList },
      { key: 'quote', title: '인용구', icon: <Quote size={17} />, onClick: () => toggleBlock('blockquote'), active: formatState.blockquote },
      { key: 'code', title: '코드 블록', icon: <Code size={17} />, onClick: () => toggleBlock('pre') },
    ],
    [
      { key: 'left', title: '왼쪽 정렬', icon: <AlignLeft size={17} />, onClick: () => exec('justifyLeft'), active: formatState.justifyLeft },
      { key: 'center', title: '가운데 정렬', icon: <AlignCenter size={17} />, onClick: () => exec('justifyCenter'), active: formatState.justifyCenter },
      { key: 'right', title: '오른쪽 정렬', icon: <AlignRight size={17} />, onClick: () => exec('justifyRight'), active: formatState.justifyRight },
    ],
    [
      { key: 'link', title: '링크 삽입', icon: <Link2 size={17} />, onClick: handleLinkButton },
      { key: 'unlink', title: '링크 제거', icon: <Unlink size={17} />, onClick: removeLink },
      { key: 'image', title: '사진 업로드', icon: uploading === 'image' ? <Loader2 size={17} className="rte-spin" /> : <ImageIcon size={17} />, onClick: openImagePicker },
      { key: 'file', title: '파일 업로드', icon: uploading === 'file' ? <Loader2 size={17} className="rte-spin" /> : <Paperclip size={17} />, onClick: openFilePicker },
    ],
    [
      { key: 'hr', title: '구분선 삽입', icon: <Minus size={17} />, onClick: () => exec('insertHorizontalRule') },
      { key: 'clear', title: '서식 지우기', icon: <Eraser size={17} />, onClick: () => exec('removeFormat') },
    ],
    [
      { key: 'undo', title: '실행 취소', icon: <Undo2 size={17} />, onClick: () => exec('undo') },
      { key: 'redo', title: '다시 실행', icon: <Redo2 size={17} />, onClick: () => exec('redo') },
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
        <div
          ref={editorRef}
          className="rte-editor editor-content"
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onPaste={handlePaste}
          onMouseUp={() => { saveSelection(); refreshFormatState() }}
          onKeyUp={() => { saveSelection(); refreshFormatState() }}
        />
        {isEmpty && <div className="rte-placeholder">{placeholder}</div>}
      </div>

      {uploadError && <div className="rte-error">{uploadError}</div>}

      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImagePick} />
      <input ref={fileInputRef} type="file" hidden onChange={handleFilePick} />
    </div>
  )
}
