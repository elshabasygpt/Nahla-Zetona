import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await (prisma as any).siteSettings.findFirst();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // Whitelist all known setting fields (prevents saving arbitrary keys)
    const allowedFields = [
      'storeNameAr', 'storeNameEn', 'logoUrl',
      'primaryColor', 'secondaryColor', 'textColor', 'headingColor', 'mutedColor', 'priceColor',
      'currencyAr', 'currencyEn',
      'whatsappNumber', 'facebookUrl', 'instagramUrl',
      'googleVerification', 'gaId',
      'facebookPixelId', 'tiktokPixelId',
    ];

    const safeData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        safeData[key] = body[key] === '' ? null : body[key];
      }
    }

    const updatedSettings = await (prisma as any).siteSettings.upsert({
      where: { id: 1 },
      update: safeData,
      create: { ...safeData, id: 1 },
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
