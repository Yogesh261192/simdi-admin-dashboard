'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Customer = {
  $id: string
  name: string
  email: string
  phone?: string
  registrationDate: string
}

export default function AdminCustomersTable({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [notice, setNotice] = useState('')

  const selectedCustomers = useMemo(
    () => customers.filter((customer) => selectedIds.includes(customer.$id)),
    [customers, selectedIds]
  )

  const toggleId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    setSelectedIds((prev) => (prev.length === customers.length ? [] : customers.map((customer) => customer.$id)))
  }

  async function sendPromoEmails() {
    if (!selectedCustomers.length) {
      setNotice('Please select at least one customer.')
      return
    }

    setIsSending(true)
    setNotice('')

    try {
      const response = await fetch('/api/admin/customers/send-promo-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customers: selectedCustomers }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send promo emails.')
      }

      setNotice(`Promo email sent to ${selectedCustomers.length} customer(s).`)
      setSelectedIds([])
      setIsModalOpen(false)
      router.refresh()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to send promo emails.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div style={{ background: '#fffdfa', border: '1px solid #eadcc1', borderRadius: 18, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, color: '#382b1f' }}>Customers</h3>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#4b392b', fontWeight: 600 }}>
            <input type="checkbox" checked={selectedIds.length === customers.length && customers.length > 0} onChange={toggleAll} />
            Select all
          </label>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={!selectedCustomers.length}
          style={{ border: 'none', borderRadius: 10, background: '#1d6f42', color: '#fff', padding: '10px 14px', fontWeight: 700, cursor: !selectedCustomers.length ? 'not-allowed' : 'pointer', opacity: selectedCustomers.length ? 1 : 0.6 }}
        >
          Send promotional email
        </button>
      </div>

      {notice ? (
        <div style={{ marginBottom: 12, background: '#ecf9f0', color: '#1f5d3d', border: '1px solid #bfe6ce', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}>
          {notice}
        </div>
      ) : null}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f4eddf', color: '#56463d', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 10px', textAlign: 'left', width: 44 }}></th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Registered</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.$id} style={{ borderTop: '1px solid #f0e2cb' }}>
                <td style={{ padding: '12px 10px' }}>
                  <input type="checkbox" checked={selectedIds.includes(customer.$id)} onChange={() => toggleId(customer.$id)} />
                </td>
                <td style={{ padding: '12px 10px', fontWeight: 700 }}>{customer.name}</td>
                <td style={{ padding: '12px 10px', color: '#544539' }}>{customer.email}</td>
                <td style={{ padding: '12px 10px', color: '#544539' }}>{customer.phone || '—'}</td>
                <td style={{ padding: '12px 10px', color: '#544539' }}>{new Date(customer.registrationDate).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(24, 18, 11, 0.55)', display: 'grid', placeItems: 'center', padding: 24, zIndex: 50 }}>
          <div style={{ width: '100%', maxWidth: 760, background: '#fffdf9', borderRadius: 18, border: '1px solid #eadcc1', padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7d6956', fontWeight: 700 }}>Promotional campaign</div>
                <h3 style={{ margin: '6px 0 0', color: '#2f1d15' }}>Send festive offer email</h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ border: '1px solid #e6d4ad', background: '#fff', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}>
                Close
              </button>
            </div>

            <div style={{ marginBottom: 18, background: '#f8f1e3', border: '1px solid #e9d8b2', borderRadius: 12, padding: 14, color: '#47382d' }}>
              Sending promo to <strong>{selectedCustomers.length}</strong> selected customer(s). Use code <strong>FESTIVE10</strong> and send them to <a href="https://simdi.in/products" target="_blank" rel="noreferrer" style={{ color: '#8b1a1a' }}>simdi.in/products</a>.
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontWeight: 700, color: '#493d34' }}>Promo subject</label>
                <input readOnly value="SIMDI – Festive Offer | FESTIVE10" style={{ border: '1px solid #e3d2ac', borderRadius: 10, padding: '10px 12px', background: '#fff', color: '#2d2017' }} />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontWeight: 700, color: '#493d34' }}>Preview</label>
                <div style={{ border: '1px solid #e3d2ac', borderRadius: 12, background: '#fff', padding: 14, color: '#47382d', lineHeight: 1.7 }}>
                  Save 10% with code <strong>FESTIVE10</strong> on handcrafted Himalayan products, with featured items like Pahadi Arsa, Buransh Juice, Pahadi Bhatt, Ghee, Akhrot and Gauth.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ border: '1px solid #e6d4ad', background: '#fff', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={sendPromoEmails} disabled={isSending} style={{ border: 'none', borderRadius: 10, background: '#1d6f42', color: '#fff', padding: '10px 16px', fontWeight: 700, cursor: isSending ? 'not-allowed' : 'pointer' }}>
                {isSending ? 'Sending...' : 'Send now'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
