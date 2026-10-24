'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type OrderItem = {
  name?: string
  quantity?: number
  slug?: string
  image?: string
  qty?: number
  alias_name?: string
}

type Order = {
  $id: string
  order_number: string
  email: string
  name: string
  phone?: string
  date: string
  total_amount: number
  payment_status: string
  status: string
  tracking_number?: string
  items: OrderItem[]
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)
}

function slugify(value?: string) {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getReviewHref(item: OrderItem) {
  const directSlug = item.slug?.trim()
  if (directSlug) return `https://simdi.in/products/${directSlug}#reviews`

  const candidate = slugify(item.alias_name || item.name)
  if (candidate) return `https://simdi.in/products/${candidate}#reviews`

  return 'https://simdi.in/products'
}

function getImageUrl(image?: string) {
  if (!image) return 'https://simdi.in/logo.jpeg'
  if (image.startsWith('http')) return image
  if (image.startsWith('/')) return `https://simdi.in${image}`
  return `https://simdi.in/${image}`
}

export default function AdminOrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBusy, setIsBusy] = useState(false)
  const [notice, setNotice] = useState('')

  console.log(orders, 'sss')

  const selectedOrders = useMemo(
    () => orders.filter((order) => selectedIds.includes(order.$id)),
    [orders, selectedIds]
  )

  const toggleId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    setSelectedIds((prev) => (prev.length === orders.length ? [] : orders.map((order) => order.$id)))
  }

  async function sendBulkEmail(type: 'delay' | 'transit' | 'delivery') {
    if (!selectedOrders.length) {
      setNotice('Please select at least one order.')
      return
    }

    setIsBusy(true)
    setNotice('')

    try {
      const response = await fetch('/api/admin/orders/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, orders: selectedOrders }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send email.')
      }

      setNotice(`Sent ${type} emails to ${selectedOrders.length} order(s).`)
      setSelectedIds([])
      router.refresh()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to send emails.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div style={{ background: '#fffdfa', border: '1px solid #eadcc1', borderRadius: 18, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, color: '#382b1f' }}>Orders</h3>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#4b392b', fontWeight: 600 }}>
            <input type="checkbox" checked={selectedIds.length === orders.length && orders.length > 0} onChange={toggleAll} />
            Select all
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => sendBulkEmail('delay')}
            disabled={isBusy || !selectedOrders.length}
            style={{ border: 'none', borderRadius: 10, background: '#c58a38', color: '#fff', padding: '10px 14px', fontWeight: 700, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: selectedOrders.length ? 1 : 0.6 }}
          >
            Send delay email
          </button>
          <button
            type="button"
            onClick={() => sendBulkEmail('transit')}
            disabled={isBusy || !selectedOrders.length}
            style={{ border: 'none', borderRadius: 10, background: '#1d6f42', color: '#fff', padding: '10px 14px', fontWeight: 700, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: selectedOrders.length ? 1 : 0.6 }}
          >
            Send transit email
          </button>
          <button
            type="button"
            onClick={() => sendBulkEmail('delivery')}
            disabled={isBusy || !selectedOrders.length}
            style={{ border: 'none', borderRadius: 10, background: '#8b1a1a', color: '#fff', padding: '10px 14px', fontWeight: 700, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: selectedOrders.length ? 1 : 0.6 }}
          >
            Send delivery feedback
          </button>
        </div>
      </div>

      {notice ? (
        <div style={{ marginBottom: 12, background: '#ecf9f0', color: '#1f5d3d', border: '1px solid #bfe6ce', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}>
          {notice}
        </div>
      ) : null}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 1100, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4eddf', color: '#56463d', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 10px', textAlign: 'left', width: 44 }}></th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Order</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Products</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Total</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Payment</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Tracking</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.$id} style={{ borderTop: '1px solid #f0e2cb' }}>
                <td style={{ padding: '12px 10px' }}>
                  <input type="checkbox" checked={selectedIds.includes(order.$id)} onChange={() => toggleId(order.$id)} />
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <div style={{ fontWeight: 700 }}>{order.order_number}</div>
                  <div style={{ color: '#786b5d', fontSize: 12 }}>{new Date(order.date).toLocaleDateString('en-IN')}</div>
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <div style={{ fontWeight: 600 }}>{order.name}</div>
                  <div style={{ color: '#6b5647', fontSize: 12 }}>{order.email}</div>
                  <div style={{ color: '#6b5647', fontSize: 12 }}>{order.phone || 'No phone'}</div>
                </td>
                <td style={{ padding: '12px 10px', fontSize: 12, color: '#47392f' }}>
                  {(order.items || []).slice(0, 2).map((item, index) => (
                    <div key={`${order.$id}-${item.name || 'product'}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {item.image ? (
                        <img src={getImageUrl(item.image)} alt={item.name || 'Product'} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 6 }} />
                      ) : null}
                      <div>
                        <div>{item.name || 'Product'} × {item.quantity || item.qty || 1}</div>
                        <a href={getReviewHref(item)} target="_blank" rel="noreferrer" style={{ color: '#8b1a1a', textDecoration: 'none' }}>Review</a>
                      </div>
                    </div>
                  ))}
                  {(order.items || []).length > 2 && <div>+{(order.items || []).length - 2} more</div>}
                </td>
                <td style={{ padding: '12px 10px', fontWeight: 700 }}>{formatMoney(order.total_amount)}</td>
                <td style={{ padding: '12px 10px' }}>
                  <span style={{ background: '#edf3ff', color: '#355587', borderRadius: 999, padding: '5px 9px', fontSize: 12 }}>{order.payment_status}</span>
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <span style={{ background: '#f3efe7', color: '#584439', borderRadius: 999, padding: '5px 9px', fontSize: 12 }}>{order.status}</span>
                </td>
                <td style={{ padding: '12px 10px', color: '#584439', fontSize: 12 }}>{order.tracking_number || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
