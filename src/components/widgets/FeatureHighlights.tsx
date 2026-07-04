const FEATURES = [
  { ic: '🔍', title: '빠른 검색', desc: '통합 검색으로 원하는 정보를 빠르게 찾아보세요.' },
  { ic: '💬', title: '실시간 소통', desc: '실시간 댓글과 알림으로 커뮤니티 활동을 즐겨보세요.' },
  { ic: '📚', title: '다양한 주제', desc: '여러 분야의 게시판에서 다양한 정보를 얻으세요.' },
  { ic: '🛡️', title: '안전한 커뮤니티', desc: '신고 및 차단 기능으로 건강한 커뮤니티를 만듭니다.' },
]

export default function FeatureHighlights() {
  return (
    <div className="feature-bar">
      {FEATURES.map(f => (
        <div key={f.title} className="feature-item">
          <span className="ic">{f.ic}</span>
          <div>
            <b>{f.title}</b>
            <span>{f.desc}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
