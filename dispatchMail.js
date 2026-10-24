const nodemailer = require("nodemailer");

// ✅ transporter
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: "team@simdi.in",
    pass: "KFh5MCe5kSzB"
  }
});

// ✅ TEMPLATE (DISPATCH 🔥)
const getTemplate = (customer) => `
<!DOCTYPE html>
<html>
<body style="margin:0;background:#f5f5f5;font-family:Arial, sans-serif">

<table width="100%" align="center">
<tr>
<td align="center">

<table width="600" style="background:#ffffff;border-radius:12px;overflow:hidden">

<!-- HEADER -->
<tr>
<td style="background:#1f4d2e;padding:20px;text-align:center">
  <img src="https://www.simdi.in/logo.jpeg" width="110">
  <p style="color:#fff;font-size:12px;margin-top:6px">
    Be Pahadi • Buy Pahadi
  </p>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:25px">

<h2 style="color:#1f4d2e;margin-bottom:10px">
  Order Dispatched 🚚
</h2>

<p style="color:#444;font-size:14px;line-height:1.6">
  Hi ${customer.name}, <br><br>

  Great news! 🙌 Your order has been <b>dispatched successfully</b>.  
  It is on its way to you and will reach soon 🚀
</p>

<!-- PRODUCT BOX -->
<div style="background:#f7f9f8;padding:15px;border-radius:8px;margin-top:15px">
<b>Product:</b> ${customer.product} <br>
<b>Total Paid:</b> ₹${customer.total}
</div>

<!-- TRACKING -->
<div style="text-align:center;margin-top:25px">

<h3 style="color:#1f4d2e;margin-bottom:5px">
  📦 Track Your Order
</h3>

<p style="color:#555;font-size:14px">
  Shipped via <b>India Post (Speed Post)</b>
</p>

<p style="margin-top:10px;font-size:16px;font-weight:bold;color:#1f4d2e">
  Tracking ID: ${customer.tracking}
</p>

<div style="margin-top:15px">
<a href="https://www.indiapost.gov.in/"
style="background:#b58e58;color:#fff;padding:12px 25px;text-decoration:none;border-radius:6px;font-weight:bold">
Track Shipment
</a>
</div>

<p style="font-size:12px;color:#777;margin-top:10px">
  You can use this tracking ID on India Post website
</p>

</div>

<!-- CTA -->
<div style="text-align:center;margin-top:25px">
<a href="https://www.simdi.in"
style="background:#1f4d2e;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px">
Explore More Products
</a>
</div>

</td>
</tr>

<!-- BRAND SECTION -->
<tr>
<td style="background:#1f4d2e;color:#ffffff;text-align:center;padding:20px">

<p style="margin:0;font-size:15px;font-weight:bold">
  SIMDI — From Pahad to Your Plate 🌿
</p>

<p style="margin:8px 0 0 0;font-size:13px;color:#dcdcdc">
  Handpicked • Natural • Straight from Himalayas
</p>

<p style="margin:10px 0 0 0;font-size:12px;color:#bfbfbf">
  Thank you for supporting local farmers ❤️
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

// ✅ customer
const customer = {
  name: "Rajvardhan",
  email: "ranachiragsingh2444@gmail.com",
  product: "Pisyu Loon (250g)",
  total: "172.99",
  tracking: "EU885585903IN"
};

// ✅ send mail
async function sendMail() {
  try {
    await transporter.sendMail({
      from: '"SIMDI" <team@simdi.in>',
      to: "ranachiragsingh2444@gmail.com",

      subject: "📦 Your SIMDI Order Has Been Dispatched",

      html: getTemplate(customer)
    });

    console.log("✅ Dispatch mail sent");
  } catch (err) {
    console.log(err);
  }
}

sendMail();