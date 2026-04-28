'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader';

export default function SettingsForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    storeNameAr: initialData?.storeNameAr || 'نحلة وزيتونة',
    storeNameEn: initialData?.storeNameEn || 'Bee & Olive',
    logoUrl: initialData?.logoUrl || '',
    primaryColor: initialData?.primaryColor || '#00511e',
    secondaryColor: initialData?.secondaryColor || '#785700',
    priceColor: initialData?.priceColor || '#16a34a',
    textColor: initialData?.textColor || '#1c1917',
    headingColor: initialData?.headingColor || '#1c1917',
    mutedColor: initialData?.mutedColor || '#78716c',
    currencyAr: initialData?.currencyAr || 'ج.م',
    currencyEn: initialData?.currencyEn || 'EGP',
    whatsappNumber: initialData?.whatsappNumber || '',
    googleVerification: initialData?.googleVerification || '',
    gaId: initialData?.gaId || '',
    facebookPixelId: initialData?.facebookPixelId || '',
    tiktokPixelId: initialData?.tiktokPixelId || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (url: string) => {
    setFormData({ ...formData, logoUrl: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('تم تحديث الإعدادات بنجاح. سيتم تلوين المتجر بالهوية الجديدة بمجرد التحديث.');
        router.refresh();
      } else {
        alert('فشل حفظ الإعدادات.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      
      {/* Brand Names Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2 flex items-center gap-2">
           <span className="material-symbols-outlined text-stone-400">text_fields</span>
           أسماء المتجر الرئيسية
        </h3>
        
        {/* Logo Upload */}
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-6">
           <ImageUploader 
             name="logoUrl" 
             defaultValue={formData.logoUrl} 
             label="شعار المتجر (Logo)" 
             onChange={handleLogoChange}
           />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1">اسم المتجر (عربي)</label>
            <input 
              name="storeNameAr" type="text" value={formData.storeNameAr} onChange={handleChange} 
              className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1 flex justify-between">
              <span>اسم المتجر (إنجليزي)</span>
              <span className="font-mono text-xs text-stone-400 font-normal">LTR</span>
            </label>
            <input 
              name="storeNameEn" type="text" value={formData.storeNameEn} onChange={handleChange} dir="ltr"
              className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Brand Colors Definition */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2 flex items-center gap-2">
           <span className="material-symbols-outlined text-stone-400">palette</span>
           ألوان العلامة التجارية (Brand Colors)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-stone-50 p-4 rounded-2xl flex items-center gap-4 border border-stone-100">
            <input 
              type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} 
              className="w-16 h-16 rounded-xl cursor-pointer bg-transparent border-0 outline-none p-0 shrink-0"
            />
            <div className="flex-1">
              <label className="block text-sm font-bold text-stone-700">اللون الأساسي</label>
              <p className="text-[10px] text-stone-500 mb-1 line-clamp-1">للأزرار والخلفيات البارزة</p>
              <input type="text" value={formData.primaryColor} readOnly className="text-xs font-mono bg-white px-2 py-1 rounded w-full border border-stone-200 text-stone-600" />
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl flex items-center gap-4 border border-stone-100">
            <input 
              type="color" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} 
              className="w-16 h-16 rounded-xl cursor-pointer bg-transparent border-0 outline-none p-0 shrink-0"
            />
            <div className="flex-1">
              <label className="block text-sm font-bold text-stone-700">اللون الثانوي</label>
              <p className="text-[10px] text-stone-500 mb-1 line-clamp-1">للتنبيهات والإبراز الفرعي</p>
              <input type="text" value={formData.secondaryColor} readOnly className="text-xs font-mono bg-white px-2 py-1 rounded w-full border border-stone-200 text-stone-600" />
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl flex items-center gap-4 border border-stone-100">
            <input 
              type="color" name="priceColor" value={formData.priceColor} onChange={handleChange} 
              className="w-16 h-16 rounded-xl cursor-pointer bg-transparent border-0 outline-none p-0 shrink-0"
            />
            <div className="flex-1">
              <label className="block text-sm font-bold text-stone-700">لون أسعار المنتجات</label>
              <p className="text-[10px] text-stone-500 mb-1 line-clamp-1">لجذب الانتباه لسعر المنتج</p>
              <input type="text" value={formData.priceColor} readOnly className="text-xs font-mono bg-white px-2 py-1 rounded w-full border border-stone-200 text-stone-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Text Colors Definition */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
           <span className="material-symbols-outlined text-stone-400">font_download</span>
           <h3 className="text-lg font-bold text-stone-800">ألوان الخطوط والنصوص (Text Colors)</h3>
        </div>
        <p className="text-sm text-stone-500 mb-4">هذه الألوان تتحكم في قراءة الموقع بالكامل لتوفير تباين وراحة للعين حسب هوية شعارك.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-stone-50 p-4 rounded-2xl flex flex-col gap-3 border border-stone-100 border-t-4 border-t-stone-800">
            <div className="flex-1">
              <label className="block text-sm font-bold text-stone-800 mb-1">لون العناوين الرئيسية</label>
              <p className="text-xs text-stone-500 mb-2 leading-tight">ينطبق على عناوين الأقسام وأسماء المنتجات الكبيرة.</p>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="color" name="headingColor" value={formData.headingColor} onChange={handleChange} 
                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 outline-none p-0 shrink-0"
              />
              <input type="text" value={formData.headingColor} readOnly className="text-xs font-mono bg-white px-2 py-1 rounded-md w-full border border-stone-200 text-stone-600" />
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl flex flex-col gap-3 border border-stone-100 border-t-4 border-t-stone-600">
            <div className="flex-1">
              <label className="block text-sm font-bold text-stone-700 mb-1">لون النصوص الأساسي</label>
              <p className="text-xs text-stone-500 mb-2 leading-tight">ينطبق على الفقرات ونصوص الروابط والوصف العادي.</p>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="color" name="textColor" value={formData.textColor} onChange={handleChange} 
                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 outline-none p-0 shrink-0"
              />
              <input type="text" value={formData.textColor} readOnly className="text-xs font-mono bg-white px-2 py-1 rounded-md w-full border border-stone-200 text-stone-600" />
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl flex flex-col gap-3 border border-stone-100 border-t-4 border-t-stone-400">
            <div className="flex-1">
              <label className="block text-sm font-bold text-stone-500 mb-1">لون النصوص الملاحظات الفرعية</label>
              <p className="text-xs text-stone-400 mb-2 leading-tight">ينطبق على التواريخ، أو الشروط الفرعية الخفيفة.</p>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="color" name="mutedColor" value={formData.mutedColor} onChange={handleChange} 
                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 outline-none p-0 shrink-0"
              />
              <input type="text" value={formData.mutedColor} readOnly className="text-xs font-mono bg-white px-2 py-1 rounded-md w-full border border-stone-200 text-stone-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Store Logistic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2 flex items-center gap-2 mt-6">
           <span className="material-symbols-outlined text-stone-400">settings</span>
           العملات وأرقام الاتصال
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1">العملة (عربي)</label>
            <input 
              name="currencyAr" type="text" value={formData.currencyAr} onChange={handleChange} 
              className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1 text-left rtl:text-right">العملة (إنجليزي)</label>
            <input 
              name="currencyEn" type="text" value={formData.currencyEn} onChange={handleChange} dir="ltr"
              className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1">رقم الواتساب</label>
            <input 
              name="whatsappNumber" type="text" value={formData.whatsappNumber} onChange={handleChange} dir="ltr" placeholder="201xxxxxxxxx"
              className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Google SEO Integration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
           <span className="material-symbols-outlined text-stone-400">travel_explore</span>
           <h3 className="text-lg font-bold text-stone-800">تكامل جوجل (Google Integration)</h3>
        </div>
        <p className="text-sm text-stone-500">اربط الموقع بأدوات جوجل لمتابعة الزيارات والظهور في نتائج البحث.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <label className="block text-sm font-bold text-stone-700 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-green-600">manage_search</span>
              كود التحقق — Google Search Console
            </label>
            <p className="text-xs text-stone-500 mb-2">ادخل قيمة الـ <code className="bg-stone-100 px-1 rounded">content</code> من علامة meta في Search Console</p>
            <input
              name="googleVerification" type="text" value={formData.googleVerification} onChange={handleChange} dir="ltr"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-white border border-stone-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 font-mono text-sm"
            />
          </div>
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <label className="block text-sm font-bold text-stone-700 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-blue-500">bar_chart</span>
              معرف Google Analytics
            </label>
            <p className="text-xs text-stone-500 mb-2">ادخل الـ Measurement ID من حساب Analytics الخاص بك</p>
            <input
              name="gaId" type="text" value={formData.gaId} onChange={handleChange} dir="ltr"
              placeholder="G-XXXXXXXXXX"
              className="w-full bg-white border border-stone-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Social Media Pixels */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
          <span className="material-symbols-outlined text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>ads_click</span>
          <h3 className="text-lg font-bold text-stone-800">تتبع الإعلانات — Facebook & TikTok</h3>
        </div>
        <p className="text-sm text-stone-500">أضف معرفات الـ Pixel لتتبع الزيارات والمبيعات من إعلانات الفيسبوك والتيك توك.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <label className="block text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook / Meta Pixel ID
            </label>
            <p className="text-xs text-blue-600 mb-2">من Ads Manager → Events Manager → أنشئ Pixel جديد</p>
            <input
              name="facebookPixelId" type="text" value={formData.facebookPixelId} onChange={handleChange} dir="ltr"
              placeholder="1234567890123456"
              className="w-full bg-white border border-blue-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
            />
            {formData.facebookPixelId && (
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                سيُحقن الكود تلقائياً في كل صفحات الموقع
              </p>
            )}
          </div>
          <div className="bg-stone-950/5 p-4 rounded-2xl border border-stone-200">
            <label className="block text-sm font-bold text-stone-800 mb-1 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34l-.01-8.83a8.18 8.18 0 004.77 1.52V4.55a4.85 4.85 0 01-1-.14z"/></svg>
              TikTok Pixel ID
            </label>
            <p className="text-xs text-stone-500 mb-2">من TikTok Ads Manager → Assets → Events → Web Events</p>
            <input
              name="tiktokPixelId" type="text" value={formData.tiktokPixelId} onChange={handleChange} dir="ltr"
              placeholder="ABCDEFGHIJKLMNOPQRST"
              className="w-full bg-white border border-stone-200 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-stone-400/20 font-mono text-sm"
            />
            {formData.tiktokPixelId && (
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                سيُحقن الكود تلقائياً في كل صفحات الموقع
              </p>
            )}
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-bold mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">lightbulb</span>
            الأحداث التي يتتبعها الموقع تلقائياً
          </p>
          <div className="grid grid-cols-2 gap-y-1 mt-2 text-xs">
            <span>📄 PageView — كل صفحة</span>
            <span>👁️ ViewContent — صفحة المنتج</span>
            <span>🛒 AddToCart — إضافة للسلة</span>
            <span>💳 InitiateCheckout — بدء الدفع</span>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-stone-100 flex justify-end">
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
        >
          {isSaving ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">save</span>}
          {isSaving ? 'يتم تطبيق الهوية...' : 'حفظ ونشر التغييرات'}
        </button>
      </div>

    </form>
  );
}
