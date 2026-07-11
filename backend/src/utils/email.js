import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (env.smtpHost && env.smtpUser) {
    // Use configured SMTP (e.g. Gmail, SendGrid, Mailtrap)
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
  } else {
    // Auto-create a free Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log("📧 Using Ethereal test email account:", testAccount.user);
  }

  return transporter;
}

export async function sendEmail({ to, subject, message, html }) {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: `"ShowcasePro" <noreply@showcasepro.dev>`,
    to,
    subject,
    text: message || "",
    html: html || `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#2563eb;">${subject}</h2>
      <p style="color:#334155;line-height:1.6;">${message}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
      <p style="color:#94a3b8;font-size:12px;">ShowcasePro Portfolio Platform</p>
    </div>`
  });

  // In development with Ethereal, log the preview URL so you can view the email
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("📧 Preview email at:", previewUrl);
  }

  return info;
}

