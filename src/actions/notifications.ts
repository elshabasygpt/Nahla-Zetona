'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function getUserNotifications() {
  const session = await getSession();
  if (!session || !session.id) return { success: false, error: 'Unauthorized' };

  try {
    const notifications = await prisma.notification.findMany({
      where: { customerId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return { success: true, notifications };
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return { success: false, error: 'Server error' };
  }
}

export async function markNotificationAsRead(id: number) {
  const session = await getSession();
  if (!session || !session.id) return { success: false, error: 'Unauthorized' };

  try {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.customerId !== session.id) {
      return { success: false, error: 'Unauthorized or not found' };
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  const session = await getSession();
  if (!session || !session.id) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.notification.updateMany({
      where: { customerId: session.id, isRead: false },
      data: { isRead: true }
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
