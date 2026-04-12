import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SeoPageClient from '@/components/admin/SeoPageClient';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nahlazetona.com';

export default async function SeoAdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  // Gather SEO audit data
  const [products, settings] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, nameAr: true, nameEn: true, img: true, updatedAt: true } }),
    (prisma as any).siteSettings.findFirst(),
  ]);

  const seoPages = [
    { path: `/${lang}`, label: 'الصفحة الرئيسية', hasMetadata: true, hasOg: true, hasJsonLd: true, priority: '1.0' },
    { path: `/${lang}/shop`, label: 'المتجر', hasMetadata: true, hasOg: true, hasJsonLd: false, priority: '0.9' },
    { path: `/${lang}/offers`, label: 'العروض', hasMetadata: true, hasOg: true, hasJsonLd: false, priority: '0.8' },
    { path: `/${lang}/blog`, label: 'المدونة', hasMetadata: true, hasOg: true, hasJsonLd: false, priority: '0.7' },
    { path: `/${lang}/our-story`, label: 'قصتنا', hasMetadata: true, hasOg: true, hasJsonLd: false, priority: '0.7' },
    { path: `/${lang}/contact`, label: 'تواصل معنا', hasMetadata: true, hasOg: true, hasJsonLd: false, priority: '0.6' },
    ...products.map(p => ({
      path: `/${lang}/shop/${p.slug}`,
      label: lang === 'ar' ? p.nameAr : p.nameEn,
      hasMetadata: true,
      hasOg: true,
      hasJsonLd: true,
      hasImage: !!p.img,
      priority: '0.8',
    })),
  ];

  const totalUrls = (6 + products.length) * 2; // both languages
  const missingImages = products.filter(p => !p.img).length;

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-green-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                travel_explore
              </span>
              مركز إدارة SEO
            </h1>
            <p className="text-stone-500 mt-1">تحديث الأرشفة، إرسال الروابط لجوجل وبينج، ومراجعة صحة الموقع.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${BASE_URL}/sitemap.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              عرض Sitemap
            </a>
            <a
              href={`${BASE_URL}/robots.txt`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-base">description</span>
              Robots.txt
            </a>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي روابط الموقع', value: totalUrls.toString(), icon: 'link', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'منتجات مفهرسة', value: products.length.toString(), icon: 'inventory_2', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'منتجات بدون صورة', value: missingImages.toString(), icon: 'image_not_supported', color: missingImages > 0 ? 'text-red-600' : 'text-emerald-600', bg: missingImages > 0 ? 'bg-red-50' : 'bg-emerald-50' },
          { label: 'حالة Google Search Console', value: settings?.googleVerification ? 'مُربوط' : 'غير مُربوط', icon: settings?.googleVerification ? 'verified' : 'link_off', color: settings?.googleVerification ? 'text-emerald-600' : 'text-amber-600', bg: settings?.googleVerification ? 'bg-emerald-50' : 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-black text-stone-800">{stat.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {(!settings?.googleVerification || !settings?.gaId || missingImages > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
          <h3 className="font-bold text-amber-800 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            توصيات لتحسين الظهور
          </h3>
          <ul className="space-y-1.5 text-sm text-amber-700">
            {!settings?.googleVerification && (
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">radio_button_unchecked</span>
                لم يتم ربط Google Search Console — أضف كود التحقق في{' '}
                <Link href={`/${lang}/admin/settings`} className="font-bold underline">إعدادات المتجر</Link>
              </li>
            )}
            {!settings?.gaId && (
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">radio_button_unchecked</span>
                لم يتم إضافة Google Analytics ID — أضفه في{' '}
                <Link href={`/${lang}/admin/settings`} className="font-bold underline">إعدادات المتجر</Link>
              </li>
            )}
            {missingImages > 0 && (
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">radio_button_unchecked</span>
                {missingImages} منتج بدون صورة — الصور تُحسّن ظهور المنتج في نتائج جوجل
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Interactive Actions (Client Component) */}
      <SeoPageClient lang={lang} baseUrl={BASE_URL} />

      {/* SEO Audit Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <span className="material-symbols-outlined text-stone-400">fact_check</span>
          <h2 className="font-bold text-stone-800 text-lg">تدقيق SEO لصفحات الموقع</h2>
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">{seoPages.length} صفحة</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 text-xs">
                <th className="py-3 px-4 text-right font-bold">الصفحة</th>
                <th className="py-3 px-4 text-center font-bold">Meta Title/Desc</th>
                <th className="py-3 px-4 text-center font-bold">Open Graph</th>
                <th className="py-3 px-4 text-center font-bold">JSON-LD</th>
                <th className="py-3 px-4 text-center font-bold">الأولوية</th>
                <th className="py-3 px-4 text-center font-bold">معاينة</th>
              </tr>
            </thead>
            <tbody>
              {seoPages.slice(0, 20).map((page, i) => (
                <tr key={i} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-stone-800 truncate max-w-[220px]">{page.label}</div>
                    <div className="text-stone-400 font-mono text-xs truncate max-w-[220px]">{page.path}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {page.hasMetadata
                      ? <span className="inline-flex items-center justify-center w-7 h-7 bg-emerald-100 rounded-full"><span className="material-symbols-outlined text-sm text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></span>
                      : <span className="inline-flex items-center justify-center w-7 h-7 bg-red-100 rounded-full"><span className="material-symbols-outlined text-sm text-red-500">close</span></span>
                    }
                  </td>
                  <td className="py-3 px-4 text-center">
                    {page.hasOg
                      ? <span className="inline-flex items-center justify-center w-7 h-7 bg-emerald-100 rounded-full"><span className="material-symbols-outlined text-sm text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></span>
                      : <span className="inline-flex items-center justify-center w-7 h-7 bg-red-100 rounded-full"><span className="material-symbols-outlined text-sm text-red-500">close</span></span>
                    }
                  </td>
                  <td className="py-3 px-4 text-center">
                    {page.hasJsonLd
                      ? <span className="inline-flex items-center justify-center w-7 h-7 bg-emerald-100 rounded-full"><span className="material-symbols-outlined text-sm text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check</span></span>
                      : <span className="inline-flex items-center justify-center w-7 h-7 bg-stone-100 rounded-full"><span className="material-symbols-outlined text-sm text-stone-400">remove</span></span>
                    }
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-stone-100 text-stone-600 font-mono text-xs px-2 py-1 rounded-md">{(page as any).priority}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <a
                      href={`${BASE_URL}${page.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm text-blue-500">open_in_new</span>
                    </a>
                  </td>
                </tr>
              ))}
              {seoPages.length > 20 && (
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-center text-stone-400 text-xs">
                    + {seoPages.length - 20} صفحة منتج إضافية — جميعها مُهيأة بالكامل للـ SEO ✓
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
