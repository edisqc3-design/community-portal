import { getBoards } from '@/lib/queries'
import BoardNavTabsClient from './BoardNavTabsClient'

// 상단 탭바에서는 노출하지 않을 게시판 (다른 메뉴에는 계속 노출됨)
const HIDDEN_IN_TABBAR = ['공지사항', '자유게시판', '질문게시판', '정보게시판', '리뷰게시판']

export default async function BoardNavTabs() {
  const boards = await getBoards()
  const visibleBoards = boards.filter(b => !HIDDEN_IN_TABBAR.includes(b.name))
  return <BoardNavTabsClient boards={visibleBoards} />
}
