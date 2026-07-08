import RankingWidget from '@/components/widgets/RankingWidget'
import RecentPostsList from '@/components/widgets/RecentPostsList'
import BoardPreviewCards from '@/components/widgets/BoardPreviewCards'
import RecommendThumbGrid from '@/components/widgets/RecommendThumbGrid'
import FeatureHighlights from '@/components/widgets/FeatureHighlights'
import LoginBox from '@/components/widgets/LoginBox'
import AttendanceWidget from '@/components/widgets/AttendanceWidget'
import PopularMembersWidget from '@/components/widgets/PopularMembersWidget'
import LiveCommentsWidget from '@/components/widgets/LiveCommentsWidget'
import HomeCarousel from '@/components/widgets/HomeCarousel'
import AdSlot from '@/components/ads/AdSlot'
import SponsorAdSlot from '@/components/ads/SponsorAdSlot'
import { getActiveCarouselSections } from '@/lib/queries'

export default async function HomePage() {
  const carouselSections = await getActiveCarouselSections()

  return (
    <div className="home-shell" style={{ paddingTop: '16px', paddingBottom: '48px' }}>
      <aside className="ad-rail">
        <SponsorAdSlot />
      </aside>

      <div className="container">
        <div className="home-layout">
          <div>
            <div className="banner">
              <div className="txt">
                <b>커뮤니티 오픈 이벤트 🎉</b>
                <span>회원가입만 해도 2,000 포인트 지급!</span>
              </div>
              <span className="badge">자세히 보기</span>
            </div>

            {carouselSections.length > 0 && (
              <div className="home-section">
                {carouselSections.map(section => (
                  <HomeCarousel key={section.id} section={section} />
                ))}
              </div>
            )}

            <div className="home-section">
              <div className="two-col-row">
                <RankingWidget />
                <RecentPostsList />
              </div>
            </div>

            <div className="home-section">
              <BoardPreviewCards />
            </div>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE} maxWidth={728} />

            <div className="home-section">
              <RecommendThumbGrid />
            </div>

            <FeatureHighlights />
          </div>

          <div>
            <LoginBox />
            <div style={{ marginTop: '14px' }}>
              <AttendanceWidget />
            </div>
            <div style={{ marginTop: '14px' }}>
              <PopularMembersWidget />
            </div>
            <div style={{ marginTop: '14px' }}>
              <LiveCommentsWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
