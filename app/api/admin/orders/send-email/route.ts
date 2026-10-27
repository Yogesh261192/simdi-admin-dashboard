// app/api/.../route.ts  (bulk order emails: delay · in transit · delivered)
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Mailer ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  pool: true, // reuse one connection for the whole batch
  maxConnections: 1,
  auth: {
    user: 'team@simdi.in',
    pass: process.env.ZOHO_APP_PASSWORD || '',
  },
})

// ── Sending limits ───────────────────────────────────────────
const MAX_BATCH = 100 // max orders per request
const DELAY_MS = 400 // pause between emails (be kind to Zoho SMTP limits)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface OrderItem {
  name?: string
  slug?: string
  image?: string
  quantity?: number
  qty?: number
}

interface Order {
  email?: string
  name?: string
  order_number: string | number
  tracking_number?: string
  tracking_url?: string // optional: overrides the default Shiprocket link
  courier?: string // e.g. "Delhivery"
  eta?: string // e.g. "27 Oct – 30 Oct"
  items?: OrderItem[]
}

// ── Brand & settings ─────────────────────────────────────────
const BRAND = {
  name: 'SIMDI',
  site: 'https://simdi.in',
  logo: 'https://simdi.in/logo.jpeg',
  email: 'team@simdi.in',
  address: 'Chakisain, Pauri Garhwal, Uttarakhand',
  tagline: 'Be Pahadi · Buy Pahadi',
}

const C = {
  green: '#1e4030',
  red: '#8b1a1a',
  gold: '#b07d2a',
  page: '#f3ecdf',
  card: '#fffdf9',
  panel: '#fff8ef',
  border: '#eadcc1',
  text: '#2b1e16',
  muted: '#56473d',
  soft: '#8a6e4a',
}

const TRACKING_BASE = 'https://shiprocket.co/tracking/'

// Shown on the delivery email. Set to null to hide the block.
const REORDER_PROMO: { code: string; text: string } | null = {
  code: 'FESTIVE10',
  text: 'Enjoy 10% off your next order',
}

// ── Helpers ──────────────────────────────────────────────────
const esc = (v: unknown = ''): string =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const absoluteUrl = (img?: string): string => {
  if (!img) return BRAND.logo
  if (img.startsWith('http')) return img
  return `${BRAND.site}${img.startsWith('/') ? '' : '/'}${img}`
}

const trackingLink = (order: Order): string | null => {
  if (order.tracking_url) return order.tracking_url
  if (order.tracking_number) return `${TRACKING_BASE}${encodeURIComponent(order.tracking_number)}`
  return null
}

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const label = (text: string) =>
  `<p style="margin:0 0 6px;font-size:10px;letter-spacing:4px;color:${C.soft};text-transform:uppercase;font-family:'Courier New',monospace;">${text}</p>`

const button = (href: string, text: string, bg = C.green) =>
  `<a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;padding:15px 38px;border-radius:10px;font-weight:700;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-family:'Courier New',monospace;">${text}</a>`

// ── Order progress tracker ───────────────────────────────────
// step: index of the current stage (0-3). Use 4 to mark everything complete.
const STAGES = ['Placed', 'Packed', 'Shipped', 'Delivered']

