import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ valid: false, error: "Empty code" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid or inactive promo code" });
    }

    if (promo.validUntil && new Date() > promo.validUntil) {
      return NextResponse.json({ valid: false, error: "Promo code expired" });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: "Promo code usage limit reached" });
    }

    return NextResponse.json({ 
      valid: true,
      discount: promo.discount,
      isPercent: promo.isPercent 
    });

  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}
