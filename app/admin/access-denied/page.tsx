import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 540, background: '#fffdf8', border: '1px solid #e9dcc0', borderRadius: 18, padding: 28 }}>
        <h1 style={{ marginBottom: 12, color: '#382a1d' }}>Access denied</h1>
        <p style={{ lineHeight: 1.7, color: '#5d4c3d' }}>
          This dashboard is restricted to authorized Simdi admin accounts. Sign in with a permitted account to continue.
        </p>
        <Link href="/" style={{ display: 'inline-block', marginTop: 18, background: '#234d36', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700 }}>
          Go home
        </Link>
      </div>
    </main>
  )
}