function buildTimeline(step: number): string {
  const cells = STAGES.map((stage, i) => {
    const done = i < step
    const current = i === step
    const bg = done ? C.green : current ? C.gold : '#e6dccb'
    const fg = done || current ? '#ffffff' : '#a39682'
    const mark = done ? '✓' : String(i + 1)
    return `
      <td align="center" width="25%" valign="top" style="padding:0 2px;">
        <div style="width:30px;height:30px;line-height:30px;border-radius:50%;background:${bg};color:${fg};font-size:13px;font-weight:700;font-family:Arial,sans-serif;margin:0 auto 6px;">${mark}</div>
        <p style="margin:0;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${done || current ? C.text : '#a39682'};font-family:'Courier New',monospace;font-weight:${current ? '700' : '400'};">${stage}</p>
      </td>`
  }).join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
      <tr>${cells}</tr>
    </table>`
}

// ── Order items ──────────────────────────────────────────────
function buildOrderItems(items: OrderItem[]): string {
  if (!items.length) return ''
  const rows = items
    .map((it) => {
      const qty = it.quantity ?? it.qty ?? 1
      return `
        <tr>
          <td width="68" style="padding:10px 12px 10px 18px;border-top:1px solid ${C.border};vertical-align:middle;">
            <img src="${absoluteUrl(it.image)}" alt="${esc(it.name)}" width="56" height="56" style="width:56px;height:56px;border-radius:8px;display:block;object-fit:cover;" />
          </td>
          <td style="padding:10px 0;border-top:1px solid ${C.border};font-size:15px;color:${C.text};font-family:Georgia,serif;vertical-align:middle;">${esc(it.name || 'SIMDI product')}</td>
          <td align="right" style="padding:10px 18px 10px 0;border-top:1px solid ${C.border};font-size:12px;color:${C.soft};font-family:'Courier New',monospace;vertical-align:middle;">× ${esc(qty)}</td>
        </tr>`
    })
    .join('')
  return rows
}

// ── Shared page layout ───────────────────────────────────────
interface LayoutOptions {
  preheader: string
  headerBg: string
  emoji: string
  title: string
  body: string
}

function layout({ preheader, headerBg, emoji, title, body }: LayoutOptions): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};font-family:Georgia,serif;">

<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;color:${C.page};">${esc(preheader)}</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:${C.page};">
  <tr>
    <td align="center" style="padding:28px 16px;">
      <table width="620" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:620px;width:100%;background:${C.card};border:1px solid ${C.border};border-radius:18px;overflow:hidden;">

        <!-- HEADER -->
        <tr>
          <td style="background:${headerBg};padding:24px 28px 20px;text-align:center;">
            <img src="${BRAND.logo}" alt="${BRAND.name}" width="80" height="80" style="width:80px;height:80px;border-radius:50%;border:2px solid rgba(255,255,255,0.35);display:block;margin:0 auto 12px;object-fit:cover;" />
            <p style="margin:0 0 4px;color:#e8f1ea;font-size:9px;letter-spacing:5px;text-transform:uppercase;font-family:'Courier New',monospace;">${BRAND.tagline}</p>
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:5px;font-family:Georgia,serif;">${BRAND.name}</h1>
          </td>
        </tr>

        <!-- TITLE -->
        <tr>
          <td style="padding:30px 30px 6px;text-align:center;">
            <p style="margin:0 0 8px;font-size:36px;line-height:1;">${emoji}</p>
            <h2 style="margin:0;color:${C.text};font-size:28px;line-height:1.25;font-family:Georgia,serif;">${title}</h2>
          </td>
        </tr>

        ${body}

        <!-- HELP -->
        <tr>
          <td style="background:#fff4ee;border-top:1px solid #e8ddd0;padding:20px 30px;text-align:center;">
            <p style="margin:0;font-size:14px;color:${C.muted};line-height:1.8;font-style:italic;">
              Questions about your order? Just reply to this email or write to
              <a href="mailto:${BRAND.email}" style="color:${C.red};text-decoration:none;font-weight:700;">${BRAND.email}</a>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${C.green};padding:22px 28px;text-align:center;">
            <p style="margin:0 0 6px;font-size:10px;color:#c8dfc8;font-family:'Courier New',monospace;letter-spacing:2px;text-transform:uppercase;">FSSAI Certified · Free Shipping Pan India</p>
            <p style="margin:0 0 6px;font-size:10px;color:#c8dfc8;font-family:'Courier New',monospace;letter-spacing:2px;text-transform:uppercase;">${BRAND.name} · ${BRAND.address}</p>
            <p style="margin:0;font-size:10px;font-family:'Courier New',monospace;letter-spacing:1px;">
              <a href="${BRAND.site}" style="color:#7aaa8a;text-decoration:none;">simdi.in</a>
              <span style="color:#7aaa8a;"> · </span>
              <a href="mailto:${BRAND.email}" style="color:#7aaa8a;text-decoration:none;">${BRAND.email}</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`
}

// Small reusable body sections
const paragraph = (html: string) => `
        <tr>
          <td style="padding:14px 36px 22px;text-align:center;">
            <p style="margin:0;color:${C.muted};line-height:1.8;font-size:15px;">${html}</p>
          </td>
        </tr>`

const timelineRow = (step: number) => `
        <tr>
          <td style="padding:4px 30px 26px;">${buildTimeline(step)}</td>
        </tr>`

const orderPanel = (order: Order, extraRows = ''): string => {
  const items = order.items || []
  return `
        <tr>
          <td style="padding:0 30px 22px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:${C.panel};border:1px solid #eedcc2;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:18px 18px 14px;">
                  ${label('Order')}
                  <p style="margin:0;color:${C.text};font-size:18px;font-weight:700;">#${esc(order.order_number)}</p>
                </td>
              </tr>
              ${extraRows}
              ${buildOrderItems(items)}
            </table>
          </td>
        </tr>`
}

