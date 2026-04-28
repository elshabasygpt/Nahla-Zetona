import { getDictionary, Locale } from "@/lib/dictionary";
import AddToCartButton from "@/components/features/AddToCartButton";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import NewsletterForm from "@/components/features/NewsletterForm";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === 'ar';
  const title = isAr ? 'العروض والتخفيضات — نحلة وزيتونة' : 'Offers & Deals — Bee & Olive';
  const description = isAr
    ? 'استكشف أفضل عروض وتخفيضات العسل الطبيعي وزيت الزيتون — عروض محدودة الوقت بأسعار لا تفوتك!'
    : 'Explore the best deals on natural honey and olive oil — limited time offers at unbeatable prices!';
  const url = `${BASE_URL}/${lang}/offers`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ar: `${BASE_URL}/ar/offers`, en: `${BASE_URL}/en/offers` },
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

export default async function OffersPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  // Fetch real offers from DB (Products that have originalPrice)
  const dbOffers = await prisma.product.findMany({
    where: { originalPrice: { not: null } },
    orderBy: { createdAt: 'desc' }
  });

  const rawOffers = dbOffers.map(p => ({
    id: p.id.toString(),
    slug: p.slug,
    name: lang === 'ar' ? p.nameAr : p.nameEn,
    desc: lang === 'ar' ? p.descAr : p.descEn,
    price: p.price.toString(),
    originalPrice: p.originalPrice?.toString(),
    img: p.img,
    badge: lang === 'ar' ? p.badgeAr : p.badgeEn,
    isBundle: p.isBundle,
    bundleItems: lang === 'ar' ? p.bundleItemsAr : p.bundleItemsEn
  }));
  
  // If no DB offers, fallback to dict offers to not show empty page until data is seeded
  const offersList = rawOffers.length > 0 ? rawOffers : dict.offers.products.map((p: any, idx: number) => ({...p, id: idx, slug: (idx + 1).toString()}));

  return (
    <main className="min-h-screen bg-surface pb-24">
      {/* Header Section */}
      <header className="bg-primary text-on-primary pt-36 pb-24 md:pt-40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoqAWh9L13ryhFzvJ2owSfTY1zWDypsMXg2l_vjoOb5UcJwU_4MccimWAVO_4El4pncPsnZfczPAMXxKymPC37J_W0aWsWUCX-XUWe8ZWYNxC06oO_lcVKaSkX0-fdlJaezc1V-yYpN2AqNxaSBg3s1OzJFK-1qApWuBjgywQfIEK3MaDxl1boJlB4uvRy2geD7uWfFs3Ihr6MZgIEPq3wvB-M2uHqShk2h7HvYO7nYPXk94m14dhHTQni-4uMDSuJzJh07INF0U8"
            alt="Honeycomb patterns"
            fill
            priority
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-8 text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight">{dict.offers.title}</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-fixed">{dict.offers.desc}</p>
        </div>
      </header>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-8">
          {offersList.map((p: any, index: number) => (
            <div key={index} className="group relative flex flex-col bg-surface-container-lowest p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/30">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-surface-container mb-6 relative">
                {p.badge && (
                  <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10">
                    <span className="bg-error text-on-error px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                      {p.badge}
                    </span>
                  </div>
                )}
                <Link href={`/${lang}/shop/${p.slug}`} className="w-full h-full block relative">
                  <Image
                    src={p.img || '/og-default.jpg'}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white text-primary px-8 py-3 rounded-full font-bold shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {dict.common.quickView}
                    </button>
                  </div>
                </Link>
              </div>
              <h3 className="font-serif text-2xl text-primary mb-2 group-hover:text-secondary transition-colors">{p.name}</h3>
              <p className="text-stone-500 text-sm mb-4 line-clamp-2">{p.desc}</p>
              
              {p.isBundle && p.bundleItems && p.bundleItems.length > 0 && (
                <div className="mb-6 space-y-2">
                  <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-2">{lang === 'ar' ? 'محتويات الباقة:' : 'Bundle Includes:'}</span>
                  <ul className="flex flex-wrap gap-2">
                    {p.bundleItems.map((item: string, idx: number) => (
                      <li key={idx} className="bg-surface border border-outline-variant/30 text-stone-600 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm font-medium">
                        <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-auto pt-4 border-t border-outline-variant/30">
                <div className="flex flex-col mb-4">
                  <span className="text-stone-400 line-through decoration-error/50 font-bold text-sm">
                    {p.originalPrice} {dict.common.currency}
                  </span>
                  <span className="font-serif text-3xl font-bold text-error">
                    {p.price} {dict.common.currency}
                  </span>
                </div>
                
                <AddToCartButton 
                  id={p.id}
                  name={p.name}
                  price={parseInt(p.price)}
                  image={p.img}
                  label={dict.common.addToCart}
                  successMessage={dict.cart.success}
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg hover:bg-primary-container transition-all active:scale-95 shadow-md flex justify-center items-center gap-2 group/btn"
                />
              </div>
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* Newsletter Signup */}
      <section className="py-24 bg-surface-container-highest">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="bg-primary p-12 md:p-20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
            <div className="text-center md:text-start space-y-4 md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-serif text-on-primary leading-tight">{dict.home.newsletter.title1} <br/> <span className="italic opacity-80 text-secondary-fixed">{dict.home.newsletter.title2}</span></h2>
              <p className="text-on-primary-container text-lg">{dict.home.newsletter.desc}</p>
            </div>
            <div className="w-full md:w-1/2">
              <NewsletterForm placeholder={dict.home.newsletter.placeholder} btn={dict.home.newsletter.btn} />
              <p className="text-on-primary-container/60 text-sm mt-4 text-center md:text-start">{dict.home.newsletter.disclaimer}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
