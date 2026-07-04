export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: '60px', padding: '32px 0', background: 'var(--bg-panel)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--brand)' }}>Community Portal</span>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
          © {new Date().getFullYear()} 모두의 게시판. 우리 동네 이야기가 모이는 곳.
        </p>
      </div>
    </footer>
  )
}
