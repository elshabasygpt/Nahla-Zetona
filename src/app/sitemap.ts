import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const langs = ['ar', 'en'];

  // Static pages
  const staticPages = [
    '',
    '/shop',
    '/blog',
    '/our-story',
    '/contact',
    '/offers',
  ];

  const staticEntries: MetadataRoute.Sitemap = [];
  for (const lang of langs) {
    for (const page of staticPages) {
      staticEntries.push({
        url: `${BASE_URL}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : page === '/shop' ? 0.9 : 0.7,
        alternates: {
          languages: {
            ar: `${BASE_URL}/ar${page}`,
            en: `${BASE_URL}/en${page}`,
          },
        },
      });
    }
  }

  // Dynamic product pages
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
    });

    for (const lang of langs) {
      for (const product of products) {
        productEntries.push({
          url: `${BASE_URL}/${lang}/shop/${product.slug}`,
          lastModified: product.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              ar: `${BASE_URL}/ar/shop/${product.slug}`,
              en: `${BASE_URL}/en/shop/${product.slug}`,
            },
          },
        });
      }
    }
  } catch (e) {
    console.error('Sitemap: Failed to fetch products', e);
  }

  return [...staticEntries, ...productEntries];
}
