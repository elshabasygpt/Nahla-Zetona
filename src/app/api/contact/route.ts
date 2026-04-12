import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let transporter;
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Using Ethereal Fake SMTP for Contact Form...');
    }

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0f766e;">رسالة جديدة من صفحة اتصل بنا</h2>
        <div style="background: #fdfbf7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>الاسم:</strong> ${name}</p>
          <p><strong>البريد الإلكتروني:</strong> ${email}</p>
          <p><strong>رقم الموبايل:</strong> ${phone || 'لم يتم إدخاله'}</p>
          <p><strong>الموضوع:</strong> ${subject || 'بدون موضوع'}</p>
        </div>
        <div style="padding: 15px; border-left: 4px solid #0f766e; background: #fafafa;">
          <h4 style="margin-top: 0;">نص الرسالة:</h4>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.ADMIN_EMAIL || "admin@store.local", // The store owner's email
      subject: `استفسار جديد: ${subject || 'رسالة من زائر'}`,
      html: htmlContent,
      replyTo: email
    });

    console.log("Contact Message sent: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log("Contact Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: error.message || 'Error sending message' }, { status: 500 });
  }
}
