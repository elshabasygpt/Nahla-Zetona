import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'nahlazetona-indexnow-key';

export async function POST() {
  try {
    const langs = ['ar', 'en'];
    const staticPaths = ['', '/shop', '/blog', '/our-story', '/contact', '/offers'];

    // Build static URLs
    const staticUrls = langs.flatMap(lang =>
      staticPaths.map(path => `${BASE_URL}/${lang}${path}`)
    );

    // Build product URLs dynamically
    const products = await prisma.product.findMany({ select: { slug: true } });
    const productUrls = langs.flatMap(lang =>
      products.map(p => `${BASE_URL}/${lang}/shop/${p.slug}`)
    );

    const allUrls = [...staticUrls, ...productUrls];

    // === Submit to IndexNow (Bing + Yandex + DuckDuckGo) ===
    let indexNowResult = null;
    try {
      const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: new URL(BASE_URL).hostname,
          key: INDEXNOW_KEY,
          keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
          urlList: allUrls.slice(0, 100), // IndexNow max 100 per request
        }),
      });
      indexNowResult = { status: indexNowRes.status, ok: indexNowRes.ok };
    } catch (e: any) {
      indexNowResult = { error: e.message };
    }

    // === Ping Google via Sitemap ===
    let googlePingResult = null;
    try {
      const googleRes = await fetch(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`,
        { method: 'GET' }
      );
      googlePingResult = { status: googleRes.status, ok: googleRes.ok };
    } catch (e: any) {
      googlePingResult = { error: e.message };
    }

    // === Ping Bing via Sitemap ===
    let bingPingResult = null;
    try {
      const bingRes = await fetch(
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`,
        { method: 'GET' }
      );
      bingPingResult = { status: bingRes.status, ok: bingRes.ok };
    } catch (e: any) {
      bingPingResult = { error: e.message };
    }

    return NextResponse.json({
      success: true,
      urlsSubmitted: allUrls.length,
      urls: allUrls,
      sitemapUrl: `${BASE_URL}/sitemap.xml`,
      engines: {
        indexNow: indexNowResult,
        google: googlePingResult,
        bing: bingPingResult,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('SEO Ping error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
