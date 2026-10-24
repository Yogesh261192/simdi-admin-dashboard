import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const PROMO_CODE = 'FESTIVE10'
const SHOP_URL = 'https://simdi.in/products'

const products = [
  { name: 'Pahadi Arsa', image: 'https://simdi.in/product_images/arsa/arsa.webp', url: 'https://simdi.in/products/pahadi-arsa-mithaas' },
  { name: 'Buransh Juice', image: 'https://simdi.in/product_images/buransh/buransh.webp', url: 'https://simdi.in/products/pahadi-blossom-juice' },
  { name: 'Pahadi Bhatt', image: 'https://simdi.in/product_images/pahadi_bhatt/pahadi_bhatt.webp', url: 'https://simdi.in/products/pahadi-bhatt-dal' },
  { name: 'Ghee', image: 'https://simdi.in/product_images/ghee/ghee.webp', url: 'https://simdi.in/products/ghee' },
  { name: 'Akhrot', image: 'https://simdi.in/product_images/akhrot/akhrot.webp', url: 'https://simdi.in/products/pahadi-walnut' },
  { name: 'Gauth', image: 'https://simdi.in/product_images/gauth/gauth.webp', url: 'https://simdi.in/products/gahat-organic-kulthi-dal' },
]

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: 'team@simdi.in',
    pass: process.env.ZOHO_APP_PASSWORD || '',
  },
})

const productCell = (product: typeof products[number]) => `
  <td width="48%" valign="top" style="background:#ffffff; border:1px solid #e0d8cc; border-radius:6px; padding:0; text-align:center;">
    <a href="${product.url}" style="text-decoration:none;">
      <img src="${product.image}" alt="${product.name}" width="240" style="width:100%; max-width:240px; height:auto; display:block; margin:0 auto; border-radius:6px 6px 0 0;" />
    </a>
    <p style="margin:12px 0 6px; font-size:16px; color:#1a1a1a; font-weight:700; font-family:Georgia,serif;">${product.name}</p>
    <p style="margin:0 0 14px;">
      <a href="${product.url}" style="font-size:10px; color:#8b1a1a; text-decoration:none; font-family:'Courier New',monospace; letter-spacing:2px; text-transform:uppercase;">Shop Now →</a>
    </p>
  </td>`

const emptyCell = '<td width="48%"></td>'

const productRows = products
  .reduce((rows: Array<typeof products[number][]>, product, index) => {
    if (index % 2 === 0) rows.push([product])
    else rows[rows.length - 1].push(product)
    return rows
  }, [])
  .map((pair) => `
    <tr>${productCell(pair[0])}
      <td width="4%"></td>${pair[1] ? productCell(pair[1]) : emptyCell}
    </tr>
    <tr><td colspan="3" height="14" style="font-size:0; line-height:0;">&nbsp;</td></tr>`)
  .join('')

