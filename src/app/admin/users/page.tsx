import { getAllUsersAdmin } from '@/lib/admin-queries'
import UsersAdminClient from './UsersAdminClient'

export default async function AdminUsersPage() {
  const users = await getAllUsersAdmin()
  return <UsersAdminClient initialUsers={users} />
}
