'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [email, setEmail] = useState('team@simdi.in')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password.')
      }

      router.push('/admin/orders')
      router.refresh()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f7f1ea' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fffdf9', border: '1px solid #e8d9be', borderRadius: 22, padding: 28, boxShadow: '0 18px 40px rgba(60, 43, 26, 0.08)' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7b6558', fontWeight: 700 }}>SIMDI Admin</div>
        <h1 style={{ fontSize: 34, margin: '12px 0 8px', color: '#2d2017' }}>Sign in</h1>
        <p style={{ color: '#5b4639', lineHeight: 1.6, marginBottom: 24 }}>
          Enter your authorized Simdi admin email and password to access the customer dashboard.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="email" style={{ fontSize: 13, fontWeight: 700, color: '#47382d' }}>Admin ID</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@simdi.in"
              autoComplete="email"
              style={{ width: '100%', border: '1px solid #e3d2ac', borderRadius: 12, padding: '12px 14px', fontSize: 16, outline: 'none', background: '#fff', color: '#2d2017' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="password" style={{ fontSize: 13, fontWeight: 700, color: '#47382d' }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              style={{ width: '100%', border: '1px solid #e3d2ac', borderRadius: 12, padding: '12px 14px', fontSize: 16, outline: 'none', background: '#fff', color: '#2d2017' }}
              required
            />
          </div>

          {error ? (
            <div style={{ background: '#fff0f0', border: '1px solid #f1c7c7', color: '#9b2d2d', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}>
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              border: 'none',
              borderRadius: 12,
              padding: '12px 18px',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              background: isLoading ? '#6d8a7a' : '#1d6f42',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  )
}
