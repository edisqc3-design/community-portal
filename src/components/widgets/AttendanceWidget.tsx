import { getUser } from '@/lib/auth-actions'
import { getTodayAttendance } from '@/lib/queries'
import AttendanceButton from './AttendanceButton'

export default async function AttendanceWidget() {
  const user = await getUser()
  if (!user) return null

  const checkedToday = await getTodayAttendance(user.id)

  return (
    <div className="mod">
      <div className="mod-head"><b>📅 출석 체크</b></div>
      <div className="attendance-box">
        <p>오늘 출석하고 포인트 받아가세요!</p>
        <AttendanceButton checkedToday={checkedToday} />
      </div>
    </div>
  )
}
