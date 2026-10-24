import Link from 'next/link'
import { Bell, Package, Users, ShieldCheck } from 'lucide-react'

import { getAdminSession } from '@/lib/admin-data'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()

  if (!session.isAdmin || !session.user) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f7f1ea', padding: 24 }}>
        <div style={{ maxWidth: 580, background: '#fffcf8', border: '1px solid #e7d8ba', borderRadius: 18, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <ShieldCheck size={28} color="#1d6f42" />
            <h1 style={{ margin: 0, color: '#2d2017' }}>Admin access required</h1>
          </div>
          <p style={{ lineHeight: 1.7, color: '#563f2b', marginBottom: 18 }}>
            Please sign in with an authorized Simdi admin account to access the customer communication dashboard.
          </p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#1d6f42', color: '#fff', padding: '10px 18px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const nav = [
    { href: '/admin/orders', label: 'Orders', icon: Package },
    { href: '/admin/customers', label: 'Customers', icon: Users },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, background: '#1f2d24', color: '#f4f1eb', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: '#c58a38', display: 'grid', placeItems: 'center', fontWeight: 800 }}>S</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>SIMDI</div>
            <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#e4dcd3' }}>Admin</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: '#f4f1eb', background: 'rgba(255,255,255,0.02)' }}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: '#d0a86d', display: 'grid', placeItems: 'center', color: '#1c281f', fontWeight: 800 }}>
              {session.user.name?.slice(0, 1)?.toUpperCase() || 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.user.name}</div>
              <div style={{ fontSize: 11, color: '#ddd0c7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 24, background: '#f5efe7' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffdfa', border: '1px solid #e8d7ba', borderRadius: 18, padding: '16px 20px', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.17em', textTransform: 'uppercase', fontWeight: 700, color: '#80715f' }}>SIMDI.in</div>
            <h2 style={{ margin: '6px 0 0', fontSize: 28, color: '#332518' }}>Customer Communication Dashboard</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#fff', border: '1px solid #ebdcc3', borderRadius: 12, width: 40, height: 40, display: 'grid', placeItems: 'center' }}>
              <Bell size={18} color="#3a2b20" />
            </div>
            <div style={{ background: '#f5efe7', border: '1px solid #ebdcc3', borderRadius: 12, padding: '10px 14px', fontWeight: 700, color: '#3d2a1f' }}>
              {session.user.email}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
