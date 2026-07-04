import { getAllBoardsAdmin } from '@/lib/admin-queries'
import BoardsAdminClient from './BoardsAdminClient'

export default async function AdminBoardsPage() {
  const boards = await getAllBoardsAdmin()
  return <BoardsAdminClient initialBoards={boards} />
}
