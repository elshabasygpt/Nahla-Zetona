import Link from "next/link";
import Image from "next/image";
import { getDictionary, Locale } from "@/lib/dictionary";
import AddToCartButton from "@/components/features/AddToCartButton";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale; id: string }> }
): Promise<Metadata> {
  const { lang, id } = await params;
  const dict = await getDictionary(lang);
  const article = dict.blog?.articles?.find((a: any) => a.id === id) || dict.blog?.articles?.[0];
  if (!article) return {};

  const isAr = lang === 'ar';
  const title = `${article.title} | ${isAr ? 'نحلة وزيتونة' : 'Bee & Olive'}`;
  const description = article.desc?.slice(0, 160) || '';
  const url = `${BASE_URL}/${lang}/blog/${id}`;

  const ogImage = article.image
    ? { url: article.image, alt: article.title, width: 1200, height: 630 }
    : { url: `${BASE_URL}/og-default.jpg`, alt: article.title, width: 1200, height: 630 };

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${BASE_URL}/ar/blog/${id}`,
        en: `${BASE_URL}/en/blog/${id}`,
        'x-default': `${BASE_URL}/ar/blog/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: isAr ? 'نحلة وزيتونة' : 'Bee & Olive',
      locale: isAr ? 'ar_EG' : 'en_US',
      publishedTime: article.date,
      modifiedTime: article.date,
      authors: [isAr ? 'فريق نحلة وزيتونة' : 'Bee & Olive Team'],
      section: isAr ? 'صحة وعناية' : 'Health & Wellness',
      tags: isAr
        ? ['عسل طبيعي', 'زيت زيتون', 'صحة', 'تغذية']
        : ['natural honey', 'olive oil', 'health', 'nutrition'],
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ lang: Locale, id: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const idStr = resolvedParams.id;
  const dict = await getDictionary(lang);

  // Find article
  const article = dict.blog?.articles?.find((a: any) => a.id === idStr) || dict.blog?.articles?.[0];
  if (!article) return <div className="min-h-screen pt-40 text-center">Article Not Found</div>;

  const isAr = lang === 'ar';

  // Calculate reading time from content
  const wordCount = article.content?.split(/\s+/).length || 0;
  const readingTimeMin = Math.max(1, Math.round(wordCount / 200));

  // Article JSON-LD Schema — fully enriched
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${BASE_URL}/${lang}/blog/${idStr}`,
    headline: article.title,
    description: article.desc,
    image: {
      '@type': 'ImageObject',
      url: article.image,
      width: 1200,
      height: 630,
    },
    datePublished: article.date,
    dateModified: article.date,
    wordCount,
    timeRequired: `PT${readingTimeMin}M`,
    inLanguage: isAr ? 'ar-EG' : 'en-US',
    author: {
      '@type': 'Organization',
      name: isAr ? 'نحلة وزيتونة' : 'Bee & Olive',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: isAr ? 'نحلة وزيتونة' : 'Bee & Olive',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/${lang}/blog/${idStr}`,
    },
    keywords: isAr
      ? 'عسل طبيعي, زيت زيتون, صحة, فوائد العسل'
      : 'natural honey, olive oil, health benefits, wellness',
    articleSection: isAr ? 'صحة وعناية' : 'Health & Wellness',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isAr ? 'الرئيسية' : 'Home', item: `${BASE_URL}/${lang}` },
      { '@type': 'ListItem', position: 2, name: isAr ? 'المدونة' : 'Blog', item: `${BASE_URL}/${lang}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${BASE_URL}/${lang}/blog/${idStr}` },
    ],
  };

  return (
    <main className="min-h-screen bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Article Header */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end justify-center pb-20">
        <div className="absolute inset-0">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent"></div>
        </div>
        <div className="relative z-10 container mx-auto px-8 max-w-4xl text-center space-y-6">
          {/* Breadcrumb visible text for SEO */}
          <nav aria-label="breadcrumb" className="flex items-center justify-center gap-2 text-white/60 text-xs mb-4">
            <Link href={`/${lang}`} className="hover:text-white transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
            <span>/</span>
            <Link href={`/${lang}/blog`} className="hover:text-white transition-colors">{isAr ? 'المدونة' : 'Blog'}</Link>
            <span>/</span>
            <span className="text-white/80 line-clamp-1 max-w-[200px]">{article.title}</span>
          </nav>
          <span className="bg-primary hover:bg-secondary transition-colors text-on-primary text-xs font-bold px-4 py-2 rounded-full shadow-md uppercase tracking-widest">
            {article.label}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight">{article.title}</h1>
          <div className="flex items-center justify-center gap-4 text-stone-300 text-sm">
            <span className="font-medium tracking-widest uppercase">{article.date}</span>
            <span>·</span>
            <span>{isAr ? `${readingTimeMin} دقائق قراءة` : `${readingTimeMin} min read`}</span>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <section className="py-24 px-8">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Article Content */}
          <article className="lg:col-span-8 prose prose-lg md:prose-xl prose-stone max-w-none" lang={isAr ? 'ar' : 'en'}>
            <Link href={`/${lang}/blog`} className="inline-flex items-center gap-2 text-stone-500 hover:text-primary font-bold text-sm mb-12 uppercase tracking-wide transition-colors group no-underline">
              <span className="material-symbols-outlined rtl:-scale-x-100 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform">arrow_back</span>
              {dict.blog?.backToBlog}
            </Link>

            <p className="text-2xl text-stone-600 leading-relaxed font-serif italic mb-12 border-l-4 rtl:border-l-0 rtl:border-r-4 border-secondary pl-6 rtl:pr-6">
              {article.desc}
            </p>

            <div className="text-stone-800 leading-loose space-y-8 text-lg font-medium">
              {article.content.split(/\n+/).map((paragraph: string, i: number) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Article Tags */}
            <div className="mt-12 pt-8 border-t border-stone-200 flex flex-wrap gap-2">
              {(isAr
                ? ['عسل طبيعي', 'زيت زيتون', 'صحة', 'تغذية']
                : ['natural honey', 'olive oil', 'health', 'nutrition']
              ).map((tag) => (
                <span key={tag} className="bg-stone-100 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </article>

          {/* Sidebar: Related Product */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 shadow-md">
              <h2 className="text-xl font-serif text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">eco</span>
                {dict.blog?.relatedProducts}
              </h2>

              {/* Related Product Card */}
              <Link href={`/${lang}/shop/1`} className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20 hover:shadow-lg transition-shadow">
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={dict.shop.products[0].img}
                    alt={dict.shop.products[0].name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
                    <span className="bg-secondary-container text-tertiary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {dict.shop.products[0].badge}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-primary mb-2 line-clamp-1">{dict.shop.products[0].name}</h3>
                  <p className="text-stone-500 text-sm mb-4 line-clamp-2">{dict.shop.products[0].desc}</p>
                  <div className="flex justify-between items-center mb-6 border-t border-outline-variant/30 pt-4">
                    <span className="text-secondary font-bold text-2xl">{dict.shop.products[0].price} {dict.common.currency}</span>
                  </div>
                  <div className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-primary-container group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">visibility</span>
                    {isAr ? 'تفاصيل المنتج' : 'View Product'}
                  </div>
                </div>
              </Link>
            </div>
          </aside>

        </div>
      </section>
    </main>
  );
}
