import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/email';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ['PENDING', 'PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid Order ID" }, { status: 400 });
    }

    const orderToUpdate = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true }
    });

    if (!orderToUpdate) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    // Send email notification async if status changed
    if (orderToUpdate.status !== status && orderToUpdate.customer.email && !orderToUpdate.customer.email.includes('@guest.nahlastore.local')) {
      sendOrderStatusEmail(
        orderToUpdate.customer.email, 
        updatedOrder.orderNumber, 
        orderToUpdate.status, 
        status, 
        'ar' // Defaulting to AR for emails, or maybe get from admin/config later
      ).catch(console.error);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
