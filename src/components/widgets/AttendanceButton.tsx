'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { checkAttendance } from '@/lib/actions'

export default function AttendanceButton({ checkedToday }: { checkedToday: boolean }) {
  const [done, setDone] = useState(checkedToday)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = () => {
    if (done) return
    startTransition(async () => {
      const result = await checkAttendance()
      if (result.success) {
        setDone(true)
        router.refresh()
      }
    })
  }

  return (
    <button onClick={handleClick} disabled={done || isPending} className={`btn ${done ? 'done' : 'todo'}`}>
      {done ? '✅ 출석 완료' : isPending ? '처리 중...' : '출석하기'}
    </button>
  )
}
