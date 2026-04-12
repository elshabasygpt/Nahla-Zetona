import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Auto-generate slug if not provided
    const slug = body.slug || body.titleEn?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `post-${Date.now()}`;
    
    const article = await prisma.article.create({
      data: {
        slug,
        titleAr: body.titleAr,
        titleEn: body.titleEn,
        contentAr: body.contentAr,
        contentEn: body.contentEn,
        excerptAr: body.excerptAr || '',
        excerptEn: body.excerptEn || '',
        coverImage: body.coverImage || null,
        published: body.published ?? true,
        author: body.author || 'نحلة وزيتونة',
      }
    });
    
    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error("Failed to create article:", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
