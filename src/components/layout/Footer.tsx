export default function Footer() {
  return (
    <footer style={{ marginTop: '60px' }}>
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-panel)',
          padding: '32px 16px',
        }}
      >
        <span style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--brand)' }}>Community Portal</span>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
          © {new Date().getFullYear()} 모두의 게시판. 우리 동네 이야기가 모이는 곳.
        </p>
      </div>
    </footer>
  )
}
