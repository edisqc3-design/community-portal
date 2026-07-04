const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function CalendarWidget() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="mod">
      <div className="mod-head"><b>캘린더</b></div>
      <div className="cal-head">
        <b>{month + 1}.{today}</b>
        <span style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>{WEEKDAYS[now.getDay()]}요일</span>
      </div>
      <div className="cal-grid">
        {WEEKDAYS.map(w => <span key={w}>{w}</span>)}
        {cells.map((day, i) =>
          day === null
            ? <span key={`pad-${i}`} className="pad">·</span>
            : <span key={day} className={day === today ? 'today' : ''}>{day}</span>
        )}
      </div>
    </div>
  )
}
