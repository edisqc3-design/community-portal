import { getActiveSponsorAd } from '@/lib/queries'

/**
 * 좌측 배너 — 구글 애드센스가 아니라 직접 계약한 스폰서 광고를 보여줍니다.
 * 노출 가능한 광고가 없으면(기간 만료, 비활성화, 미등록) 아무것도 렌더링하지 않습니다.
 */
export default async function SponsorAdSlot() {
  const ad = await getActiveSponsorAd()
  if (!ad) return null

  return (
    <a
      href={ad.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      style={{ display: 'block', width: '100%', maxWidth: 160 }}
      aria-label={ad.title}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ad.image_url}
        alt={ad.title}
        style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}
      />
    </a>
  )
}