// ═════════════════════════════════════════════════════════════
// 1) DELAY EMAIL
// ═════════════════════════════════════════════════════════════
function buildDelayEmail(order: Order) {
  const name = esc(order.name || 'there')

  const etaRow = order.eta
    ? `
              <tr>
                <td colspan="3" style="padding:0 18px 16px;">
                  ${label('Updated Estimate')}
                  <p style="margin:0;color:${C.text};font-size:15px;font-weight:700;">${esc(order.eta)}</p>
                </td>
              </tr>`
    : ''

  const body = `
    ${paragraph(`Hi ${name},<br><br>
      We wanted to let you know that your order is taking a little longer to leave the mountains than we planned. Every SIMDI product is made in small batches and packed by hand, and we would rather take an extra day than send you anything less than our best.<br><br>
      Thank you for your patience. It means a lot to the families who make these products.`)}
    ${timelineRow(1)}
    ${orderPanel(order, etaRow)}
    <tr>
      <td style="padding:0 30px 28px;text-align:center;">
        <p style="margin:0 0 16px;font-size:13px;color:${C.soft};font-style:italic;">We will email you again the moment it ships, with a tracking link.</p>
        ${button(`${BRAND.site}/products`, 'Browse products')}
      </td>
    </tr>`

  return {
    subject: `🏔️ A gentle note about your SIMDI order #${order.order_number}`,
    html: layout({
      preheader: `Your order #${order.order_number} is still being packed with care. Here is a quick update.`,
      headerBg: C.green,
      emoji: '⏳',
      title: 'A quick update on your order',
      body,
    }),
  }
}

// ═════════════════════════════════════════════════════════════
// 2) IN TRANSIT EMAIL
// ═════════════════════════════════════════════════════════════
function buildTransitEmail(order: Order) {
  const name = esc(order.name || 'there')
  const link = trackingLink(order)

  const detailRows = `
              ${
                order.tracking_number
                  ? `<tr>
                <td colspan="3" style="padding:0 18px 14px;">
                  ${label('Tracking Number')}
                  <p style="margin:0;color:${C.text};font-size:17px;font-weight:700;font-family:'Courier New',monospace;letter-spacing:1px;">${esc(order.tracking_number)}</p>
                </td>
              </tr>`
                  : ''
              }
              ${
                order.courier
                  ? `<tr>
                <td colspan="3" style="padding:0 18px 14px;">
                  ${label('Courier Partner')}
                  <p style="margin:0;color:${C.text};font-size:15px;font-weight:700;">${esc(order.courier)}</p>
                </td>
              </tr>`
                  : ''
              }
              ${
                order.eta
                  ? `<tr>
                <td colspan="3" style="padding:0 18px 16px;">
                  ${label('Expected Delivery')}
                  <p style="margin:0;color:${C.text};font-size:15px;font-weight:700;">${esc(order.eta)}</p>
                </td>
              </tr>`
                  : ''
              }`

  const cta = link
    ? `
    <tr>
      <td style="padding:0 30px 30px;text-align:center;">
        ${button(link, 'Track my order')}
        <p style="margin:14px 0 0;font-size:11px;color:#999;line-height:1.6;">
          Button not working? Copy this link:<br>
          <a href="${link}" style="color:${C.red};word-break:break-all;">${link}</a>
        </p>
        <p style="margin:12px 0 0;font-size:12px;color:${C.soft};font-style:italic;">Tracking updates can take a few hours to appear after dispatch.</p>
      </td>
    </tr>`
    : `
    <tr>
      <td style="padding:0 30px 30px;text-align:center;">
        <p style="margin:0;font-size:13px;color:${C.soft};font-style:italic;">Your tracking link will be shared with you shortly.</p>
      </td>
    </tr>`

  const body = `
    ${paragraph(`Hi ${name},<br><br>
      Woohoo, great news! Your order has left our hands and is on its way from the hills to your doorstep.`)}
    ${timelineRow(2)}
    ${orderPanel(order, detailRows)}
    ${cta}`

  return {
    subject: `🏔️ Woohoo! Your SIMDI order #${order.order_number} is on the way`,
    html: layout({
      preheader: `Your Pahadi goodness has left the mountains. Track order #${order.order_number} here.`,
      headerBg: C.red,
      emoji: '📦',
      title: 'Your order is on the way',
      body,
    }),
  }
}

