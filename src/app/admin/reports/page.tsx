import { getAllReportsAdmin } from '@/lib/admin-queries'
import ReportsAdminClient from './ReportsAdminClient'

export default async function AdminReportsPage() {
  const reports = await getAllReportsAdmin()
  return <ReportsAdminClient initialReports={reports} />
}
