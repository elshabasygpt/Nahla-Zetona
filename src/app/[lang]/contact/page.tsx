import { Locale } from "@/lib/dictionary";
import { PrismaClient } from "@prisma/client";
import ContactFormClient from "@/components/features/ContactFormClient";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Metadata } from "next";

const prisma = new PrismaClient();

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === 'ar';
  const title = isAr ? 'تواصل معنا — نحلة وزيتونة' : 'Contact Us — Bee & Olive';
  const description = isAr
    ? 'تواصل مع فريقنا لأي استفسار عن منتجاتنا أو طلباتك — نحن هنا لمساعدتك'
    : 'Get in touch with our team for any inquiries about our products or orders — we\'re here to help';
  const url = `${BASE_URL}/${lang}/contact`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ar: `${BASE_URL}/ar/contact`, en: `${BASE_URL}/en/contact` },
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

export default async function ContactPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  // Fallback to empty dictionary if translation doesn't exist, we'll hardcode Ar/En here for speed 
  // since it's a specific White-Label component that can be easily customized.
  const settings = await (prisma as any).siteSettings.findFirst();

  const t = {
    heroTitle: lang === 'ar' ? 'تواصل معنا' : 'Contact Us',
    heroDesc: lang === 'ar' ? 'نحن هنا للإجابة على استفساراتك وتقديم المساعدة التي تحتاجها.' : 'We are here to answer your questions and provide the help you need.',
    formTitle: lang === 'ar' ? 'أرسل لنا رسالة' : 'Send us a message',
    name: lang === 'ar' ? 'الاسم بالكامل' : 'Full Name',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
    subject: lang === 'ar' ? 'الموضوع' : 'Subject',
    message: lang === 'ar' ? 'رسالتك' : 'Your Message',
    send: lang === 'ar' ? 'إرسال الرسالة' : 'Send Message',
    directContact: lang === 'ar' ? 'التواصل المباشر' : 'Direct Contact',
    addressTitle: lang === 'ar' ? 'العنوان' : 'Address',
    address: lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
    phoneTitle: lang === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    whatsappTitle: lang === 'ar' ? 'واتساب' : 'WhatsApp',
    social: lang === 'ar' ? 'وسائل التواصل' : 'Social Media'
  };

  return (
    <main className="min-h-screen bg-surface-container-low pb-24 overflow-hidden">
      {/* Hero Section */}
      <section className="bg-primary text-on-primary pt-32 pb-40 text-center relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent"></div>
        
        <ScrollReveal className="relative z-10 px-4">
          <h1 className="text-6xl md:text-7xl font-serif mb-6 text-secondary-container drop-shadow-lg">{t.heroTitle}</h1>
          <p className="text-on-primary-container text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-95 leading-relaxed bg-black/20 px-6 py-3 rounded-full backdrop-blur-sm border border-white/10">{t.heroDesc}</p>
        </ScrollReveal>
        
        {/* Soft bottom curve/fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-container-low to-transparent"></div>
      </section>

      <section className="container mx-auto px-6 md:px-8 max-w-7xl -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Direct Contact Info */}
          <ScrollReveal delay={0.2} direction="up" className="lg:col-span-4 flex flex-col gap-8 h-full">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white h-full relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-shadow duration-500">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-secondary/20 transition-colors"></div>
              
              <h3 className="text-2xl font-serif text-primary mb-10 pb-4 border-b-2 border-stone-100 relative z-10 inline-block">
                {t.directContact}
                <span className="absolute bottom-[-2px] right-0 w-1/2 h-[2px] bg-secondary rounded-full"></span>
              </h3>
            
              <a href="https://maps.app.goo.gl/sa1yUvHzw4nKnHaP8" target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 group cursor-pointer relative z-10">
              <div className="w-14 h-14 bg-stone-100 group-hover:bg-secondary group-hover:text-white transition-all duration-300 rounded-full flex justify-center items-center text-secondary shrink-0 shadow-sm group-hover:shadow-md">
                <span className="material-symbols-outlined text-[28px]">location_on</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-800 text-lg mb-1">{t.addressTitle}</h4>
                <p className="text-stone-500 transition-colors group-hover:text-stone-800">{t.address}</p>
                <div className="mt-2 text-primary font-bold text-sm bg-primary/10 inline-block px-3 py-1 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                  عرض على جوجل ماب
                </div>
              </div>
            </a>

            <div className="flex items-start gap-5 relative z-10 pt-6 border-t border-stone-100 mt-2">
              <div className="w-14 h-14 bg-stone-100 transition-colors rounded-full flex justify-center items-center text-primary shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">phone_in_talk</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-800 text-lg mb-1">{t.whatsappTitle} / {t.phoneTitle}</h4>
                <a href={`tel:${settings?.whatsappNumber || '01115533537'}`} className="text-stone-500 font-mono text-lg hover:text-primary transition-colors inline-block pt-1" dir="ltr">{settings?.whatsappNumber || '01115533537'}</a>
              </div>
            </div>

            <div className="flex items-start gap-5 relative z-10 pt-6 border-t border-stone-100 mt-2">
              <div className="w-14 h-14 bg-stone-100 transition-colors rounded-full flex justify-center items-center text-primary shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">mail</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-800 text-lg mb-1">{t.email}</h4>
                <a href="mailto:support@nahlazetona.com" className="text-stone-500 font-mono text-lg hover:text-primary transition-colors inline-block pt-1">support@nahlazetona.com</a>
              </div>
            </div>
          </div>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal delay={0.4} direction="up" className="lg:col-span-8 h-full">
            <div className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white h-full flex flex-col justify-center relative overflow-hidden">
              {/* Decorative shapes */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none"></div>
              
              <div className="relative z-10 mb-10">
                 <h3 className="text-3xl md:text-4xl font-serif text-primary mb-3">{t.formTitle}</h3>
                 <p className="text-stone-500">لا تتردد في ترك رسالتك، وسيقوم فريقنا بالرد عليك في أسرع وقت.</p>
              </div>

              <div className="relative z-10">
                <ContactFormClient t={t} />
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Full Width Map Section */}
      <section className="mt-32 relative">
        <div className="text-center mb-12">
           <h2 className="text-4xl font-serif text-primary mb-4 flex justify-center items-center gap-3">
             <span className="material-symbols-outlined text-secondary text-4xl">map</span>
             موقعنا على الخريطة
           </h2>
           <p className="text-stone-500">نسعد بزيارتكم في مقرنا لمعاينة محاصيلنا الطبيعية عن قرب.</p>
        </div>
        <ScrollReveal delay={0.2} className="w-full h-[550px] relative px-4 md:px-8 max-w-screen-2xl mx-auto drop-shadow-xl">
           <div className="w-full h-full rounded-3xl overflow-hidden border-8 border-white group relative">
             <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
             <iframe 
               src="https://maps.google.com/maps?q=31.2672943,29.9952856&hl=ar&z=15&output=embed" 
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               className="absolute inset-0 w-full h-full grayscale-[10%] contrast-110"
             ></iframe>
             <a href="https://maps.app.goo.gl/sa1yUvHzw4nKnHaP8" target="_blank" rel="noopener noreferrer" className="absolute bottom-6 right-6 rtl:right-auto rtl:left-6 z-20 bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-secondary transition-colors flex items-center gap-2">
                احصل على الاتجاهات
                <span className="material-symbols-outlined rtl:-scale-x-100">directions_car</span>
             </a>
           </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