// ═════════════════════════════════════════════════════════════
// 3) DELIVERED / REVIEW EMAIL
// ═════════════════════════════════════════════════════════════
function buildDeliveryEmail(order: Order) {
  const name = esc(order.name || 'there')
  const items = order.items || []

  const reviewCard = (item: OrderItem) => {
    const slug = item.slug?.trim()
    const itemName = esc(item.name || 'SIMDI product')
    const reviewUrl = slug
      ? `${BRAND.site}/products/${encodeURIComponent(slug)}#reviews`
      : `${BRAND.site}/products`
    return `
          <td width="48%" valign="top" style="background:#ffffff;border:1px solid ${C.border};border-radius:10px;padding:0;text-align:center;">
            <a href="${reviewUrl}" style="text-decoration:none;display:block;">
              <img src="${absoluteUrl(item.image)}" alt="${itemName}" width="240" style="width:100%;max-width:240px;height:auto;display:block;margin:0 auto;border-radius:10px 10px 0 0;" />
            </a>
            <p style="margin:12px 8px 6px;font-size:16px;color:#1a1a1a;font-weight:700;font-family:Georgia,serif;">${itemName}</p>
            <p style="margin:0 0 6px;font-size:16px;color:${C.gold};letter-spacing:3px;">★★★★★</p>
            <p style="margin:0 0 14px;">
              <a href="${reviewUrl}" style="font-size:10px;color:${C.red};text-decoration:none;font-family:'Courier New',monospace;letter-spacing:2px;text-transform:uppercase;">Leave a review →</a>
            </p>
          </td>`
  }

  // 2 cards per row. An odd last card gets an empty cell so it stays aligned.
  const reviewRows = chunk(items, 2)
    .map(
      ([a, b]) => `
        <tr>
          ${reviewCard(a)}
          <td width="4%"></td>
          ${b ? reviewCard(b) : '<td width="48%"></td>'}
        </tr>
        <tr><td colspan="3" height="14" style="font-size:0;line-height:0;">&nbsp;</td></tr>`
    )
    .join('')

  const reviewsBlock = items.length
    ? `
    <tr>
      <td style="padding:0 30px 10px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">${reviewRows}
        </table>
      </td>
    </tr>`
    : ''

  const promoBlock = REORDER_PROMO
    ? `
    <tr>
      <td style="padding:6px 30px 26px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
          <tr>
            <td align="center" style="background:#fff4ee;border:2px dashed ${C.gold};border-radius:10px;padding:18px 14px;">
              ${label(esc(REORDER_PROMO.text))}
              <p style="margin:0;font-size:28px;font-weight:700;color:${C.green};letter-spacing:6px;font-family:'Courier New',monospace;">${esc(REORDER_PROMO.code)}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#777;font-style:italic;">Apply at checkout</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    : ''

  const body = `
    ${paragraph(`Hi ${name},<br><br>
      Your order <strong style="color:${C.green};">#${esc(order.order_number)}</strong> has been delivered. We hope it brought a little Himalayan joy to your home.<br><br>
      Your review helps other families discover the work of our artisans, and it helps us keep improving. It takes less than a minute.`)}
    ${timelineRow(4)}
    ${reviewsBlock}
    ${promoBlock}
    <tr>
      <td style="padding:0 30px 30px;text-align:center;">
        ${button(BRAND.site, 'Explore more')}
      </td>
    </tr>`

  return {
    subject: `🏔️ We’d love your feedback on your SIMDI order #${order.order_number}`,
    html: layout({
      preheader: `Your order #${order.order_number} has arrived. Tell us what you think.`,
      headerBg: C.green,
      emoji: '🎉',
      title: 'Your order has arrived',
      body,
    }),
  }
}

// ═════════════════════════════════════════════════════════════
// Plain-text version (better deliverability, and for clients that block HTML)
// ═════════════════════════════════════════════════════════════
type EmailType = 'delay' | 'transit' | 'delivery'
const EMAIL_TYPES: EmailType[] = ['delay', 'transit', 'delivery']

