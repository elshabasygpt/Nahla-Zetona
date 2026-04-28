import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const password = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.customer.upsert({
      where: { email: 'admin@nahlazetona.com' },
      update: {
        password,
        role: 'ADMIN',
      },
      create: {
        email: 'admin@nahlazetona.com',
        password,
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
      },
    });

    return NextResponse.json({ success: true, email: admin.email, message: "Admin user created successfully! Please delete this route in production." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to setup admin" }, { status: 500 });
  }
}
