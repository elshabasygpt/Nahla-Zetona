import { prisma } from "@/lib/prisma";
import { getDictionary, Locale } from "@/lib/dictionary";
import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/features/ProductDetailsClient";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  const langs = ['ar', 'en'];
  return langs.flatMap(lang => products.map(p => ({ lang, slug: p.slug })));
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale; slug: string }> }
): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};

  const isAr = lang === 'ar';
  const name = isAr ? product.nameAr : product.nameEn;
  const desc = isAr ? product.descAr : product.descEn;
  const shortDesc = desc.slice(0, 160);
  const title = `${name} | ${isAr ? 'نحلة وزيتونة' : 'Bee & Olive'}`;
  const url = `${BASE_URL}/${lang}/shop/${slug}`;

  return {
    title,
    description: shortDesc,
    alternates: {
      canonical: url,
      languages: {
        ar: `${BASE_URL}/ar/shop/${slug}`,
        en: `${BASE_URL}/en/shop/${slug}`,
      },
    },
    openGraph: {
      title,
      description: shortDesc,
      url,
      siteName: isAr ? 'نحلة وزيتونة' : 'Bee & Olive',
      type: 'website',
      locale: isAr ? 'ar_EG' : 'en_US',
      images: product.img
        ? [{ url: product.img.startsWith('http') ? product.img : `${BASE_URL}${product.img}`, alt: name, width: 1200, height: 630 }]
        : [{ url: `${BASE_URL}/og-default.jpg`, alt: name, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: shortDesc,
      images: product.img
        ? [product.img.startsWith('http') ? product.img : `${BASE_URL}${product.img}`]
        : [`${BASE_URL}/og-default.jpg`],
    },
  };
}

export default async function ProductDetails({ params }: { params: Promise<{ lang: Locale, slug: string }> }) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) {
    notFound();
  }

  // Product JSON-LD Schema
  const isAr = lang === 'ar';
  const name = isAr ? product.nameAr : product.nameEn;
  const desc = isAr ? product.descAr : product.descEn;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: desc.slice(0, 500),
    image: product.img ? (product.img.startsWith('http') ? product.img : `${BASE_URL}${product.img}`) : undefined,
    url: `${BASE_URL}/${lang}/shop/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: isAr ? 'نحلة وزيتونة' : 'Bee & Olive',
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/${lang}/shop/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: isAr ? 'نحلة وزيتونة' : 'Bee & Olive',
      },
    },
    ...(product.originalPrice && {
      offers: {
        '@type': 'Offer',
        price: product.price.toFixed(2),
        priceCurrency: 'EGP',
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: 'https://schema.org/InStock',
      },
    }),
  };

  // BreadcrumbList Schema
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isAr ? 'الرئيسية' : 'Home', item: `${BASE_URL}/${lang}` },
      { '@type': 'ListItem', position: 2, name: isAr ? 'المتجر' : 'Shop', item: `${BASE_URL}/${lang}/shop` },
      { '@type': 'ListItem', position: 3, name, item: `${BASE_URL}/${lang}/shop/${slug}` },
    ],
  };

  return (
    <main className="bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProductDetailsClient 
        product={product} 
        dict={dict} 
        lang={lang} 
      />
    </main>
  );
}
