import Image from "next/image";
import Link from "next/link";
import { getDictionary, Locale } from "@/lib/dictionary";
import NewsletterForm from "@/components/features/NewsletterForm";
import ScrollReveal from "@/components/ui/ScrollReveal";
import AddToCartButton from "@/components/features/AddToCartButton";
import FavoriteButton from "@/components/ui/FavoriteButton";
import HeroCarousel from "@/components/features/HeroCarousel";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const { lang } = await params;
  const settings = await (prisma as any).siteSettings.findFirst();
  const isAr = lang === 'ar';

  const storeName = settings
    ? (isAr ? settings.storeNameAr : settings.storeNameEn)
    : (isAr ? 'نحلة وزيتونة' : 'Bee & Olive');
  const description = isAr
    ? 'اكتشف جوهر مصر الطبيعي — عسل أصيل وزيت زيتون بكر ممتاز | تسوق الآن وتمتع بشحن سريع لجميع أنحاء مصر'
    : 'Discover the pure essence of Egypt — artisanal honey and premium cold-pressed olive oils | Shop now with fast delivery across Egypt';

  return {
    title: storeName,
    description,
    alternates: {
      canonical: `${BASE_URL}/${lang}`,
      languages: {
        ar: `${BASE_URL}/ar`,
        en: `${BASE_URL}/en`,
        'x-default': `${BASE_URL}/ar`,
      },
    },
    openGraph: {
      title: storeName,
      description,
      url: `${BASE_URL}/${lang}`,
      type: 'website',
      locale: isAr ? 'ar_EG' : 'en_US',
      siteName: storeName,
      images: settings?.logoUrl ? [{ url: settings.logoUrl, alt: storeName }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description,
    },
  };
}

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const blocks = await (prisma as any).contentBlock.findMany();
  const settings = await (prisma as any).siteSettings.findFirst();

  const isAr = lang === 'ar';
  const storeName = settings ? (isAr ? settings.storeNameAr : settings.storeNameEn) : 'Bee & Olive';

  // WebSite schema with SearchAction for Google Sitelinks Searchbox
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: storeName,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/${lang}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  
  const getBlock = (key: string, fallback: string = "") => {
    const b = blocks.find((b: any) => b.key === key);
    return b && (lang === 'ar' ? b.contentAr : b.contentEn) ? (lang === 'ar' ? b.contentAr : b.contentEn) : fallback;
  };

  const slidesJsonStr = getBlock('home_hero_slides');
  let loadedSlides = null;
  if (slidesJsonStr) {
    try {
      loadedSlides = JSON.parse(slidesJsonStr);
    } catch (e) {
      console.error("Failed to parse dynamic hero slides", e);
    }
  }

  const dynamicHeroDict = {
    ...dict.home.hero,
    slides: loadedSlides && loadedSlides.length > 0 
      ? loadedSlides 
      : dict.home.hero.slides
  };
  const benefitsJsonStr = getBlock('home_benefits');
  let dynamicBenefits = [];
  if (benefitsJsonStr) {
    try {
      dynamicBenefits = JSON.parse(benefitsJsonStr);
    } catch (e) {
      console.error("Failed to parse dynamic benefits", e);
    }
  }
  
  // Support both array maps and old dictionary object format as fallback
  const benefitsToRender = dynamicBenefits.length > 0 
    ? dynamicBenefits 
    : Object.values(dict.home.benefits);

  // We assign a default icon sequence if no icon exists (fallback logic)
  const defaultIcons = ["eco", "verified", "local_shipping"];

  return (
    <main>
      {/* WebSite Structured Data — enables Google Sitelinks Searchbox */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      {/* Hero Section Carousel */}
      <HeroCarousel dict={dynamicHeroDict} lang={lang} />

      {/* Benefits Section */}
      <section className="py-24 bg-surface-container-low overflow-hidden">
        <ScrollReveal delay={0.1} direction="up" className="container mx-auto px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
             {benefitsToRender.map((benefit: any, index: number) => (
                <div key={index} className="bg-surface-container-lowest p-10 rounded-xl flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-shadow duration-500">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${index % 2 === 0 ? 'bg-secondary-container/20 text-secondary' : 'bg-primary-container/10 text-primary'}`}>
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                       {benefit.icon || defaultIcons[index % defaultIcons.length]}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-primary">{benefit.title}</h3>
                  <p className="text-on-surface-variant">{benefit.desc}</p>
                </div>
             ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-8 max-w-7xl">
          {(() => {
            const categoriesJsonStr = getBlock('home_categories');
            let dynamicCategoriesData: any = null;
            if (categoriesJsonStr) {
               try { dynamicCategoriesData = JSON.parse(categoriesJsonStr); } catch (e) {}
            }
            const catHeader = dynamicCategoriesData?.header || dict.home.categories;
            const catItems = (dynamicCategoriesData?.items && dynamicCategoriesData.items.length > 0) 
              ? dynamicCategoriesData.items 
              : dict.home.categories.items;

            return (
              <>
                <div className="text-center mb-12 md:mb-16 space-y-4">
                  <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">{catHeader.subtitle}</span>
                  <h2 className="text-4xl md:text-5xl font-serif text-primary">{catHeader.title}</h2>
                </div>
                <ScrollReveal delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
                  {catItems.map((item: any, idx: number) => (
                    <Link href={`${lang === 'en' && !item.link.startsWith('/en') && !item.link.startsWith('/ar') ? '/en' : (lang === 'ar' && !item.link.startsWith('/ar') && !item.link.startsWith('/en') ? '/ar' : '')}${item.link}`} key={idx} className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-end">
                      <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src={item.img} alt={item.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative z-10 p-8 text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="w-12 h-12 mx-auto bg-primary/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                           <span className="material-symbols-outlined">{item.icon || 'category'}</span>
                        </div>
                        <h3 className="font-serif text-2xl !text-white mb-2" style={{ color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{item.name}</h3>
                        <p className="text-sm !text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200" style={{ color: '#e5e7eb' }}>{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </ScrollReveal>
              </>
            );
          })()}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-surface">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="flex flex-col items-center text-center md:text-start md:flex-row justify-between md:items-end mb-12 md:mb-16 gap-6">
            <div className="space-y-4 flex flex-col items-center md:items-start">
              <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">{dict.home.featured.title1} <br className="hidden md:block" /> <span className="italic">{dict.home.featured.title2}</span></h2>
              <div className="h-1 w-24 bg-secondary rounded-full"></div>
            </div>
            <p className="text-on-surface-variant max-w-sm mb-2 text-center md:text-start leading-relaxed">{dict.home.featured.desc}</p>
          </div>
          <ScrollReveal delay={0.2} className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Card 1 */}
            <div className="group relative bg-surface-container-low rounded-lg overflow-hidden flex flex-col">
              <div className="aspect-[4/5] overflow-hidden relative">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDH-1V6nvnTXR0SsevM8g243tXqbdq3yxifVJ000d_TsyUheVSPt1JBEeSUEjeNdtXwiykYtvPLsmVKBjFVOK_Fxe-Oguv2hVpkUJ4A4le6GoOeLLOSc-6weThcvSQJcjzq8ss450nze4WcIFt9CLISobDA3jB8A22sC3ejvuUSt9Xz0ZfypsINUaKB2bvgWEtTMhZvOnjnRUQM8VzZRsfhup_cqe7a29lXt7ZMFcUJhY3oXO8RyY2Wy2zbMFOQfhVzZpiOhEpJujU" alt="Luxury glass jar of Clover Honey" />
                <div className="absolute top-6 left-6 rtl:left-auto rtl:right-6">
                  <span className="bg-secondary-container text-tertiary px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm">{dict.home.featured.product1.badge}</span>
                </div>
                <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6 z-10">
                  <FavoriteButton product={{ slug: 'featured-1', nameAr: dict.home.featured.product1.name, nameEn: dict.home.featured.product1.name, price: 420, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH-1V6nvnTXR0SsevM8g243tXqbdq3yxifVJ000d_TsyUheVSPt1JBEeSUEjeNdtXwiykYtvPLsmVKBjFVOK_Fxe-Oguv2hVpkUJ4A4le6GoOeLLOSc-6weThcvSQJcjzq8ss450nze4WcIFt9CLISobDA3jB8A22sC3ejvuUSt9Xz0ZfypsINUaKB2bvgWEtTMhZvOnjnRUQM8VzZRsfhup_cqe7a29lXt7ZMFcUJhY3oXO8RyY2Wy2zbMFOQfhVzZpiOhEpJujU' }} />
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-serif text-primary">{dict.home.featured.product1.name}</h3>
                    <p className="text-on-surface-variant">{dict.home.featured.product1.desc}</p>
                  </div>
                  <span className="text-2xl font-serif text-secondary">{dict.home.featured.product1.price} {dict.common.currency}</span>
                </div>
                <AddToCartButton 
                  id="featured-1"
                  name={dict.home.featured.product1.name}
                  price={420}
                  image="https://lh3.googleusercontent.com/aida-public/AB6AXuDH-1V6nvnTXR0SsevM8g243tXqbdq3yxifVJ000d_TsyUheVSPt1JBEeSUEjeNdtXwiykYtvPLsmVKBjFVOK_Fxe-Oguv2hVpkUJ4A4le6GoOeLLOSc-6weThcvSQJcjzq8ss450nze4WcIFt9CLISobDA3jB8A22sC3ejvuUSt9Xz0ZfypsINUaKB2bvgWEtTMhZvOnjnRUQM8VzZRsfhup_cqe7a29lXt7ZMFcUJhY3oXO8RyY2Wy2zbMFOQfhVzZpiOhEpJujU"
                  label={dict.common.addToCart}
                  successMessage={dict.cart.success}
                  className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-on-primary py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 group/btn"
                />
              </div>
            </div>
            {/* Product Card 2 */}
            <div className="group relative bg-surface-container-low rounded-lg overflow-hidden flex flex-col">
              <div className="aspect-[4/5] overflow-hidden relative">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUSFyP3qm3XYOBVyi6j-y9aebTDNNYSu8VtPN0dQO64ym0IRHr2DqXLlAnyE8ye_gMLDXyRH8UqosAU7bBVIMbC2MU_-tkyYQ29AxH0PWpGe44AoQyA01P7fuMOSTk7rseXof5bCu4lYcii1YHhzaC-QsC-QHEKPXrHFvLaxkDgdUTpucBA-JhFSmU6TVN7nIkD4seGUQwCEn-jHUFjCsRntPYtThhrtKfBcnN7LLSm8QJa_vEMRmkeZYCHjglAkejXRQJmFQAsTg" alt="Extra Virgin Olive Oil" />
                <div className="absolute top-6 left-6 rtl:left-auto rtl:right-6">
                  <span className="bg-secondary-container text-tertiary px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm">{dict.home.featured.product2.badge}</span>
                </div>
                <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6 z-10">
                  <FavoriteButton product={{ slug: 'featured-2', nameAr: dict.home.featured.product2.name, nameEn: dict.home.featured.product2.name, price: 350, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUSFyP3qm3XYOBVyi6j-y9aebTDNNYSu8VtPN0dQO64ym0IRHr2DqXLlAnyE8ye_gMLDXyRH8UqosAU7bBVIMbC2MU_-tkyYQ29AxH0PWpGe44AoQyA01P7fuMOSTk7rseXof5bCu4lYcii1YHhzaC-QsC-QHEKPXrHFvLaxkDgdUTpucBA-JhFSmU6TVN7nIkD4seGUQwCEn-jHUFjCsRntPYtThhrtKfBcnN7LLSm8QJa_vEMRmkeZYCHjglAkejXRQJmFQAsTg' }} />
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-serif text-primary">{dict.home.featured.product2.name}</h3>
                    <p className="text-on-surface-variant">{dict.home.featured.product2.desc}</p>
                  </div>
                  <span className="text-2xl font-serif text-secondary">{dict.home.featured.product2.price} {dict.common.currency}</span>
                </div>
                <AddToCartButton 
                  id="featured-2"
                  name={dict.home.featured.product2.name}
                  price={350}
                  image="https://lh3.googleusercontent.com/aida-public/AB6AXuAUSFyP3qm3XYOBVyi6j-y9aebTDNNYSu8VtPN0dQO64ym0IRHr2DqXLlAnyE8ye_gMLDXyRH8UqosAU7bBVIMbC2MU_-tkyYQ29AxH0PWpGe44AoQyA01P7fuMOSTk7rseXof5bCu4lYcii1YHhzaC-QsC-QHEKPXrHFvLaxkDgdUTpucBA-JhFSmU6TVN7nIkD4seGUQwCEn-jHUFjCsRntPYtThhrtKfBcnN7LLSm8QJa_vEMRmkeZYCHjglAkejXRQJmFQAsTg"
                  label={dict.common.addToCart}
                  successMessage={dict.cart.success}
                  className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-on-primary py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 group/btn"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">{dict.home.bestSellers.subtitle}</span>
            <h2 className="text-5xl font-serif text-primary">{dict.home.bestSellers.title}</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">{dict.home.bestSellers.desc}</p>
          </div>
          <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dict.home.bestSellers.products.map((p: any, index: number) => (
              <div key={index} className="group flex flex-col bg-surface p-6 rounded-2xl border border-surface-container-high hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-square relative overflow-hidden rounded-xl bg-surface-container mb-6">
                  {p.badge && (
                    <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10">
                      <span className="bg-error-container text-error px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{p.badge}</span>
                    </div>
                  )}
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="text-center space-y-2 flex-col flex-1 flex">
                  <h3 className="font-serif text-xl text-primary">{p.name}</h3>
                  <p className="text-sm text-stone-500 line-clamp-2 min-h-[40px]">{p.desc}</p>
                  <div className="font-serif font-bold text-secondary text-2xl mt-4 mb-6">{p.price} {dict.common.currency}</div>
                  <div className="mt-auto">
                    <AddToCartButton 
                      id={`bs-${index}`}
                      name={p.name}
                      price={parseInt(p.price)}
                      image={p.img}
                      label={dict.common.addToCart}
                      successMessage={dict.cart.success}
                      className="w-full bg-surface-container-highest text-primary hover:bg-primary hover:text-on-primary py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 group/btn"
                    />
                  </div>
                </div>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* Our Story Teaser */}
      <section className="py-32 bg-gradient-to-b from-surface via-surface-container-lowest to-surface overflow-hidden relative">
        <div className="container mx-auto px-8 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Image Side */}
            <div className="lg:w-1/2 relative group w-full">
              {/* Decorative blobs */}
              <div className="absolute -top-12 -left-12 w-72 h-72 bg-secondary/20 rounded-full blur-[80px] -z-10 group-hover:bg-secondary/30 transition-colors duration-1000"></div>
              <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-primary/20 rounded-full blur-[80px] -z-10 group-hover:bg-primary/30 transition-colors duration-1000"></div>
              
              <div className="relative rounded-[2rem] overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-700 group-hover:-translate-y-2">
                <img className="w-full h-[500px] lg:h-[650px] object-cover scale-105 group-hover:scale-100 transition-transform duration-1000 ease-in-out" src={getBlock('home_about_img', "https://lh3.googleusercontent.com/aida-public/AB6AXuAqH-mYp4nHM9V4MbnF1K_P2muhKh3ZPeUi0w9uk1Do7iviy7UzQfpPlk3JhhF6knOstG129a_qPe2FtTmCsEe-4YSkR5QPo2j4De1egDZo1IJdzzjqqlMiVjA_RsQuga2lA7nA3_D8tVL-c25S2cpLvT5BIGOuC_kZyfaxs93hjwg_Q3F8h6Sys2iA_beEcLw8dX_L_7y7miChUVSlvG7kyHAhw8QVzz6AvByew5NWsuv5j9nygLdtRF9dPduQLY85CRt7W6sjpHk")} alt="Traditional Egyptian olive grove" />
                {/* Inner Overlay for premium finish */}
                <div className="absolute inset-0 border-[4px] border-white/20 rounded-[2rem] mix-blend-overlay"></div>
              </div>
            </div>

            {/* Content Side */}
            <div className="lg:w-1/2 space-y-10 relative z-10 text-center lg:text-start lg:rtl:text-right flex flex-col justify-center">
              <div className="inline-flex items-center justify-center lg:justify-start gap-4 mx-auto lg:mx-0">
                 <div className="h-px w-8 bg-secondary/50"></div>
                 <span className="text-secondary font-black tracking-widest uppercase text-sm bg-secondary/10 px-4 py-1 rounded-full">{dict.home.teaser.subtitle}</span>
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-serif text-primary leading-tight lg:leading-[1.15]">
                {getBlock('home_about_title', dict.home.teaser.title1)}
              </h2>
              
              <div className="text-stone-600 text-lg lg:text-xl leading-[1.8] font-medium whitespace-pre-wrap px-4 lg:px-0 opacity-90">
                <p>{getBlock('home_about_desc', dict.home.teaser.p1)}</p>
              </div>
              
              <div className="pt-4 flex justify-center lg:justify-start">
                 <Link href={`/${lang}/our-story`} className="px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-secondary hover:text-white transition-colors duration-300 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-secondary/30 inline-flex items-center gap-3 w-fit group">
                   <span>{dict.common.readMore}</span>
                   <span className="material-symbols-outlined rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">arrow_forward</span>
                 </Link>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-stone-50 relative overflow-hidden">
        {/* Soft Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] translate-y-1/2"></div>
        
        <div className="container mx-auto px-8 max-w-7xl relative z-10">
          <div className="text-center mb-20 space-y-4 flex flex-col items-center">
             <div className="flex items-center gap-3">
               <div className="h-0.5 w-8 bg-secondary/50 rounded-full"></div>
               <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm bg-secondary/10 px-4 py-1 rounded-full">{dict.home.testimonials.subtitle}</span>
               <div className="h-0.5 w-8 bg-secondary/50 rounded-full"></div>
             </div>
             <h2 className="text-5xl lg:text-6xl font-serif text-primary mt-4">{dict.home.testimonials.title}</h2>
          </div>
          
          <ScrollReveal delay={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {dict.home.testimonials.reviews.map((review: any, idx: number) => (
               <div key={idx} className="bg-white p-10 rounded-[2rem] shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:shadow-stone-200 border border-stone-100 hover:-translate-y-2 transition-all duration-500 relative group flex flex-col">
                 <span className="material-symbols-outlined text-[100px] text-stone-100 absolute top-4 left-4 rtl:left-auto rtl:right-4 rotate-180 z-0 group-hover:text-secondary/10 transition-colors duration-500 leading-none">format_quote</span>
                 
                 <div className="flex text-amber-500 mb-8 relative z-10 rtl:flex-row-reverse w-fit gap-1 bg-amber-50/50 px-3 py-1.5 rounded-full border border-amber-100">
                    {Array.from({length: 5}).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `\'FILL\' ${i < review.rating ? 1 : 0}` }}>star</span>
                    ))}
                 </div>
                 
                 <p className="text-stone-600 text-lg leading-[1.8] font-medium mb-10 italic relative z-10 flex-grow">"{review.text}"</p>
                 
                 <div className="flex justify-between items-end border-t border-stone-100 pt-6 mt-auto relative z-10">
                    <div>
                      <h4 className="font-bold text-xl text-primary">{review.name}</h4>
                      <span className="text-sm text-stone-500">{review.role}</span>
                    </div>
                    <span className="text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">{review.date}</span>
                 </div>
               </div>
             ))}
          </ScrollReveal>
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-8 max-w-7xl">
           <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
               <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">{dict.home.blog.subtitle}</span>
               <h2 className="text-5xl font-serif text-primary">{dict.home.blog.title}</h2>
            </div>
            <Link href={`/${lang}/blog`} className="hidden md:inline-flex text-primary font-bold hover:text-secondary transition-colors items-center gap-2">
                {dict.home.blog.btn}
                <span className="material-symbols-outlined rtl:-scale-x-100">arrow_forward</span>
            </Link>
           </div>
           <ScrollReveal delay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-12">
             {dict.home.blog.articles.map((article: any, idx: number) => (
               <Link href={`/${lang}/blog/${idx+1}`} key={idx} className="group flex flex-col sm:flex-row bg-surface-container-low rounded-2xl overflow-hidden hover:shadow-lg transition-shadow border border-surface-container-highest">
                  <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto overflow-hidden relative border-r rtl:border-l rtl:border-r-0 border-outline-variant/20">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={article.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuB0R_9f_iQYp_3zZ4_a_FjG-_Mvy1_wZqf_2K_O1X3"} alt={article.title} />
                    <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full">{article.label}</span>
                  </div>
                  <div className="sm:w-3/5 p-8 flex flex-col justify-center">
                    <span className="text-xs text-secondary font-bold mb-3 block tracking-wider uppercase">{article.date}</span>
                    <h3 className="font-serif text-2xl text-primary mb-3 group-hover:text-secondary transition-colors">{article.title}</h3>
                    <p className="text-sm text-stone-600 line-clamp-2">{article.desc}</p>
                  </div>
               </Link>
             ))}
           </ScrollReveal>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-32 bg-primary">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="bg-surface-container-lowest/10 backdrop-blur-md p-12 md:p-20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-12 border border-on-primary-container/20">
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
