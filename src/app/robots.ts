import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ar/', '/en/'],
        disallow: [
          '/admin',
          '/ar/admin',
          '/en/admin',
          '/api/',
          '/ar/checkout',
          '/en/checkout',
          '/ar/login',
          '/en/login',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
