'use client'

import { useEffect, useRef, useState } from 'react'

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

/**
 * 일반(반응형) 디스플레이 광고 영역.
 * - 고정 크기(예: 160x600) 대신 AdSense가 자동으로 크기를 잡는 반응형 광고 단위를 사용합니다.
 * - 슬롯이 설정되지 않았거나(개발 환경 등) 실제로 채워지는 광고가 없으면(공백/미체결) 자동으로 숨김 처리됩니다.
 * - 광고가 실제로 채워지면(data-ad-status="filled") 그때만 화면에 표시합니다.
 */
export default function AdSlot({
  slot,
  className,
  maxWidth = 300,
}: {
  slot?: string
  className?: string
  maxWidth?: number
}) {
  const insRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)
  const [status, setStatus] = useState<'pending' | 'filled' | 'unfilled'>('pending')

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return

    const el = insRef.current
    if (!el) return

    // Google이 광고를 채운 뒤 <ins> 태그에 data-ad-status="filled" 또는 "unfilled"를 세팅합니다.
    // 이 속성 변화를 감지해서 실제로 광고가 채워졌을 때만 보여줍니다.
    const observer = new MutationObserver(() => {
      const adStatus = el.getAttribute('data-ad-status')
      if (adStatus === 'filled') setStatus('filled')
      else if (adStatus === 'unfilled') setStatus('unfilled')
    })
    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] })

    if (!pushed.current) {
      try {
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
        pushed.current = true
      } catch {
        // adsbygoogle 스크립트가 아직 로드되지 않았거나 광고 차단기가 있는 경우 조용히 무시
        setStatus('unfilled')
      }
    }

    return () => observer.disconnect()
  }, [slot])

  // 클라이언트/슬롯 미설정(로컬 개발, 승인 대기 중) 또는 미체결 광고는 아무것도 렌더링하지 않음
  if (!ADSENSE_CLIENT || !slot || status === 'unfilled') {
    return null
  }

  return (
    <div
      className={className}
      style={{ width: '100%', maxWidth, margin: '0 auto', display: status === 'filled' ? 'block' : 'none' }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
