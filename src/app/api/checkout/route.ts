import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      firstName, lastName, email, phone, city, address, notes,
      items, subtotal, discount, promoCode, shippingCost, shippingMethod, paymentMethod, lang 
    } = body;

    // Basic validation
    if (!firstName || !lastName || !phone || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const finalDiscount = discount || 0;
    const finalShippingCost = shippingCost || 0;
    const computedTotal = subtotal + finalShippingCost - finalDiscount;
    
    // Generate order number
    const orderNumber = `BNO-${Math.floor(10000 + Math.random() * 90000)}`;

    // Process inside a transaction
    const order = await prisma.$transaction(async (tx) => {
      let customerId;
      
      // Upsert Customer (Guest or returning) based on Phone or Email
      // Since email is optional now, we check if email is provided, else use phone as unique identifier conceptually, but the schema requires an email.
      // Wait, schema requires email @unique! If email is optional, we must generate a dummy email if empty.
      const customerEmail = email && email.trim() !== '' ? email : `${phone}@guest.nahlastore.local`;

      const customer = await tx.customer.upsert({
        where: { email: customerEmail },
        update: {
          firstName,
          lastName,
          phone,
        },
        create: {
          email: customerEmail,
          firstName,
          lastName,
          phone,
        }
      });
      customerId = customer.id;

      // Create Order
      const newOrder = await (tx as any).order.create({
        data: {
          orderNumber,
          customerId: customerId,
          subtotal: subtotal,
          totalAmount: computedTotal,
          discount: finalDiscount,
          promoCode: promoCode || null,
          paymentMethod: paymentMethod || 'cod',
          shippingMethod: shippingMethod || 'bosta',
          shippingAddress: address,
          city: city,
          notes: notes || null,
          status: paymentMethod === 'cod' ? 'PENDING' : 'PENDING_PAYMENT',
          items: {
            create: items.map((item: any) => {
              // Extract numeric ID from string if needed (e.g., '1-250ml' -> 1)
              const productId = parseInt(item.id.toString().split('-')[0]);
              return {
                productId: isNaN(productId) ? 1 : productId, // fallback if weird ID format
                quantity: item.quantity,
                price: item.price
              };
            })
          }
        }
      });

      return newOrder;
    });

    // Send order confirmation email asynchronously
    if (email && email.trim() !== '') {
      sendOrderConfirmationEmail(email, order.orderNumber, computedTotal, lang || 'ar').catch(e => {
        console.error("Failed to send order email:", e);
      });
    }

    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
