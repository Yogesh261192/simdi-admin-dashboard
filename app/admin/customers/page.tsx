import { listCustomersForAdmin } from '@/lib/admin-data'
import AdminCustomersTable from '@/components/admin-customers-table'

export default async function AdminCustomersPage() {
  const customers = await listCustomersForAdmin(250)

  return (
    <div>
      <AdminCustomersTable customers={customers} />
    </div>
  )
}
