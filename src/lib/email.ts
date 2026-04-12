import nodemailer from 'nodemailer';

export async function sendOrderConfirmationEmail(orderEmail: string, orderNumber: string, total: number, lang: string) {
  try {
    // 1. Configure the transporter
    // We fall back to Ethereal Email (a free fake SMTP testing service) if no real SMTP is provided in env
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
      // Create a test account dynamically for Ethereal
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
      console.log('Using Ethereal Fake SMTP for Testing...');
    }

    // 2. Prepare HTML content
    const htmlAr = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0f766e; text-align: center;">شکراً لطلبك من متجرنا!</h2>
        <p>لقد استلمنا طلبك بنجاح وهو الآن قيد المراجعة لتحضيره للشحن.</p>
        <div style="background: #fdfbf7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
          <p><strong>الإجمالي المطلوب سداده:</strong> ${total} ج.م</p>
        </div>
        <p>سنقوم بالتواصل معك قريباً لتأكيد موعد التسليم.</p>
        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">نحتاج مساعدة؟ تواصل معنا عبر واتساب.</p>
      </div>
    `;

    const htmlEn = `
      <div dir="ltr" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0f766e; text-align: center;">Thank you for your order!</h2>
        <p>We have successfully received your order and it is currently being processed.</p>
        <div style="background: #fdfbf7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total Amount:</strong> ${total} EGP</p>
        </div>
        <p>We will contact you shortly to arrange delivery.</p>
        <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">Need help? Contact us via WhatsApp.</p>
      </div>
    `;

    // 3. Send email
    const info = await transporter.sendMail({
      from: '"متجرنا" <no-reply@store.com>',
      to: orderEmail,
      subject: lang === 'ar' ? `تأكيد طلبك رقم: ${orderNumber}` : `Order Confirmation: ${orderNumber}`,
      html: lang === 'ar' ? htmlAr : htmlEn,
    });

    console.log("Message sent: %s", info.messageId);
    
    if (!process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, error };
  }
}

export async function sendOrderStatusEmail(orderEmail: string, orderNumber: string, previousStatus: string, newStatus: string, lang: string) {
  try {
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
    }

    const statusMapAr: Record<string, string> = {
      'SHIPPED': 'تم شحن طلبك وهو في طريقه إليك!',
      'DELIVERED': 'تم تسليم الطلب بنجاح، نتمنى أن ينال إعجابكم!',
      'CANCELLED': 'تم إلغاء طلبك للأسف.',
      'PROCESSING': 'الطلب قيد التجهيز الآن.'
    };
    
    const statusMapEn: Record<string, string> = {
      'SHIPPED': 'Your order has been shipped and is on its way!',
      'DELIVERED': 'Your order has been successfully delivered, enjoy!',
      'CANCELLED': 'Your order has unfortunately been cancelled.',
      'PROCESSING': 'Your order is currently being processed.'
    };

    const statusMessage = lang === 'ar' ? (statusMapAr[newStatus] || newStatus) : (statusMapEn[newStatus] || newStatus);

    const htmlAr = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0f766e; text-align: center;">تحديث لحالة طلبك</h2>
        <div style="background: #fdfbf7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>الطلب رقم:</strong> ${orderNumber}</p>
          <p><strong>تحديث:</strong> <span style="color: #d97706; font-weight: bold;">${statusMessage}</span></p>
        </div>
        <p>نحن نعمل دائماً لرضاكم.</p>
      </div>
    `;

    const htmlEn = `
      <div dir="ltr" style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0f766e; text-align: center;">Order Status Update</h2>
        <div style="background: #fdfbf7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Update:</strong> <span style="color: #d97706; font-weight: bold;">${statusMessage}</span></p>
        </div>
        <p>We are always working for your satisfaction.</p>
      </div>
    `;

    const subject = lang === 'ar' ? `تحديث طلبك: ${orderNumber}` : `Order Update: ${orderNumber}`;

    const info = await transporter.sendMail({
      from: '"نحلة وزيتونة" <no-reply@store.com>',
      to: orderEmail,
      subject: subject,
      html: lang === 'ar' ? htmlAr : htmlEn,
    });

    if (!process.env.SMTP_HOST) {
      console.log("Status Update Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    return { success: true };
  } catch (error) {
    console.error("Status Email Error:", error);
    return { success: false };
  }
}
