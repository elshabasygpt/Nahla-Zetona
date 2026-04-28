'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { hash, compare } from 'bcryptjs';

export async function updateProfileDetails(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.id) return { success: false, error: 'Unauthorized' };

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;

    if (!firstName || !lastName || !phone) {
      return { success: false, error: 'missing_fields' };
    }

    await prisma.customer.update({
      where: { id: session.id },
      data: { firstName, lastName, phone }
    });

    return { success: true };
  } catch (err) {
    console.error('Update Profile Error:', err);
    return { success: false, error: 'server_error' };
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.id) return { success: false, error: 'Unauthorized' };

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!currentPassword || !newPassword) {
      return { success: false, error: 'missing_fields' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'weak_password' };
    }

    const user = await prisma.customer.findUnique({
      where: { id: session.id }
    });

    if (!user || !user.password) {
      return { success: false, error: 'invalid_user' };
    }

    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: 'incorrect_password' };
    }

    const hashedPassword = await hash(newPassword, 10);
    
    await prisma.customer.update({
      where: { id: session.id },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (err) {
    console.error('Update Password Error:', err);
    return { success: false, error: 'server_error' };
  }
}
