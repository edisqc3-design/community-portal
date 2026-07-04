'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike } from '@/lib/actions'

export default function LikeButton({ postId, initialLiked, initialCount }: { postId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleLike(postId)
      if (!result.success) {
        if (result.error === '로그인이 필요합니다.') router.push('/auth/login')
        return
      }
      setLiked(result.data.liked)
      setCount(c => c + (result.data.liked ? 1 : -1))
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="btn-outline"
      style={{ borderColor: liked ? 'var(--pin-red)' : 'var(--ink)', color: liked ? 'var(--pin-red)' : 'var(--ink)' }}
    >
      {liked ? '❤' : '🤍'} 좋아요 {count}
    </button>
  )
}
