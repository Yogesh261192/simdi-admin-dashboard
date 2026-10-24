const SHOP_URL = 'https://simdi.in';
const TRACKING_BASE = 'https://shiprocket.co/tracking/';

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Build the "order is on the way" email.
 *
 * @param {Object}   data
 * @param {string}   data.customerName  e.g. "Yogesh"
 * @param {string}   data.orderId       e.g. "SIM1042"
 * @param {string}   data.trackingId    AWB number, e.g. "1319461138486"
 * @param {string}  [data.trackingUrl]  Full link. Defaults to Shiprocket + trackingId
 * @param {string}  [data.courier]      e.g. "Delhivery"
 * @param {string}  [data.eta]          e.g. "27 Oct – 30 Oct"
 * @param {Array}   [data.items]        [{ name: 'Ghee', qty: 1, image: 'https://...' }]
 * @returns {{ subject: string, html: string }}
 */
function buildOrderShippedEmail(data) {
  const {
    customerName = 'there',
    orderId,
    trackingId,
    courier,
    eta,
    items = [],
  } = data;

  const trackingUrl = data.trackingUrl || `${TRACKING_BASE}${trackingId}`;
  const name = escapeHtml(customerName);

  const subject = `🏔️ Woohoo! Your SIMDI order #${orderId} is on the way`;

  const itemRows = items
    .map(
      (it) => `
          <tr>
            <td width="64" style="padding:10px 12px 10px 0; border-bottom:1px solid #eee5d6; vertical-align:middle;">
              ${
                it.image
                  ? `<img src="${it.image}" alt="${escapeHtml(it.name)}" width="56" height="56" style="width:56px; height:56px; border-radius:6px; display:block; object-fit:cover;" />`
                  : ''
              }
            </td>
            <td style="padding:10px 0; border-bottom:1px solid #eee5d6; font-size:14px; color:#1a1a1a; font-family:Georgia,serif; vertical-align:middle;">
              ${escapeHtml(it.name)}
            </td>
            <td align="right" style="padding:10px 0; border-bottom:1px solid #eee5d6; font-size:12px; color:#777; font-family:'Courier New',monospace; vertical-align:middle;">
              ${it.qty ? `Qty ${escapeHtml(it.qty)}` : ''}
            </td>
          </tr>`
    )
    .join('');

  const itemsBlock = items.length
    ? `
    <!-- ITEMS -->
    <tr>
      <td style="padding:0 44px 28px; background:#faf7f2;">
        <p style="margin:0 0 6px; font-size:9px; letter-spacing:4px; color:#b07d2a; font-family:'Courier New',monospace; text-transform:uppercase;">In This Package</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${itemRows}
        </table>
      </td>
    </tr>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background:#e8e2d8;">

<!-- Preheader (inbox preview text) -->
<div style="display:none; max-height:0; overflow:hidden; opacity:0; font-size:1px; color:#e8e2d8;">
  Your Pahadi goodness has left the mountains. Track your order #${escapeHtml(orderId)} here.
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8e2d8; font-family: Georgia, 'Times New Roman', serif;">
<tr><td align="center" style="padding:20px 0;">

  <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px; width:100%; background:#faf7f2; border:1px solid #ddd5c4;">

    <!-- HEADER -->
    <tr>
      <td style="background:#1e4030; padding:24px 36px 18px; text-align:center;">
        <img src="https://simdi.in/logo.jpeg" alt="SIMDI" width="80" height="80"
             style="width:80px; height:80px; border-radius:50%; border:2px solid #7aaa8a; display:block; margin:0 auto 12px; object-fit:cover;" />
        <p style="margin:0 0 3px; font-size:9px; letter-spacing:5px; color:#7aaa8a; font-family:'Courier New',monospace; text-transform:uppercase;">Be Pahadi · Buy Pahadi</p>
        <h1 style="margin:0; font-size:26px; font-weight:700; color:#ffffff; letter-spacing:4px; font-family:Georgia,serif;">SIMDI</h1>
      </td>
    </tr>

    <!-- HERO -->
    <tr>
      <td style="background:#8b1a1a; padding:30px 30px; text-align:center;">
        <p style="margin:0 0 6px; font-size:34px;">📦</p>
        <h2 style="margin:0; font-size:34px; font-weight:700; color:#ffffff; line-height:1.15; font-family:Georgia,serif;">
          Woohoo! Your order<br><span style="color:#e9c46a;">is on the way</span>
        </h2>
        <p style="margin:12px 0 0; font-size:14px; color:#f7e8d0; font-style:italic;">Packed with love in the Himalayas</p>
      </td>
    </tr>

    <!-- GREETING -->
    <tr>
      <td style="padding:34px 44px 20px; text-align:center; background:#faf7f2;">
        <p style="margin:0; font-size:16px; color:#333; line-height:1.85; font-family:Georgia,serif;">
          Hi <strong>${name}</strong>,<br>
          Great news! Your order <strong style="color:#1e4030;">#${escapeHtml(orderId)}</strong> has been shipped and is making its way from the hills to your doorstep.
        </p>
      </td>
    </tr>

    <!-- SHIPMENT DETAILS -->
    <tr>
      <td style="padding:0 44px 24px; background:#faf7f2;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border:1px solid #e0d8cc; border-radius:6px;">
          <tr>
            <td style="padding:16px 20px; border-bottom:1px solid #eee5d6;">
              <p style="margin:0 0 4px; font-size:9px; letter-spacing:4px; color:#b07d2a; font-family:'Courier New',monospace; text-transform:uppercase;">Tracking Number</p>
              <p style="margin:0; font-size:16px; color:#1a1a1a; font-weight:700; font-family:'Courier New',monospace; letter-spacing:2px;">${escapeHtml(trackingId)}</p>
            </td>
          </tr>${
            courier
              ? `
          <tr>
            <td style="padding:16px 20px; border-bottom:1px solid #eee5d6;">
              <p style="margin:0 0 4px; font-size:9px; letter-spacing:4px; color:#b07d2a; font-family:'Courier New',monospace; text-transform:uppercase;">Courier Partner</p>
              <p style="margin:0; font-size:14px; color:#1a1a1a; font-weight:700; font-family:Georgia,serif;">${escapeHtml(courier)}</p>
            </td>
          </tr>`
              : ''
          }${
            eta
              ? `
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 4px; font-size:9px; letter-spacing:4px; color:#b07d2a; font-family:'Courier New',monospace; text-transform:uppercase;">Expected Delivery</p>
              <p style="margin:0; font-size:14px; color:#1a1a1a; font-weight:700; font-family:Georgia,serif;">${escapeHtml(eta)}</p>
            </td>
          </tr>`
              : ''
          }
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:0 44px 30px; text-align:center; background:#faf7f2;">
        <a href="${trackingUrl}" style="display:inline-block; background:#1e4030; color:#ffffff; text-decoration:none; padding:15px 44px; font-size:11px; letter-spacing:4px; font-family:'Courier New',monospace; text-transform:uppercase; border-radius:4px;">Track My Order →</a>
        <p style="margin:12px 0 0; font-size:11px; color:#999; font-family:Georgia,serif; line-height:1.6;">
          Button not working? Copy this link:<br>
          <a href="${trackingUrl}" style="color:#8b1a1a; word-break:break-all;">${trackingUrl}</a>
        </p>
      </td>
    </tr>
${itemsBlock}
    <!-- NOTE -->
    <tr>
      <td style="background:#fff4ee; border-top:1px solid #e8ddd0; border-bottom:1px solid #e8ddd0; padding:22px 44px; text-align:center;">
        <p style="margin:0; font-size:14px; color:#333; line-height:1.8; font-style:italic; font-family:Georgia,serif;">
          Tracking updates can take a few hours to show after dispatch.<br>
          Questions? Just reply to this email or write to
          <a href="mailto:team@simdi.in" style="color:#8b1a1a; text-decoration:none; font-weight:700;">team@simdi.in</a>
        </p>
      </td>
    </tr>

    <!-- THANK YOU -->
    <tr>
      <td style="padding:26px 44px; text-align:center; background:#faf7f2;">
        <p style="margin:0; font-size:15px; color:#444; line-height:1.8; font-style:italic; font-family:Georgia,serif;">
          Thank you for supporting the women artisans and villages of Uttarakhand. 🏔️
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding:20px 36px; text-align:center; background:#1e4030;">
        <p style="margin:0 0 4px; font-size:10px; color:#c8dfc8; font-family:'Courier New',monospace; letter-spacing:2px; text-transform:uppercase;">Simdi · Chakisain, Pauri Garhwal · team@simdi.in</p>
        <p style="margin:4px 0 0; font-size:9px; color:#7aaa8a; font-family:'Courier New',monospace;">
          <a href="${SHOP_URL}" style="color:#7aaa8a; text-decoration:none;">simdi.in</a>
        </p>
      </td>
    </tr>

  </table>

</td></tr>
</table>

</body>
</html>
`;

  return { subject, html };
}

module.exports = buildOrderShippedEmail;