function buildPlainText(type: EmailType, order: Order): string {
  const name = order.name || 'there'
  const link = trackingLink(order)
  const itemLines = (order.items || [])
    .map((i) => `- ${i.name || 'SIMDI product'} x ${i.quantity ?? i.qty ?? 1}`)
    .join('\n')

  let main = ''
  if (type === 'delay') {
    main =
      `Your order #${order.order_number} is taking a little longer to leave the mountains than planned. ` +
      `Every SIMDI product is made in small batches and packed by hand. Thank you for your patience.` +
      (order.eta ? `\nUpdated estimate: ${order.eta}` : '') +
      `\nWe will email you again the moment it ships.`
  } else if (type === 'transit') {
    main =
      `Woohoo! Your order #${order.order_number} is on the way.` +
      (order.tracking_number ? `\nTracking number: ${order.tracking_number}` : '') +
      (order.courier ? `\nCourier: ${order.courier}` : '') +
      (order.eta ? `\nExpected delivery: ${order.eta}` : '') +
      (link ? `\nTrack your order: ${link}` : `\nYour tracking link will be shared shortly.`)
  } else {
    main =
      `Your order #${order.order_number} has been delivered. We hope it brought a little Himalayan joy to your home.\n` +
      `We would love your review: ${BRAND.site}/products` +
      (REORDER_PROMO ? `\n${REORDER_PROMO.text} with code ${REORDER_PROMO.code}` : '')
  }

  return (
    `Hi ${name},\n\n${main}\n` +
    (itemLines ? `\nItems:\n${itemLines}\n` : '') +
    `\nQuestions? Reply to this email or write to ${BRAND.email}\n` +
    `\n${BRAND.name} · ${BRAND.address}\n${BRAND.site}`
  )
}

function buildEmail(type: EmailType, order: Order) {
  const payload =
    type === 'delay' ? buildDelayEmail(order) : type === 'transit' ? buildTransitEmail(order) : buildDeliveryEmail(order)
  return { ...payload, text: buildPlainText(type, order) }
}

// ═════════════════════════════════════════════════════════════
// POST /api/...  body: { type: 'delay' | 'transit' | 'delivery', orders: Order[] }
// ═════════════════════════════════════════════════════════════
export async function POST(request: Request) {
  try {
    // Optional protection: set BULK_EMAIL_SECRET and send it as the x-admin-secret header
    const secret = process.env.BULK_EMAIL_SECRET
    if (secret && request.headers.get('x-admin-secret') !== secret) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    if (!process.env.ZOHO_APP_PASSWORD) {
      return NextResponse.json({ error: 'Email is not configured (ZOHO_APP_PASSWORD missing).' }, { status: 500 })
    }

    const body = (await request.json().catch(() => ({}))) as { type?: EmailType; orders?: Order[] }
    const type = body.type
    const orders = Array.isArray(body.orders) ? body.orders : []

    if (!type || !EMAIL_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid email type. Use delay, transit or delivery.' }, { status: 400 })
    }
    if (!orders.length) {
      return NextResponse.json({ error: 'No orders selected.' }, { status: 400 })
    }
    if (orders.length > MAX_BATCH) {
      return NextResponse.json({ error: `Too many orders. Send at most ${MAX_BATCH} at a time.` }, { status: 400 })
    }

    const sent: string[] = []
    const skipped: { order_number: Order['order_number'] | null; reason: string }[] = []
    const failed: { email: string; order_number: Order['order_number'] | null; error: string }[] = []

    for (const order of orders) {
      const email = String(order?.email || '').trim()
      const orderNumber = order?.order_number ?? null

      if (!email || !EMAIL_RE.test(email)) {
        skipped.push({ order_number: orderNumber, reason: email ? 'Invalid email address' : 'No email address' })
        continue
      }
      if (type === 'transit' && !order.tracking_number && !order.tracking_url) {
        // still sent, but the email says the tracking link will follow
        console.warn(`Order ${orderNumber}: transit email sent without tracking number`)
      }

      try {
        const payload = buildEmail(type, order)
        await transporter.sendMail({
          from: `"${BRAND.name}" <${BRAND.email}>`,
          replyTo: BRAND.email,
          to: email,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        })
        sent.push(email)
      } catch (err) {
        // one bad address must not stop the rest of the batch
        console.error(`bulk email failed for order ${orderNumber}`, err)
        failed.push({ email, order_number: orderNumber, error: err instanceof Error ? err.message : 'Send failed' })
      }

      await sleep(DELAY_MS)
    }

    const allFailed = sent.length === 0 && failed.length > 0
    return NextResponse.json(
      { ok: !allFailed, sent: sent.length, skipped, failed },
      { status: allFailed ? 502 : 200 }
    )
  } catch (error) {
    console.error('bulk email send failed', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email.' },
      { status: 500 }
    )
  }
}