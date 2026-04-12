import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) return NextResponse.json([]);
  
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { nameAr: { contains: q, mode: 'insensitive' } },
          { nameEn: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 8,
      select: {
        slug: true,
        nameAr: true,
        nameEn: true,
        price: true,
        originalPrice: true,
        img: true
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
