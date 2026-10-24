import { listOrdersForAdmin, getDashboardSummary } from '@/lib/admin-data'
import AdminOrdersTable from '@/components/admin-orders-table'

export default async function AdminOrdersPage() {
  const [summary, orders] = await Promise.all([getDashboardSummary(), listOrdersForAdmin(250)])

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total orders', value: summary.totalOrders },
          { label: 'Awaiting dispatch', value: summary.awaitingDispatch },
          { label: 'Awaiting delivery', value: summary.awaitingDeliveryConfirmation },
          { label: 'Review eligible', value: summary.eligibleForReview },
        ].map((item) => (
          <div key={item.label} style={{ background: '#fffdfa', border: '1px solid #eadcc1', borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#806d60', fontWeight: 700 }}>{item.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#2d2018', marginTop: 10 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <AdminOrdersTable orders={orders} />
    </div>
  )
}
