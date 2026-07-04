'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleBookmark } from '@/lib/actions'

export default function BookmarkButton({ postId, initialBookmarked }: { postId: string; initialBookmarked: boolean }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleBookmark(postId)
      if (!result.success) {
        if (result.error === '로그인이 필요합니다.') router.push('/auth/login')
        return
      }
      setBookmarked(result.data.bookmarked)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="btn-outline"
      style={{ borderColor: bookmarked ? 'var(--brand)' : 'var(--ink)', color: bookmarked ? 'var(--brand)' : 'var(--ink)' }}
    >
      {bookmarked ? '🔖 저장됨' : '📑 저장'}
    </button>
  )
}
