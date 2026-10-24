import { Client, Databases, Query, Users } from 'node-appwrite'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
const orderCollectionId = process.env.NEXT_PUBLIC_APPWRITE_ORDER_COLLECTION_ID

function toPlainObject<T>(value: T): T {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map((item) => toPlainObject(item)) as T
  if (typeof value !== 'object') return value

  try {
    return JSON.parse(JSON.stringify(value)) as T
  } catch {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, toPlainObject(nestedValue)])
    ) as T
  }
}

function normalizeOrderItems(rawItems: unknown): Array<Record<string, any>> {
  console.log(rawItems, 'rawitems')
  if (Array.isArray(rawItems)) {
    return rawItems.map((item) => (typeof item === 'object' && item ? toPlainObject(item) : { name: String(item) }))
  }
  if(typeof rawItems ==="object" && rawItems !== null && "items" in rawItems){
    const items = rawItems.items;
    console.log(items, 'itemsmsmsm')

    if (Array.isArray(items)) {
      return items;
    }

    return [];
  }
  

  if (typeof rawItems === 'string') {
    console.log(rawItems,'dadadda')
    try {
      const parsed = JSON.parse(rawItems)
      // if (Array.isArray(parsed)) {
      //   return parsed.map((item) => (typeof item === 'object' && item ? toPlainObject(item) : { name: String(item) }))
      // }
      return parsed.items
    } catch {
      return []
    }
  }

  return []
}

export function getAllowedAdminEmails() {
  return Array.from(
    new Set(
      [
        process.env.ADMIN_EMAIL,
        process.env.ADMIN_EMAILS,
        process.env.TEAM_EMAIL_1,
        process.env.TEAM_EMAIL_2,
        'team@simdi.in',
        'yogeshmamgain2611@gmail.com',
      ]
        .filter(Boolean)
        .join(',')
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const sessionSecret = cookieStore.get('appwrite-session')?.value
  const localSessionStatus = cookieStore.get('simdi-admin-session')?.value
  const email = cookieStore.get('simdi-admin-email')?.value?.toLowerCase() ?? ''
  const allowList = getAllowedAdminEmails()

  if (localSessionStatus === 'active') {
    const isAdmin = allowList.length === 0 || allowList.includes(email) || email.endsWith('@simdi.in')

    if (email && isAdmin) {
      return {
        isAdmin: true,
        user: { id: 'local-admin', name: 'Admin', email },
      }
    }
  }

  if (!sessionSecret || !endpoint || !projectId) {
    return { isAdmin: false, user: null }
  }

  try {
    const client = new Client().setEndpoint(endpoint).setProject(projectId).setSession(sessionSecret)
    const account = (await import('node-appwrite')).Account
    const accountClient = new account(client)
    const user = await accountClient.get()
    const email = user.email?.toLowerCase() ?? ''
    const allowList = getAllowedAdminEmails()
    const isAdmin = allowList.length === 0 || allowList.includes(email) || email.endsWith('@simdi.in')

    return { isAdmin, user: { id: user.$id, name: user.name || 'Admin', email: user.email } }
  } catch {
    return { isAdmin: false, user: null }
  }
}

export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session.isAdmin || !session.user) {
    redirect('/admin/access-denied')
  }
  return session
}

export async function listOrdersForAdmin(limit = 250) {
  if (!databaseId || !orderCollectionId || !endpoint || !projectId || !apiKey) return []

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const db = new Databases(client)
  const result = await db.listDocuments({
    databaseId,
    collectionId: orderCollectionId,
    queries: [Query.limit(limit), Query.orderDesc('$createdAt')],
  })
  console.log(result)
  return result.documents.map((doc) => ({
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    name: doc.name ?? doc.customer?.name ?? 'Customer',
    email: doc.email ?? doc.customer?.email ?? '',
    phone: doc.phone ?? doc.customer?.contact ?? '',
    order_number: doc.order_number ?? `#${doc.$id.slice(0, 8)}`,
    date: doc.date ?? doc.$createdAt,
    items: normalizeOrderItems(doc.order),
    total_amount: Number(doc.total_amount ?? doc.total ?? 0),
    payment_status: doc.payment_status ?? 'pending',
    status: doc.status ?? 'pending',
    tracking_number: doc.tracking_number ?? '',
  }))
}

export async function listCustomersForAdmin(limit = 250) {
  if (!endpoint || !projectId || !apiKey) return []

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const usersClient = new Users(client)
  const result = await usersClient.list({
    queries: [Query.limit(limit), Query.orderDesc('$createdAt')],
  })

  return result.users.map((user) => {
    const plainPrefs = toPlainObject(user.prefs ?? {}) as Record<string, unknown>

    return {
      $id: user.$id,
      name: user.name || 'Customer',
      email: user.email,
      phone: user.phone || '',
      registrationDate: user.$createdAt,
      prefs: plainPrefs,
    }
  })
}

export async function getDashboardSummary() {
  const [orders, customers] = await Promise.all([listOrdersForAdmin(500), listCustomersForAdmin(500)])
  return {
    totalOrders: orders.length,
    awaitingDispatch: orders.filter((order) => ['pending', 'confirmed', 'processing'].includes(order.status)).length,
    awaitingDeliveryConfirmation: orders.filter((order) => ['in_transit', 'out_for_delivery'].includes(order.status)).length,
    eligibleForReview: orders.filter((order) => Array.isArray(order.items) && order.items.some((item) => item.slug)).length,
    totalCustomers: customers.length,
    marketingEligible: customers.filter((customer) => Boolean((customer.prefs as any)?.marketingConsent)).length,
  }
}
