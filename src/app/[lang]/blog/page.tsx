import Link from "next/link";
import Image from "next/image";
import { getDictionary, Locale } from "@/lib/dictionary";
import NewsletterForm from "@/components/features/NewsletterForm";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isAr = lang === 'ar';
  const title = isAr ? 'المدونة — نصائح وأسرار العسل وزيت الزيتون' : 'Blog — Honey & Olive Oil Tips and Secrets';
  const description = isAr
    ? 'اقرأ أحدث مقالاتنا عن فوائد العسل الطبيعي وزيت الزيتون البكر ونصائح الصحة والعناية الطبيعية'
    : 'Read our latest articles on the benefits of natural honey and olive oil, plus health and wellness tips';
  const url = `${BASE_URL}/${lang}/blog`;

  // Use first article's image as OG image if available
  const firstArticle = dict.blog?.articles?.[0];
  const ogImage = firstArticle?.image
    ? { url: firstArticle.image, alt: title, width: 1200, height: 630 }
    : { url: `${BASE_URL}/og-default.jpg`, alt: title, width: 1200, height: 630 };

  // Blog Listing JSON-LD (CollectionPage)
  const articleListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    publisher: {
      '@type': 'Organization',
      name: isAr ? 'نحلة وزيتونة' : 'Bee & Olive',
      url: BASE_URL,
    },
    hasPart: dict.blog?.articles?.map((a: any) => ({
      '@type': 'Article',
      headline: a.title,
      url: `${url}/${a.id}`,
      image: a.image,
      datePublished: a.date,
    })) ?? [],
  };

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${BASE_URL}/ar/blog`,
        en: `${BASE_URL}/en/blog`,
        'x-default': `${BASE_URL}/ar/blog`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: isAr ? 'ar_EG' : 'en_US',
      siteName: isAr ? 'نحلة وزيتونة' : 'Bee & Olive',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
    other: {
      'article:section': isAr ? 'صحة وعناية' : 'Health & Wellness',
    },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isAr = lang === 'ar';
  const url = `${BASE_URL}/${lang}/blog`;

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isAr ? 'المدونة — نحلة وزيتونة' : 'Blog — Bee & Olive',
    url,
    hasPart: dict.blog?.articles?.map((a: any) => ({
      '@type': 'Article',
      headline: a.title,
      url: `${url}/${a.id}`,
      image: a.image,
      datePublished: a.date,
    })) ?? [],
  };

  return (
    <main className="min-h-screen bg-surface">
      {/* CollectionPage JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

      {/* Blog Hero */}
      <section className="bg-surface-container-low pt-36 pb-20 md:pt-40 px-8 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto text-center space-y-6 relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif text-primary leading-tight">{dict.blog?.title || "Blog"}</h1>
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">{dict.blog?.desc}</p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {dict.blog?.articles?.map((article: any, idx: number) => (
            <Link
              href={`/${lang}/blog/${article.id}`}
              key={idx}
              className="group flex flex-col bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-outline-variant/20"
            >
              <div className="aspect-[16/9] overflow-hidden relative">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full shadow-md z-10">
                  {article.label}
                </span>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <span className="text-secondary text-sm font-bold tracking-widest uppercase mb-4 block">{article.date}</span>
                <h2 className="font-serif text-3xl text-primary mb-4 group-hover:text-secondary transition-colors">{article.title}</h2>
                <p className="text-stone-600 leading-relaxed mb-6 line-clamp-3">{article.desc}</p>
                <div className="mt-auto pt-6 border-t border-outline-variant/30 flex items-center gap-3 text-primary font-bold group/btn">
                  <span>{dict.blog?.readMore}</span>
                  <span className="material-symbols-outlined rtl:-scale-x-100 group-hover/btn:translate-x-2 rtl:group-hover/btn:-translate-x-2 transition-transform">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-32 bg-primary">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="bg-surface-container-lowest/10 backdrop-blur-md p-12 md:p-20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-12 border border-on-primary-container/20">
            <div className="text-center md:text-start space-y-4 md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-serif text-on-primary leading-tight">
                {dict.home.newsletter.title1} <br /> <span className="italic opacity-80 text-secondary-fixed">{dict.home.newsletter.title2}</span>
              </h2>
              <p className="text-on-primary-container text-lg">{dict.home.newsletter.desc}</p>
            </div>
            <div className="w-full md:w-1/2">
              <NewsletterForm placeholder={dict.home.newsletter.placeholder} btn={dict.home.newsletter.btn} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
