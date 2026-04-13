'use server';

import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import * as bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'missing_fields' };
    }

    const user = await prisma.customer.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return { success: false, error: 'invalid_credentials' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return { success: false, error: 'invalid_credentials' };
    }

    // Create session
    const sessionToken = await encrypt({ id: user.id, role: user.role, email: user.email });
    
    const c = await cookies();
    c.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return { 
      success: true, 
      redirectUrl: user.role === 'ADMIN' ? '/admin/orders' : '/profile' 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'server_error' };
  }
}

export async function registerAction(formData: FormData) {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    if (!firstName || !lastName || !email || !password) {
      return { success: false, error: 'missing_fields' };
    }

    const existingUser = await prisma.customer.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, error: 'email_exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: 'USER'
      }
    });

    // Auto-login
    const sessionToken = await encrypt({ id: newUser.id, role: newUser.role, email: newUser.email });
    
    const c = await cookies();
    c.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return { success: true };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'server_error' };
  }
}

export async function logoutAction() {
  const c = await cookies();
  c.delete('session');
  return { success: true };
}

export async function forgotPasswordAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    
    if (!email) return { success: false, error: 'missing_email' };

    const user = await prisma.customer.findUnique({ where: { email } });
    if (!user) {
      // For security, do not reveal if email exists. Still return success.
      return { success: true };
    }

    // Embed current password hash inside JWT. Once password changes, the hash changes, invalidating previous tokens if checked carefully. We'll simply use standard expiration.
    const resetToken = await encrypt({ id: user.id, email: user.email, type: 'password_reset' });

    // Since we don't have the actual email sending logic yet, we simulate it.
    // In production, we would use nodemailer here:
    console.log(`[Stateless Auth] Password Reset Link for ${email}: /reset-password?token=${resetToken}`);
    // await sendEmail(email, "Reset Password", `Click: /reset-password?token=${resetToken}`);

    return { success: true };
  } catch (err) {
    console.error('Forgot password error:', err);
    return { success: false, error: 'server_error' };
  }
}

