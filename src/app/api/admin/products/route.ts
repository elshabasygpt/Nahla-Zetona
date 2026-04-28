import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const product = await prisma.product.create({
      data: {
        slug: data.slug,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descAr: data.descAr,
        descEn: data.descEn,
        price: data.price,
        originalPrice: data.originalPrice,
        badgeAr: data.badgeAr || null,
        badgeEn: data.badgeEn || null,
        isBundle: data.isBundle,
        img: data.img || null,
      }
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Create Product Error:", error);
    return NextResponse.json({ error: error.message || 'Error creating product' }, { status: 500 });
  }
}
