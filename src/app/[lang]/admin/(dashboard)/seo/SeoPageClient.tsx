'use client';

import SeoActionCard from '@/components/admin/SeoActionCard';

export default function SeoPageClient({ lang, baseUrl }: { lang: string, baseUrl: string }) {
  const handleRevalidate = async () => {
    const res = await fetch('/api/admin/revalidate', { method: 'POST' });
    if (!res.ok) throw new Error('فشل تحديث الكاش');
    return res.json();
  };

  const handleSeoPing = async () => {
    const res = await fetch('/api/admin/seo-ping', { method: 'POST' });
    if (!res.ok) throw new Error('فشل إرسال الروابط');
    return res.json();
  };

  const handleSitemapCheck = async () => {
    const res = await fetch(`${baseUrl}/sitemap.xml`);
    const text = await res.text();
    const urlCount = (text.match(/<url>/g) || []).length;
    return { success: true, urlsSubmitted: urlCount, timestamp: new Date().toISOString() };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-stone-700 flex items-center gap-2">
        <span className="material-symbols-outlined text-stone-400">bolt</span>
        أدوات التحديث والأرشفة
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SeoActionCard
          icon="refresh"
          iconColor="text-blue-600"
          bgColor="bg-gradient-to-br from-blue-50 to-indigo-50"
          title="تحديث كاش الموقع"
          description="يُجدد محتوى جميع صفحات الموقع ويُزيل الكاش القديم فوراً"
          buttonLabel="تحديث جميع الصفحات"
          buttonColor="bg-blue-600 hover:bg-blue-700"
          onAction={handleRevalidate}
        />

        <SeoActionCard
          icon="travel_explore"
          iconColor="text-emerald-600"
          bgColor="bg-gradient-to-br from-emerald-50 to-teal-50"
          title="إرسال لمحركات البحث"
          description="يُرسل جميع روابط الموقع لجوجل وبينج عبر IndexNow و Sitemap Ping"
          buttonLabel="أرسل لجوجل وبينج الآن"
          buttonColor="bg-emerald-600 hover:bg-emerald-700"
          onAction={handleSeoPing}
        />

        <SeoActionCard
          icon="fact_check"
          iconColor="text-violet-600"
          bgColor="bg-gradient-to-br from-violet-50 to-purple-50"
          title="فحص خريطة الموقع"
          description="يفحص ملف Sitemap.xml ويحسب عدد الروابط المُهيأة للأرشفة"
          buttonLabel="فحص Sitemap الآن"
          buttonColor="bg-violet-600 hover:bg-violet-700"
          onAction={handleSitemapCheck}
        />
      </div>

      {/* Guide section */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mt-2">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">lightbulb</span>
          دليل الأرشفة — ماذا يعني كل زر؟
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="font-bold text-blue-700 mb-1">تحديث كاش الموقع</p>
            <p className="text-stone-600">عند إضافة منتج جديد أو تعديل الإعدادات، اضغط هذا الزر حتى تظهر التغييرات فوراً للزوار ولعناكب جوجل.</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="font-bold text-emerald-700 mb-1">إرسال لمحركات البحث</p>
            <p className="text-stone-600">يُخبر جوجل وبينج بوجود صفحات جديدة أو محدثة. يُقلل وقت الظهور في نتائج البحث من أيام لساعات!</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-4">
            <p className="font-bold text-violet-700 mb-1">فحص Sitemap</p>
            <p className="text-stone-600">يتحقق أن ملف sitemap.xml يعمل بشكل صحيح ويعرض عدد الروابط المُدرجة للأرشفة.</p>
          </div>
        </div>

        <div className="mt-4 bg-stone-50 rounded-xl p-4 border border-stone-100">
          <p className="font-bold text-stone-700 text-sm mb-2">📅 متى يجب الضغط على هذه الأزرار؟</p>
          <ul className="text-sm text-stone-600 space-y-1">
            <li className="flex items-start gap-2"><span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">check_circle</span>بعد إضافة أو تعديل أي منتج</li>
            <li className="flex items-start gap-2"><span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">check_circle</span>بعد تغيير إعدادات الهوية البصرية</li>
            <li className="flex items-start gap-2"><span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">check_circle</span>بعد إضافة مقالات جديدة للمدونة</li>
            <li className="flex items-start gap-2"><span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">check_circle</span>أسبوعياً بشكل دوري للحفاظ على تحديث الفهرسة</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
