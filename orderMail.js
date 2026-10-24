const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: "team@simdi.in",
    pass: "KFh5MCe5kSzB"
  }
});

const customers = [
  {
    name: "Surbhi",
    email: "surbhij07@gmail.com",
    orderNumber: "ORD-2026-000160",
    orderDate: "27 Apr 2026",
    expectedDelivery: "02 May 2026",
    items: [
      { name: "Pahadi Sea Buckthorn Juice (Himalayan Berry Juice) (L)", qty: 1, price: "₹1,199" }
    ],
    subtotal: "₹1,199",
    discount: "₹0",
    handling: "₹59.95",
    total: "₹1,258.95",
    address: "Surbhi Jain, C 2501 Yashwin Orrizonte, Kharadi, Pune, Maharashtra 411014"
  }
];

const getTemplate = (customer) => `
<!DOCTYPE html>
<html>
<body style="margin:0;background:#f5f5f5;font-family:Arial, sans-serif">

<table width="100%" align="center">
<tr><td align="center">

<table width="600" style="background:#ffffff;border-radius:12px;overflow:hidden">

<tr>
<td style="background:#1f4d2e;padding:20px;text-align:center">
  <img src="https://www.simdi.in/logo.jpeg" width="110" alt="SIMDI">
  <p style="color:#ffffff;font-size:12px;margin-top:6px">Be Pahadi • Buy Pahadi</p>
</td>
</tr>

<tr>
<td style="padding:25px">

<h2 style="color:#1f4d2e">Order Confirmed ✅</h2>

<p style="font-size:14px;color:#444">
Hi ${customer.name},<br><br>
Thank you for placing your order with <b>SIMDI 🌿</b>.<br>
We've successfully received your order and started processing it.
</p>

<div style="background:#f7f9f8;padding:15px;border-radius:8px;margin-top:15px">

  <h3 style="color:#1f4d2e;margin:0 0 10px 0">🧾 Order Details</h3>

  <p style="font-size:13px;color:#666;margin:0 0 8px 0">
    Order #: <b>${customer.orderNumber}</b> &nbsp;|&nbsp; Date: <b>${customer.orderDate}</b>
  </p>

  <table width="100%" style="font-size:14px;color:#333;border-collapse:collapse">
    <tr style="border-bottom:1px solid #e0e0e0">
      <td style="padding:6px 0"><b>Product</b></td>
      <td style="padding:6px 0;text-align:center"><b>Qty</b></td>
      <td style="padding:6px 0;text-align:right"><b>Price</b></td>
    </tr>
    ${customer.items.map(item => `
    <tr>
      <td style="padding:8px 0">${item.name}</td>
      <td style="padding:8px 0;text-align:center">${item.qty}</td>
      <td style="padding:8px 0;text-align:right">${item.price}</td>
    </tr>`).join('')}
  </table>

  <hr style="border:none;border-top:1px solid #ddd;margin:10px 0">

  <table width="100%" style="font-size:14px;color:#333">
    <tr><td>Subtotal</td><td style="text-align:right">${customer.subtotal}</td></tr>
    <tr><td>Discount</td><td style="text-align:right">- ${customer.discount}</td></tr>
    <tr><td>Handling Charges (5%)</td><td style="text-align:right">${customer.handling}</td></tr>
    <tr>
      <td style="font-weight:bold;color:#1f4d2e;padding-top:6px">Total Paid</td>
      <td style="font-weight:bold;color:#1f4d2e;text-align:right;padding-top:6px">${customer.total}</td>
    </tr>
  </table>

</div>

<div style="background:#f7f9f8;padding:12px 15px;border-radius:8px;margin-top:12px;font-size:13px;color:#444">
  📍 <b>Delivery Address:</b><br>${customer.address}
</div>

<p style="font-size:14px;color:#444;margin-top:15px">
  📦 Expected Delivery: <b>${customer.expectedDelivery}</b><br>
  Your order will be carefully packed and dispatched soon.
</p>

<div style="text-align:center;margin:15px 0">
  <a href="https://www.simdi.in/orders"
  style="background:#1f4d2e;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:6px">
  Track Your Order
  </a>
</div>

<div style="text-align:center;margin-top:20px">
  <a href="https://www.simdi.in"
  style="background:#b58e58;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:6px;font-weight:bold">
  Explore More Products
  </a>
</div>

<p style="margin-top:20px;font-size:14px">
  Warm regards,<br>
  <b>Team SIMDI 🌿</b>
</p>

</td>
</tr>

<tr>
<td style="background:#1f4d2e;color:#ffffff;text-align:center;padding:15px;font-size:12px">
Bringing authentic Himalayan products directly to your home ❤️
</td>
</tr>

</table>
</td></tr>
</table>

</body>
</html>
`;

async function sendOrderMails() {
  for (let customer of customers) {
    try {
      await transporter.sendMail({
        from: '"SIMDI" <team@simdi.in>',
        to: customer.email,
        subject: `🌿 ${customer.name}, Your SIMDI Order is Confirmed`,
        html: getTemplate(customer)
      });

      console.log("✅ Sent to:", customer.email);
      await new Promise(res => setTimeout(res, 3000));

    } catch (err) {
      console.log("❌ Error:", customer.email, err);
    }
  }
}

sendOrderMails();