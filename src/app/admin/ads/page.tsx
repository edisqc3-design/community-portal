import { getAllSponsorAdsAdmin } from '@/lib/admin-queries'
import AdsAdminClient from './AdsAdminClient'

export default async function AdminAdsPage() {
  const ads = await getAllSponsorAdsAdmin()
  return <AdsAdminClient initialAds={ads} />
}
