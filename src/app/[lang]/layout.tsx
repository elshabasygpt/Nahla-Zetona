import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Serif, Alexandria, El_Messiri } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/features/CartDrawer";
import NotificationDrawer from "@/components/features/NotificationDrawer";
import ContactWidget from "@/components/ui/ContactWidget";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { getDictionary, Locale } from "@/lib/dictionary";
import Script from "next/script";
import PixelScripts from "@/components/analytics/PixelScripts";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body-en",
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-headline-en",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const alexandria = Alexandria({
  variable: "--font-body-ar",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  display: "swap",
});

const elMessiri = El_Messiri({
  variable: "--font-headline-ar",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

import ToasterProvider from "@/components/ui/ToasterProvider";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const settings = await (prisma as any).siteSettings.findFirst();

  const isAr = lang === 'ar';
  const storeName = settings
    ? (isAr ? settings.storeNameAr : settings.storeNameEn)
    : (isAr ? 'نحلة وزيتونة' : 'Bee & Olive');
  const description = isAr
    ? 'اكتشف جوهر مصر الطبيعي — عسل أصيل وزيت زيتون بكر ممتاز من أجود المصادر'
    : 'Discover the pure essence of Egypt — artisanal honey and premium cold-pressed olive oils';

  return {
    title: { default: storeName, template: `%s | ${storeName}` },
    description,
    metadataBase: new URL(BASE_URL),
    appleWebApp: {
      capable: true,
      title: storeName,
      statusBarStyle: 'default',
    },
    formatDetection: {
      telephone: false,
    },
    alternates: {
      canonical: `${BASE_URL}/${lang}`,
      languages: {
        'ar': `${BASE_URL}/ar`,
        'en': `${BASE_URL}/en`,
        'x-default': `${BASE_URL}/ar`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: storeName,
      locale: isAr ? 'ar_EG' : 'en_US',
      alternateLocale: isAr ? 'en_US' : 'ar_EG',
      title: storeName,
      description,
      url: `${BASE_URL}/${lang}`,
      images: settings?.logoUrl
        ? [{ url: settings.logoUrl, alt: storeName, width: 1200, height: 630 }]
        : [{ url: `${BASE_URL}/og-default.jpg`, alt: storeName, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    icons: {
      icon: settings?.logoUrl || '/favicon.ico',
      apple: settings?.logoUrl || '/favicon.ico',
    },
    ...(settings?.googleVerification && {
      verification: { google: settings.googleVerification },
    }),
  };
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ar' }];
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang: rawLang } = await params;
  const lang = rawLang as Locale;
  const dict = await getDictionary(lang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const isArabic = lang === 'ar';
  
  const fontVariables = `${plusJakartaSans.variable} ${notoSerif.variable} ${alexandria.variable} ${elMessiri.variable}`;

  const settings = await (prisma as any).siteSettings.findFirst();

  // Organization JSON-LD (global across all pages)
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: settings ? (isArabic ? settings.storeNameAr : settings.storeNameEn) : 'Bee & Olive',
    url: BASE_URL,
    logo: settings?.logoUrl ? `${BASE_URL}${settings.logoUrl}` : undefined,
    contactPoint: settings?.whatsappNumber ? {
      '@type': 'ContactPoint',
      telephone: `+${settings.whatsappNumber}`,
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
    } : undefined,
    sameAs: [
      settings?.facebookUrl,
      settings?.instagramUrl,
    ].filter(Boolean),
  };

  return (
    <html lang={lang} dir={dir} className={`light ${fontVariables}`} style={{
      '--font-body': isArabic ? 'var(--font-body-ar)' : 'var(--font-body-en)',
      '--font-headline': isArabic ? 'var(--font-headline-ar)' : 'var(--font-headline-en)',
      '--color-primary': settings?.primaryColor || '#00511e',
      '--color-secondary': settings?.secondaryColor || '#7f5600',
      '--color-text': settings?.textColor || '#1c1917',
      '--color-heading': settings?.headingColor || '#1c1917',
      '--color-muted': settings?.mutedColor || '#78716c',
      '--color-price': settings?.priceColor || '#16a34a',
    } as React.CSSProperties}>
      <head>
        {/* Organization Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

        {/* Dynamic Color Theme */}
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --color-on-surface: ${settings?.textColor || '#1c1917'};
          }
          /* Headings */
          :where(h1, h2, h3, h4, h5, h6) {
            color: var(--color-heading);
          }
          /* Base Text */
          :where(body) {
            color: var(--color-text);
          }
          /* Price */
          .theme-price-text {
            color: var(--color-price);
          }
        `}} />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-secondary-container selection:text-on-secondary-container pb-20 md:pb-0">
        <ToasterProvider />
        <CartDrawer dict={dict} lang={lang} />
        <NotificationDrawer dict={dict} lang={lang} />
        <Navbar dict={dict} lang={lang} settings={settings} />
        {children}
        {settings?.whatsappNumber && <ContactWidget phoneNumber={settings.whatsappNumber} />}
        <Footer dict={dict} lang={lang} settings={settings} />
        <MobileBottomNav dict={dict} lang={lang} settings={settings} />

        {/* Google Analytics — injected from Admin settings */}
        {settings?.gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.gaId}');
              `}
            </Script>
          </>
        )}

        {/* Facebook Pixel + TikTok Pixel — injected from Admin settings */}
        <PixelScripts
          facebookPixelId={settings?.facebookPixelId}
          tiktokPixelId={settings?.tiktokPixelId}
        />
      </body>
    </html>
  );
}

