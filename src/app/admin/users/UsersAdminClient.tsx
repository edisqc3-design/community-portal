'use client'

import { useRouter } from 'next/navigation'
import { toggleAdminRoleAdmin } from '@/lib/admin-actions'

interface UserRow {
  id: string
  nickname: string
  level: number
  points: number
  is_admin: boolean
  created_at: string
}

export default function UsersAdminClient({ initialUsers }: { initialUsers: UserRow[] }) {
  const router = useRouter()

  const handleToggle = async (id: string, current: boolean) => {
    const label = current ? '관리자 권한을 해제할까요?' : '관리자 권한을 부여할까요?'
    if (!confirm(label)) return
    await toggleAdminRoleAdmin(id, !current)
    router.refresh()
  }

  return (
    <div>
      <h1>회원 관리</h1>
      <table className="admin-table">
        <thead><tr><th>닉네임</th><th>레벨</th><th>포인트</th><th>가입일</th><th>권한</th><th></th></tr></thead>
        <tbody>
          {initialUsers.map(u => (
            <tr key={u.id}>
              <td>{u.nickname}</td>
              <td>Lv.{u.level}</td>
              <td>{u.points.toLocaleString()}P</td>
              <td>{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
              <td><span className={`admin-badge ${u.is_admin ? 'reviewed' : 'dismissed'}`}>{u.is_admin ? '관리자' : '일반회원'}</span></td>
              <td>
                <button onClick={() => handleToggle(u.id, u.is_admin)} className={`admin-btn ${u.is_admin ? 'danger' : 'primary'}`}>
                  {u.is_admin ? '권한 해제' : '관리자 지정'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
