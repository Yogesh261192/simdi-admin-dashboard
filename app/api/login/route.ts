import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Account, Client } from 'node-appwrite'

import { getAllowedAdminEmails } from '@/lib/admin-data'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string }
  const email = body.email?.trim() ?? ''
  const password = body.password ?? ''

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID

  if (!endpoint || !projectId) {
    return NextResponse.json({ error: 'Appwrite is not configured for this app.' }, { status: 500 })
  }

  try {
    const client = new Client().setEndpoint(endpoint).setProject(projectId)
    const account = new Account(client)
    const session = await account.createEmailPasswordSession(email, password)
    const sessionSecret = (session as { secret?: string } | undefined)?.secret ?? ''
    const sessionId = session?.$id ?? ''

    if (!sessionId && !sessionSecret) {
      throw new Error('No Appwrite session was created for this login.')
    }

    let userEmail = email.toLowerCase()
    let signedInAccount: Account | null = null

    if (sessionSecret) {
      const signedInClient = new Client().setEndpoint(endpoint).setProject(projectId).setSession(sessionSecret)
      signedInAccount = new Account(signedInClient)
      const user = await signedInAccount.get()
      userEmail = user.email?.toLowerCase() ?? userEmail
    }

    const allowList = getAllowedAdminEmails()
    const isAuthorizedAdmin = allowList.length === 0 || allowList.includes(userEmail) || userEmail.endsWith('@simdi.in')

    if (!isAuthorizedAdmin) {
      if (signedInAccount) {
        await signedInAccount.deleteSession('current')
      }
      return NextResponse.json(
        { error: 'This account is not allowed to access the admin dashboard.' },
        { status: 403 }
      )
    }

    const cookieStore = await cookies()

    if (sessionSecret) {
      cookieStore.set('appwrite-session', sessionSecret, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    cookieStore.set('simdi-admin-session', 'active', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('simdi-admin-email', userEmail, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({ ok: true, redirectTo: '/admin/orders' })
  } catch (error) {
    console.log(error, 'error')
    const message = error instanceof Error ? error.message : 'Invalid email or password.'
    const status = message.includes('not allowed') ? 403 : 401

    return NextResponse.json({ error: status === 403 ? message : 'Invalid email or password.' }, { status })
  }
}
