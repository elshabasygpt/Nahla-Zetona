import Image from "next/image";
import Link from "next/link";
import { getDictionary, Locale } from "@/lib/dictionary";
import { PrismaClient } from "@prisma/client";
import type { Metadata } from "next";

const prisma = new PrismaClient();

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === 'ar';
  const title = isAr ? 'قصتنا — نحلة وزيتونة' : 'Our Story — Bee & Olive';
  const description = isAr
    ? 'اكتشف رحلتنا في صنع منتجات طبيعية أصيلة من عسل وزيت زيتون مستخلصة من أجود مناطق مصر'
    : 'Discover our journey crafting authentic natural products — honey and olive oil sourced from Egypt\'s finest regions';
  const url = `${BASE_URL}/${lang}/our-story`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ar: `${BASE_URL}/ar/our-story`, en: `${BASE_URL}/en/our-story` },
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

export default async function OurStory({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  const blocks = await (prisma as any).contentBlock.findMany();
  const getBlock = (key: string) => {
    const block = blocks.find((b: any) => b.key === key);
    if (!block) return '';
    return lang === 'ar' ? block.contentAr : block.contentEn;
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[819px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover grayscale-[20%] sepia-[10%]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWZAPWiQwaskvDqSvS5qzdCv7f9gBs3piKJ9bOg2p3o48g5UpmszpcZ3jJ0xIl_aa4ZkmY39GFsCKA2hgHpXjXRiMKlgej1ezmh4vfQaQJe9jGNnpZNzAtKuhQ5xp4OJoxqSn-JwIbNQdcNUILdcMcmvreF3ncfERGHGgxaCMszexSKBZkt8aiqOYHw2Jsw1LZ6N6wgQDuGb85LBivdzJUEGnCtmP2GKUhed6CsOr8YmKUikWrJMLQ4iz2av0QK2chZvjUjnYMlLc" alt="Sun-drenched Egyptian olive grove" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent rtl:from-transparent rtl:to-primary/40"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl bg-surface/10 backdrop-blur-sm p-8 md:p-12 rounded-xl">
            <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-tight mb-6">
              {dict.common.brand} <br/>
              <span className="italic font-normal">{dict.ourStory.hero.title}</span>
            </h1>
            <p className="text-xl text-surface-container-low font-body leading-relaxed mb-8 max-w-lg">
              {dict.ourStory.hero.desc}
            </p>
            <div className="flex gap-4">
              <Link href={`/${lang}/shop`}>
                <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all flex items-center gap-2">
                  {dict.ourStory.hero.btn}
                  <span className="material-symbols-outlined text-sm rtl:-scale-x-100">arrow_forward</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey - Editorial Layout */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-5 relative">
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl">
                <img className="w-full h-auto aspect-[4/5] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH0KRfZVLRpFbgSt78Af3r1iP65-yj1bLe_W5e8LY-yXyCwiBCBS-7_lSmN9hf6i5h6Wc1f6yw9cMwB9t8bPWP2yclRkE6CclOUsRT8Vt-eTppBTnTHrmfXmwQCF2teBItuNSzwVt-_PTgyHCWxBGUth8wUsd06thfPRaumhO2-G3dLIC50TbqikOOuMPc0ZrO0elhKYJFPEPqXgd_jxl2wIujO1HLQPgnIRDoO95km88ppO5bBa72N8_g8QfX2aNH1wVo4Y3Mgzc" alt="Harvesting" />
              </div>
              <div className="absolute -bottom-8 -left-8 rtl:-left-auto rtl:-right-8 w-48 h-48 bg-secondary-container/20 rounded-full blur-3xl z-0"></div>
              <div className="absolute -top-12 -right-12 rtl:-right-auto rtl:-left-12 z-20">
                <div className="bg-secondary-container text-tertiary px-6 py-6 rounded-xl shadow-xl transform -rotate-6">
                  <span className="font-serif italic text-3xl block">1940</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-7 space-y-8">
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">{dict.ourStory.journey.sub}</span>
              <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">
                {dict.ourStory.journey.title}
              </h2>
              <div className="space-y-6 text-stone-600 leading-relaxed text-lg font-body">
                <p>{dict.ourStory.journey.p1}</p>
                <p>{dict.ourStory.journey.p2}</p>
                <p className="italic text-primary font-serif">
                  "{dict.ourStory.journey.quote}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24 bg-primary text-on-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
            
            <div className="md:col-span-7 space-y-8 order-2 md:order-1">
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">
                {lang === 'ar' ? 'كلمة المؤسس' : 'Word from the Founder'}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                {getBlock('story_founder_name')}
              </h2>
              <div className="space-y-8 text-white/95 leading-[1.8] text-xl font-body drop-shadow-sm">
                 <p>{getBlock('story_founder_p1')}</p>
                 <p>{getBlock('story_founder_p2')}</p>
                 <div className="pt-6 mt-8 border-t border-white/20">
                   <p className="font-serif italic text-3xl text-secondary-container leading-relaxed">
                     "{getBlock('story_founder_quote')}"
                   </p>
                 </div>
              </div>
            </div>

            <div className="md:col-span-5 relative order-1 md:order-2">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-4 border-on-primary/10">
                <img className="w-full h-auto aspect-square object-cover" src={getBlock('story_founder_image') || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1000&auto=format&fit=crop"} alt="Founder" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/30 rounded-full blur-3xl z-0"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Values - Bento Grid */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-serif text-primary">{dict.ourStory.pillars.title}</h2>
            <p className="text-stone-500 max-w-xl mx-auto">{dict.ourStory.pillars.desc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dict.ourStory.pillars.items.map((item: any, i: number) => (
              <div key={i} className="bg-surface p-10 rounded-xl space-y-6 border-b-4 border-primary/20 hover:border-primary transition-all duration-500 group">
                <div className="w-16 h-16 bg-primary-container/10 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                </div>
                <h3 className="text-2xl font-serif text-primary">{item.title}</h3>
                <p className="text-stone-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process/Meet Producers - Asymmetric Grid */}
      <section className="py-24 bg-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl font-serif text-primary mb-4">{dict.ourStory.process.title}</h2>
              <p className="text-stone-500">{dict.ourStory.process.desc}</p>
            </div>
            <Link href={`/${lang}/blog/5`} className="text-primary font-bold border-b-2 border-primary pb-1 hover:text-secondary transition-colors inline-flex items-center gap-2 group">
               {dict.ourStory.process.btn}
               <span className="material-symbols-outlined text-sm rtl:-scale-x-100 group-hover:translate-x-1 transition-transform">open_in_new</span>
            </Link>
          </div>
          <div className="grid grid-cols-12 gap-8 items-start">
            <div className="col-span-12 md:col-span-7 group">
              <div className="rounded-xl overflow-hidden relative mb-4">
                <img className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkx4M7vQi4fHZ5PJPvsWndXK-BXbpmkg-tau4qNzkyR2NA5Ip_nI3GtDeNbGMyXEzx7dCIfns_oUTD-KfzwmYt4XA-VbpmYLxcHuBnoEVfZvnBxsQHTfJOgUeyhIlBaXdF8ZOL3GcYOJny-cUkq4VY2aAZQWdZhmEFhngLG1gzZdtMkkMAcM0IJ3ZGPAZ964ei2WluCGWb7mz647iVNUNMma3Q-IXepp9-g8uhPi5upaa4zyVaZTPmimRE4KLxbfWc9u4DSag9i8Q" alt="Modern honey extraction process" />
              </div>
              <h4 className="text-xl font-serif text-primary">{dict.ourStory.process.steps[0].title}</h4>
              <p className="text-stone-500">{dict.ourStory.process.steps[0].desc}</p>
            </div>
            <div className="col-span-12 md:col-span-5 pt-0 md:pt-24 group">
              <div className="rounded-xl overflow-hidden mb-4 relative">
                <img className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmlh3bQ6aWbE_j4TDFQ9BcNB-GTjrInHPrFTxpmpPgrM2Av5u-rdG3lJLk7Qn0aPbleGXQXiX2BEGzEUc_aQ59OTL5ae7fOnoxPydNnrtGY3BgfqRA1DNq5dMYoTNcGlqf_NY3QRYQiUcbboed4jr_QLcJJ3FbiXxqERIv47t33ubnhywOj-y6zD4neP-okLWPZ-1flEWD19OH6FmvqjhvoO7GVg7ji7vCGtF_nHwoKfsRGdQAtFgohWTIn2AUsOobzAeaG28B8Jw" alt="A portrait of an elderly beekeeper in Egypt" />
              </div>
              <h4 className="text-xl font-serif text-primary">{dict.ourStory.process.steps[1].title}</h4>
              <p className="text-stone-500">{dict.ourStory.process.steps[1].desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges & Certifications */}
      <section className="py-16 bg-surface-container-highest/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-70">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <span className="font-bold text-stone-700 tracking-tighter text-lg">ISO CERTIFIED</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <span className="font-bold text-stone-700 tracking-tighter text-lg">100% ORGANIC</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl rtl:-scale-x-100" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              <span className="font-bold text-stone-700 tracking-tighter text-lg">GLOBAL SHIPPING</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="font-bold text-stone-700 tracking-tighter text-lg">LAB TESTED</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
