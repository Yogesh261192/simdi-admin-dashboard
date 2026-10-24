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

// ✅ TEMPLATE (UPGRADED 🔥)
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
  Order Delivered 🎉
</h2>

<p style="color:#444;font-size:14px;line-height:1.6">
  Hi ${customer.name}, <br><br>
  Your order has been successfully delivered 🙌 <br>
  We hope you loved the authentic taste ❤️
</p>

<!-- PRODUCT BOX -->
<div style="background:#f7f9f8;padding:15px;border-radius:8px;margin-top:15px">
<b>Product:</b> ${customer.product} <br>
<b>Total Paid:</b> ₹${customer.total}
</div>

<!-- REVIEW SECTION -->
<div style="text-align:center;margin-top:30px">

<h3 style="color:#1f4d2e;margin-bottom:5px">
  ⭐ Loved your order?
</h3>

<p style="color:#555;font-size:14px">
  Your feedback helps us grow and reach more people ❤️
</p>

<p style="color:#1f4d2e;font-weight:bold;margin-top:10px">
  Scan & leave a quick review on Google
</p>

<img src="cid:qrcode" width="150" style="margin:15px 0">

<p style="font-size:12px;color:#777">
  It just takes a few seconds 🙌
</p>

</div>

<!-- CTA -->
<div style="text-align:center;margin-top:20px">
<a href="https://www.simdi.in"
style="background:#b58e58;color:#fff;padding:12px 25px;text-decoration:none;border-radius:6px;font-weight:bold">
Shop Again
</a>
</div>

</td>
</tr>

<!-- BRAND SECTION 🔥 -->
<tr>
<td style="background:#1f4d2e;color:#ffffff;text-align:center;padding:20px">

<p style="margin:0;font-size:15px;font-weight:bold">
  SIMDI — Be Pahadi Buy Pahadi 🌿
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
  name: "Pankaj",
  email: "pankajprachi72@gmail.com",
  product: "1Kg Pahadi Shahad and 1Kg Bal Mithai",
  total: "1782.99"
};

// ✅ send mail
async function sendMail() {
  try {
    await transporter.sendMail({
      from: '"SIMDI" <team@simdi.in>',
      to: "pankajprachi72@gmail.com",


      subject: "Your SIMDI Order Delivered 🎉",

      html: getTemplate(customer),

      attachments: [
        {
          filename: "qr.png",
          path: "./qr.png",
          cid: "qrcode"
        }
      ]
    });

    console.log("✅ Mail sent");
  } catch (err) {
    console.log(err);
  }
}

sendMail();