'use client'

import { useEffect, useRef } from 'react'

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdSlot({
  slot,
  width = 160,
  height = 600,
  label = '광고',
}: {
  slot?: string
  width?: number
  height?: number
  label?: string
}) {
  const insRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot || pushed.current) return
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
      pushed.current = true
    } catch {
      // adsbygoogle 스크립트가 아직 로드되지 않았거나 광고 차단기가 있는 경우 조용히 무시
    }
  }, [slot])

  // AdSense 클라이언트 ID/슬롯이 설정되지 않은 경우(로컬 개발, 승인 대기 중) 자리표시자만 표시
  if (!ADSENSE_CLIENT || !slot) {
    return (
      <div
        style={{
          width, minHeight: height,
          border: '1px dashed var(--border)', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-faint)', fontSize: '0.75rem', background: 'var(--bg-panel)',
          writingMode: height > width ? 'vertical-rl' : 'horizontal-tb',
        }}
      >
        {label} {width}×{height}
      </div>
    )
  }

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: 'inline-block', width, height }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
    />
  )
}
