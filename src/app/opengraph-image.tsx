import { ImageResponse } from 'next/og'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/site-config'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #e9f8f0 0%, #ffffff 60%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            background: '#1fae67',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontWeight: 900,
            marginBottom: 32,
          }}
        >
          C
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, color: '#1c1e21' }}>{SITE_NAME}</div>
        <div style={{ fontSize: 28, color: '#4c5157', marginTop: 16, maxWidth: 800, textAlign: 'center' }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    { ...size }
  )
}
