import RankingWidget from '@/components/widgets/RankingWidget'
import RecentPostsList from '@/components/widgets/RecentPostsList'
import BoardPreviewCards from '@/components/widgets/BoardPreviewCards'
import RecommendThumbGrid from '@/components/widgets/RecommendThumbGrid'
import FeatureHighlights from '@/components/widgets/FeatureHighlights'
import LoginBox from '@/components/widgets/LoginBox'
import AttendanceWidget from '@/components/widgets/AttendanceWidget'
import PopularMembersWidget from '@/components/widgets/PopularMembersWidget'
import LiveCommentsWidget from '@/components/widgets/LiveCommentsWidget'
import AdSlot from '@/components/ads/AdSlot'

export default function HomePage() {
  return (
    <div className="home-shell" style={{ paddingTop: '16px', paddingBottom: '48px' }}>
      <aside className="ad-rail">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT} width={160} height={600} label="광고" />
      </aside>

      <div className="container">
        <div className="banner">
          <div className="txt">
            <b>커뮤니티 오픈 이벤트 🎉</b>
            <span>회원가입만 해도 2,000 포인트 지급!</span>
          </div>
          <span className="badge">자세히 보기</span>
        </div>

        <div className="home-layout">
          <div>
            <div className="two-col-row">
              <RankingWidget />
              <RecentPostsList />
            </div>

            <div style={{ marginTop: '16px' }}>
              <BoardPreviewCards />
            </div>

            <div className="ad-banner-wrap">
              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE} width={728} height={90} label="Google AdSense 광고 영역" />
            </div>

            <RecommendThumbGrid />

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

      <aside className="ad-rail">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RIGHT} width={160} height={600} label="광고" />
      </aside>
    </div>
  )
}