function buildPromoEmail(customerName: string) {
  return {
    subject: `SIMDI – Festive Offer | ${PROMO_CODE}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SIMDI – Festive Offer | ${PROMO_CODE}</title>
      </head>
      <body style="margin:0; padding:0; background:#e8e2d8; font-family: Georgia, 'Times New Roman', serif;">
        <div style="display:none; max-height:0; overflow:hidden; opacity:0; font-size:1px; color:#e8e2d8;">
          Use code ${PROMO_CODE} for 10% off all Pahadi products. Free shipping Pan India.
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8e2d8;">
          <tr>
            <td align="center" style="padding:20px 0;">
              <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px; width:100%; background:#faf7f2; border:1px solid #ddd5c4;">
                <tr>
                  <td style="background:#1e4030; padding:24px 36px 18px; text-align:center;">
                    <img src="https://simdi.in/logo.jpeg" alt="SIMDI" width="80" height="80" style="width:80px; height:80px; border-radius:50%; border:2px solid #7aaa8a; display:block; margin:0 auto 12px; object-fit:cover;" />
                    <p style="margin:0 0 3px; font-size:9px; letter-spacing:5px; color:#7aaa8a; font-family:'Courier New',monospace; text-transform:uppercase;">Be Pahadi · Buy Pahadi</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#8b1a1a; padding:30px 30px; text-align:center;">
                    <p style="margin:0 0 6px; font-size:16px; color:#e9c46a; letter-spacing:10px;">✦ ✧ ✦ ✧ ✦</p>
                    <p style="margin:0 0 4px; font-size:9px; letter-spacing:5px; color:#f3d9a4; font-family:'Courier New',monospace; text-transform:uppercase;">Festive Season Special</p>
                    <h2 style="margin:6px 0 0; font-size:46px; font-weight:700; color:#ffffff; line-height:1.1; font-family:Georgia,serif;">Flat <span style="color:#e9c46a;">10% OFF</span></h2>
                    <p style="margin:10px 0 0; font-size:14px; color:#f7e8d0; font-style:italic;">On everything Pahadi, straight from Uttarakhand</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:34px 44px 20px; text-align:center; background:#faf7f2;">
                    <p style="margin:0 0 4px; font-size:9px; letter-spacing:5px; color:#b07d2a; font-family:'Courier New',monospace; text-transform:uppercase;">Made in the Himalayas</p>
                    <h3 style="margin:12px 0 0; font-size:28px; font-weight:700; color:#1a1a1a; line-height:1.2; font-family:Georgia,serif;">Gift from the mountains<br><span style="color:#8b1a1a;">this festive season</span></h3>
                    <p style="margin:16px 0 0; font-size:15px; color:#444; line-height:1.85; font-style:italic;">Hi ${customerName}, bring home authentic Himalayan flavours and a little mountain joy this festive season.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 44px 26px; background:#faf7f2;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="background:#fff4ee; border:2px dashed #b07d2a; border-radius:8px; padding:22px 16px;">
                          <p style="margin:0 0 8px; font-size:9px; letter-spacing:5px; color:#b07d2a; font-family:'Courier New',monospace; text-transform:uppercase;">Your Promo Code</p>
                          <p style="margin:0; font-size:34px; font-weight:700; color:#1e4030; letter-spacing:8px; font-family:'Courier New',monospace;">${PROMO_CODE}</p>
                          <p style="margin:10px 0 0; font-size:12px; color:#777; font-family:Georgia,serif; font-style:italic;">Apply at checkout to get 10% off your order</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 44px 30px; text-align:center; background:#faf7f2;">
                    <a href="${SHOP_URL}" style="display:inline-block; background:#1e4030; color:#ffffff; text-decoration:none; padding:14px 40px; font-size:10px; letter-spacing:4px; font-family:'Courier New',monospace; text-transform:uppercase; border-radius:4px;">Shop All Products →</a>
                    <p style="margin:10px 0 0; font-size:10px; color:#aaa; font-family:'Courier New',monospace; letter-spacing:2px;">Free Shipping · Pan India</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 44px 18px; text-align:center; background:#faf7f2;">
                    <p style="margin:0 0 4px; font-size:9px; letter-spacing:5px; color:#b07d2a; font-family:'Courier New',monospace; text-transform:uppercase;">Our Collection</p>
                    <h3 style="margin:8px 0 0; font-size:24px; font-weight:700; color:#1a1a1a; font-family:Georgia,serif;">Festive Favourites</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 44px 14px; background:#faf7f2;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">${productRows}</table>
                  </td>
                </tr>
                <tr>
                  <td style="background:#fff4ee; border-top:1px solid #e8ddd0; border-bottom:1px solid #e8ddd0; padding:24px 44px; text-align:center;">
                    <p style="margin:0 0 14px; font-size:15px; color:#333; line-height:1.8; font-style:italic; font-family:Georgia,serif;">Our small batches sell out fast during festivals.<br><strong style="color:#8b1a1a;">Use ${PROMO_CODE} before the offer ends.</strong></p>
                    <a href="${SHOP_URL}" style="display:inline-block; border:1.5px solid #1e4030; color:#1e4030; text-decoration:none; padding:12px 36px; font-size:10px; letter-spacing:4px; font-family:'Courier New',monospace; text-transform:uppercase; border-radius:4px;">Claim 10% Off →</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 36px; text-align:center; background:#1e4030;">
                    <p style="margin:0 0 4px; font-size:10px; color:#c8dfc8; font-family:'Courier New',monospace; letter-spacing:2px; text-transform:uppercase;">Simdi · Chakisain, Pauri Garhwal · team@simdi.in</p>
                    <p style="margin:4px 0 0; font-size:9px; color:#7aaa8a; font-family:'Courier New',monospace;">
                      <a href="https://simdi.in" style="color:#7aaa8a; text-decoration:none;">simdi.in</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { customers?: Array<{ name?: string; email?: string }> }
    const customers = body.customers || []

    if (!customers.length) {
      return NextResponse.json({ error: 'No customers selected.' }, { status: 400 })
    }

    const sent: string[] = []

    for (const customer of customers) {
      const email = customer.email
      const name = customer.name || 'there'

      if (!email) continue

      const template = buildPromoEmail(name)
      await transporter.sendMail({
        from: '"SIMDI" <team@simdi.in>',
        to: email,
        subject: template.subject,
        html: template.html,
      })

      sent.push(email)
    }

    return NextResponse.json({ ok: true, sent: sent.length })
  } catch (error) {
    console.error('promo email send failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send promo email.' }, { status: 500 })
  }
}
