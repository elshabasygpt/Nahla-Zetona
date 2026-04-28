'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductForm({ product, lang, actionUrl }: { product?: any, lang: string, actionUrl: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(product?.img || '');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    slug: product?.slug || '',
    nameAr: product?.nameAr || '',
    nameEn: product?.nameEn || '',
    descAr: product?.descAr || '',
    descEn: product?.descEn || '',
    price: product?.price?.toString() || '',
    originalPrice: product?.originalPrice?.toString() || '',
    badgeAr: product?.badgeAr || '',
    badgeEn: product?.badgeEn || '',
    isBundle: product?.isBundle || false,
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameEn = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      nameEn, 
      slug: prev.slug === generateSlug(prev.nameEn) || !prev.slug ? generateSlug(nameEn) : prev.slug 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let finalImageUrl = imageUrl;

      // 1. Upload image if a new file is selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });
        
        if (!uploadRes.ok) throw new Error('فشل رفع الصورة');
        const uploadJson = await uploadRes.json();
        finalImageUrl = uploadJson.url;
      }

      // 2. Submit Product Data
      const res = await fetch(actionUrl, {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          img: finalImageUrl
        })
      });

      if (!res.ok) {
        const resError = await res.json();
        throw new Error(resError.error || 'فشل حفظ المنتج');
      }

      router.push(`/${lang}/admin/products`);
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-error-container text-error px-4 py-3 rounded-xl font-bold">
          {error}
        </div>
      )}

      {/* Image Upload Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex gap-6 items-start">
        <div className="w-40 h-40 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden bg-stone-50 shrink-0 relative group">
           {(imageUrl || imageFile) ? (
             <>
               <img 
                  src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} 
                  className="w-full h-full object-cover" 
                  alt="Preview"
               />
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-white font-bold text-sm">تغيير الصورة</span>
               </div>
             </>
           ) : (
             <div className="text-center text-stone-400">
               <span className="material-symbols-outlined text-4xl block mb-2">add_photo_alternate</span>
               <span className="text-sm font-bold">رفع صورة</span>
             </div>
           )}
           <input 
             type="file" 
             accept="image/*" 
             className="absolute inset-0 opacity-0 cursor-pointer"
             onChange={(e) => {
               if (e.target.files && e.target.files[0]) {
                 setImageFile(e.target.files[0]);
               }
             }}
           />
        </div>
        <div className="pt-4">
          <h3 className="font-bold text-stone-800 text-lg">صورة المنتج الأساسية</h3>
          <p className="text-stone-500 text-sm mt-1">يُفضل استخدام صورة بخلفية شفافة (PNG) أو بيضاء بأبعاد متساوية (المربع).</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
         <h2 className="text-xl font-bold text-stone-800 border-b border-stone-100 pb-4">البيانات الأساسية</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-sm font-bold text-stone-600 mb-1">اسم المنتج (عربي)</label>
             <input required value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} type="text" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary" placeholder="عسل برسيم" />
           </div>
           <div>
             <label className="block text-sm font-bold text-stone-600 mb-1 text-left rtl:text-right">Product Name (English)</label>
             <input required value={formData.nameEn} onChange={handleNameEnChange} type="text" dir="ltr" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary" placeholder="Clover Honey" />
           </div>
           
           <div className="md:col-span-2">
             <label className="block text-sm font-bold text-stone-600 mb-1 text-left rtl:text-right">الرابط التعريفي (Slug)</label>
             <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} type="text" dir="ltr" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary font-mono text-sm" placeholder="clover-honey" />
             <p className="text-xs text-stone-400 mt-1">يُستخدم في الرابط: /shop/product/<span className="text-primary font-bold">{formData.slug || 'slug'}</span></p>
           </div>

           <div>
             <label className="block text-sm font-bold text-stone-600 mb-1">السعر (الأساسي)</label>
             <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" step="0.01" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary font-mono" placeholder="250" />
           </div>
           <div>
             <label className="block text-sm font-bold text-stone-600 mb-1">السعر (قبل الخصم) اختياري</label>
             <input value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} type="number" step="0.01" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary font-mono" placeholder="300" />
           </div>

           <div>
             <label className="block text-sm font-bold text-stone-600 mb-1">شريطة التمييز (عربي) اختياري</label>
             <input value={formData.badgeAr} onChange={e => setFormData({...formData, badgeAr: e.target.value})} type="text" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary text-secondary" placeholder="الأكثر مبيعاً" />
           </div>
           <div>
             <label className="block text-sm font-bold text-stone-600 mb-1 text-left rtl:text-right">Badge (English) Optional</label>
             <input value={formData.badgeEn} onChange={e => setFormData({...formData, badgeEn: e.target.value})} type="text" dir="ltr" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary text-secondary" placeholder="Best Seller" />
           </div>
           
           <div className="md:col-span-2">
             <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
               <input type="checkbox" checked={formData.isBundle} onChange={e => setFormData({...formData, isBundle: e.target.checked})} className="w-5 h-5 accent-secondary" />
               <div>
                 <p className="font-bold text-stone-800">هذا المنتج عبارة عن مجموعة (Bundle)</p>
                 <p className="text-xs text-stone-500 mt-0.5">عند تفعيل هذا الخيار سيتم معاملة المنتج كباقة (Box) تحتوي على منتجات متعددة.</p>
               </div>
             </label>
           </div>
         </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
         <h2 className="text-xl font-bold text-stone-800 border-b border-stone-100 pb-4">وصف المنتج</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-sm font-bold text-stone-600 mb-1">الوصف التفصيلي (عربي)</label>
             <textarea required value={formData.descAr} onChange={e => setFormData({...formData, descAr: e.target.value})} rows={5} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary resize-none" placeholder="اكتب تفاصيل ومكونات المنتج هنا..." />
           </div>
           <div>
             <label className="block text-sm font-bold text-stone-600 mb-1 text-left rtl:text-right">Description (English)</label>
             <textarea required value={formData.descEn} onChange={e => setFormData({...formData, descEn: e.target.value})} dir="ltr" rows={5} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary resize-none text-left" placeholder="Enter product details and ingredients..." />
           </div>
         </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-8 py-4 font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">
          إلغاء
        </button>
        <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold px-12 py-4 rounded-xl shadow-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 text-lg">
          {isSubmitting ? (
            <><span className="material-symbols-outlined animate-spin">progress_activity</span> جاري الحفظ...</>
          ) : (
            <><span className="material-symbols-outlined">save</span> حفظ المنتج</>
          )}
        </button>
      </div>
    </form>
  )
}
