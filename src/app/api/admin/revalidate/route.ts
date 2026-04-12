import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST() {
  try {
    // Revalidate all major routes in both languages
    const langs = ['ar', 'en'];
    const staticPaths = ['', '/shop', '/blog', '/our-story', '/contact', '/offers'];

    for (const lang of langs) {
      for (const path of staticPaths) {
        revalidatePath(`/${lang}${path}`);
      }
      // Revalidate admin dashboard
      revalidatePath(`/${lang}/admin`);
      revalidatePath(`/${lang}/admin/products`);
    }

    // Revalidate site-wide layout (settings, colors, etc.)
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الكاش بنجاح',
      revalidated: langs.flatMap(lang => staticPaths.map(p => `/${lang}${p}`)),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
