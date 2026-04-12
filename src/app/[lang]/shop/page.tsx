import Image from "next/image";
import Link from "next/link";
import { getDictionary, Locale } from "@/lib/dictionary";
import AddToCartButton from "@/components/features/AddToCartButton";
import ShopGrid from "@/components/features/ShopGrid";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === 'ar';
  const title = isAr ? 'المتجر — تسوق عسل وزيت زيتون طبيعي' : 'Shop — Natural Honey & Olive Oil';
  const description = isAr
    ? 'تسوق مجموعتنا الكاملة من العسل الطبيعي وزيت الزيتون البكر الممتاز بأفضل الأسعار'
    : 'Shop our full collection of natural honey and premium cold-pressed olive oils at the best prices';
  const url = `${BASE_URL}/${lang}/shop`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ar: `${BASE_URL}/ar/shop`, en: `${BASE_URL}/en/shop` },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: isAr ? 'ar_EG' : 'en_US',
      siteName: isAr ? 'نحلة وزيتونة' : 'Bee & Olive',
    },
  };
}

export default async function Shop({ params, searchParams }: { params: Promise<{ lang: Locale }>, searchParams?: Promise<{ q?: string }> }) {
  const { lang } = await params;
  const sq = searchParams ? await searchParams : {};
  const query = sq.q || '';
  const dict = await getDictionary(lang);
  
  // Fetch real products from PostgreSQL (with search filter if exists)
  const dbProducts = await prisma.product.findMany({
    where: query ? {
        OR: [
          { nameAr: { contains: query, mode: 'insensitive' } },
          { nameEn: { contains: query, mode: 'insensitive' } },
          { descAr: { contains: query, mode: 'insensitive' } },
          { descEn: { contains: query, mode: 'insensitive' } }
        ]
      } : undefined,
    orderBy: { createdAt: 'desc' }
  });

  // Map to the simple UI format
  const mappedProducts = dbProducts.map(p => ({
    id: p.id.toString(),
    name: lang === 'ar' ? p.nameAr : p.nameEn,
    desc: lang === 'ar' ? p.descAr : p.descEn,
    price: p.price.toString(),
    originalPrice: p.originalPrice ? p.originalPrice.toString() : undefined,
    img: p.img,
    badge: lang === 'ar' ? p.badgeAr : p.badgeEn,
    isBundle: p.isBundle,
    slug: p.slug
  }));
  
  // Also create distinct categories dynamically based on names. Or we can just pass products.
  
  return (
    <main>

      <section className="max-w-7xl mx-auto px-8 pt-36 pb-12 md:pt-40">
        <ShopGrid dict={dict} products={mappedProducts} lang={lang} />
      </section>

      {/* Wellness Banner */}
      <section className="max-w-7xl mx-auto px-8 my-20">
        <div className="bg-primary rounded-3xl overflow-hidden relative min-h-[400px] flex items-center">
          <div className="absolute inset-0 z-0 opacity-40">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoqAWh9L13ryhFzvJ2owSfTY1zWDypsMXg2l_vjoOb5UcJwU_4MccimWAVO_4El4pncPsnZfczPAMXxKymPC37J_W0aWsWUCX-XUWe8ZWYNxC06oO_lcVKaSkX0-fdlJaezc1V-yYpN2AqNxaSBg3s1OzJFK-1qApWuBjgywQfIEK3MaDxl1boJlB4uvRy2geD7uWfFs3Ihr6MZgIEPq3wvB-M2uHqShk2h7HvYO7nYPXk94m14dhHTQni-4uMDSuJzJh07INF0U8" alt="Honeycomb patterns" />
          </div>
          <div className="relative z-10 p-12 md:p-20 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-serif text-on-primary mb-6 leading-tight">{dict.shop.banner.title}</h2>
            <p className="text-primary-fixed mb-8 text-lg">{dict.shop.banner.desc}</p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-full px-6 py-4 flex-1 backdrop-blur-md focus:ring-2 focus:ring-secondary outline-none" placeholder={dict.shop.banner.placeholder} type="email" />
              <button type="submit" className="bg-secondary-container text-tertiary px-10 py-4 rounded-full font-bold hover:bg-secondary transition-colors uppercase tracking-widest text-sm">{dict.shop.banner.btn}</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
