const nodemailer = require("nodemailer");
const template = require("./template");
// import { PROMO_CODE } from "./template.js";
const PROMO_CODE = 'FESTIVE10';

const smtpUser = "team@simdi.in";
const smtpPass = "KFh5MCe5kSzB";

if (!smtpPass) {
  throw new Error('Missing Zoho SMTP credentials. Set ZOHO_APP_PASSWORD in your environment before running sendMail.js.');
}

const transporter = nodemailer.createTransport({
 host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// 👇 emails list (private send)
const emails = [
  "yogeshmamgain2611@gmail.com"
];


async function sendBulk() {
  for (let email of emails) {
    try {
      await transporter.sendMail({
        from: '"SIMDI" <team@simdi.in>',
        to: email, // 👈 ek ek ko jayega (private)

        subject: `🪔 Festive Special: 10% off Pahadi goodness | ${PROMO_CODE}`,

        html: template,

        // 👇 spam kam karne ke liye
        headers: {
          "X-Mailer": "NodeMailer",
          "X-Priority": "3"
        }
      });

      console.log("✅ Sent to:", email);

    } catch (err) {
      console.log("❌ Error:", email, err);
    }
  }
}

sendBulk();