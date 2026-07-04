import { getBoards } from '@/lib/queries'
import BoardNavTabsClient from './BoardNavTabsClient'

export default async function BoardNavTabs() {
  const boards = await getBoards()
  return <BoardNavTabsClient boards={boards} />
}
