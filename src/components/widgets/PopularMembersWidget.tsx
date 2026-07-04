import { getPopularMembers } from '@/lib/queries'

export default async function PopularMembersWidget() {
  const members = await getPopularMembers(5)

  return (
    <div className="mod">
      <div className="mod-head">
        <b>👑 인기회원</b>
        <span className="more">더보기</span>
      </div>
      {members.length === 0 ? (
        <p style={{ padding: '16px', color: 'var(--ink-faint)', fontSize: '0.8rem' }}>아직 활동한 회원이 없습니다.</p>
      ) : (
        <ul className="member-list" style={{ paddingBottom: '6px' }}>
          {members.map((m, i) => (
            <li key={m.id}>
              <span className="rank">{i + 1}</span>
              <span className="avatar">{m.nickname.slice(0, 1)}</span>
              <span className="name">{m.nickname}</span>
              <span className="lv">Lv.{m.level}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
