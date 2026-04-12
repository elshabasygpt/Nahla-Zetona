import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
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
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: error.message || 'Error updating product' }, { status: 500 });
  }
}
