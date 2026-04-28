'use client';
import { useState } from 'react';
import ImageUploader from './ImageUploader';

export default function CategoriesEditor({ initialDataAr = '[]', initialDataEn = '[]' }: { initialDataAr: string, initialDataEn: string }) {
  const [items, setItems] = useState(() => {
    try {
      const ar = JSON.parse(initialDataAr || '[]');
      const en = JSON.parse(initialDataEn || '[]');
      return ar.map((it: any, i: number) => ({
        id: it.id || i,
        image: it.image || '',
        nameAr: it.name || '',
        nameEn: en[i]?.name || '',
        link: it.link || '',
      }));
    } catch {
      return [];
    }
  });

  const generateOutput = () => {
    const ar = items.map((s: any) => ({
      id: s.id, image: s.image, name: s.nameAr, link: s.link
    }));
    const en = items.map((s: any) => ({
      id: s.id, image: s.image, name: s.nameEn, link: s.link
    }));
    return { ar: JSON.stringify(ar), en: JSON.stringify(en) };
  };

  const outputs = generateOutput();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 relative">
      <input type="hidden" name="home_categories_ar" value={outputs.ar} />
      <input type="hidden" name="home_categories_en" value={outputs.en} />
      
      <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-3">
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">category</span> عرض التصنيفات في الواجهة
        </h2>
        <button type="button" onClick={() => setItems([...items, { id: Date.now() }])} className="text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20">إضافة تصنيف</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {items.map((item: any, index: number) => (
           <div key={item.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 relative">
             <button type="button" onClick={() => setItems(items.filter((_: any, i: number) => i !== index))} className="absolute top-2 left-2 text-error text-xs hover:underline bg-white px-2 py-1 rounded shadow-sm rounded">حذف</button>
             
             <div className="mb-4">
               <ImageUploader name={`cat_${item.id}_img`} defaultValue={item.image} label="صورة التصنيف" />
               <input type="text" value={item.image} onChange={e => { const n = [...items]; n[index].image = e.target.value; setItems(n); }} placeholder="Paste image URL here to save" className="w-full mt-2 bg-white border border-stone-200 px-3 py-1 rounded text-xs outline-none" />
             </div>
             
             <div className="space-y-3">
               <div>
                 <input type="text" value={item.nameAr} onChange={e => { const n = [...items]; n[index].nameAr = e.target.value; setItems(n); }} placeholder="اسم التصنيف (عربي) مثل: العسل" className="w-full bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none text-sm" />
               </div>
               <div>
                 <input type="text" value={item.nameEn} onChange={e => { const n = [...items]; n[index].nameEn = e.target.value; setItems(n); }} placeholder="Name (English) like: Honey" dir="ltr" className="w-full bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none text-sm left-align" />
               </div>
               <div>
                 <input type="text" value={item.link} onChange={e => { const n = [...items]; n[index].link = e.target.value; setItems(n); }} placeholder="الرابط (Slug) مثل: honey" dir="ltr" className="w-full bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none text-sm font-mono" />
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
