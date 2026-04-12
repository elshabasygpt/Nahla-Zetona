import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    
    // Website base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nahlazetona.com';

    // Generate XML structure according to Facebook Catalog requirements
    let xml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Nahla &amp; Zetona Facebook Feed</title>
    <link>${baseUrl}</link>
    <description>Product Catalog for Meta / Facebook Ads</description>
`;

    products.forEach(product => {
      // Create XML safe texts
      const safeName = (product.nameAr || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const safeDesc = (product.descAr || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const productUrl = `${baseUrl}/ar/shop/${product.slug}`;
      const imageUrl = product.img?.startsWith('http') ? product.img : `${baseUrl}${product.img}`;

      xml += `    <item>
      <g:id>${product.id}</g:id>
      <g:title>${safeName}</g:title>
      <g:description>${safeDesc}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:brand>نحلة وزيتونة</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${product.originalPrice || product.price} EGP</g:price>
      ${product.originalPrice ? `<g:sale_price>${product.price} EGP</g:sale_price>` : ''}
    </item>\n`;
    });

    xml += `  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });

  } catch (error) {
    console.error("Facebook Feed Generator Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
