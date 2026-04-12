'use client';
import { useState } from 'react';

export default function BenefitsEditor({ initialDataAr = '[]', initialDataEn = '[]' }: { initialDataAr: string, initialDataEn: string }) {
  const [items, setItems] = useState(() => {
    try {
      const ar = JSON.parse(initialDataAr || '[]');
      const en = JSON.parse(initialDataEn || '[]');
      return ar.map((it: any, i: number) => ({
        id: it.id || i,
        icon: it.icon || '',
        titleAr: it.title || '',
        titleEn: en[i]?.title || '',
        descAr: it.desc || '',
        descEn: en[i]?.desc || '',
      }));
    } catch {
      return [];
    }
  });

  const generateOutput = () => {
    const ar = items.map((s: any) => ({
      id: s.id, icon: s.icon, title: s.titleAr, desc: s.descAr
    }));
    const en = items.map((s: any) => ({
      id: s.id, icon: s.icon, title: s.titleEn, desc: s.descEn
    }));
    return { ar: JSON.stringify(ar), en: JSON.stringify(en) };
  };

  const outputs = generateOutput();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 relative">
      <input type="hidden" name="home_benefits_ar" value={outputs.ar} />
      <input type="hidden" name="home_benefits_en" value={outputs.en} />
      
      <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-3">
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">verified</span> مميزات المتجر التنافسية
        </h2>
        <button type="button" onClick={() => setItems([...items, { id: Date.now() }])} className="text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20">إضافة ميزة</button>
      </div>

      <div className="space-y-4">
         {items.map((item: any, index: number) => (
           <div key={item.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 relative flex flex-col md:flex-row gap-4 items-start">
             <div className="w-16 h-16 bg-white rounded-lg border border-stone-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl text-primary">{item.icon || 'star'}</span>
             </div>
             
             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
               <div>
                 <input type="text" value={item.titleAr} onChange={e => { const n = [...items]; n[index].titleAr = e.target.value; setItems(n); }} placeholder="العنوان (عربي)" className="w-full bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none mb-2" />
                 <input type="text" value={item.descAr} onChange={e => { const n = [...items]; n[index].descAr = e.target.value; setItems(n); }} placeholder="الوصف (عربي)" className="w-full bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none text-sm" />
               </div>
               <div>
                 <input type="text" value={item.titleEn} onChange={e => { const n = [...items]; n[index].titleEn = e.target.value; setItems(n); }} placeholder="Title (English)" dir="ltr" className="w-full bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none mb-2 left-align" />
                 <input type="text" value={item.descEn} onChange={e => { const n = [...items]; n[index].descEn = e.target.value; setItems(n); }} placeholder="Description (English)" dir="ltr" className="w-full bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none text-sm left-align" />
               </div>
               <div className="md:col-span-2 flex gap-4 items-center mt-2 border-t border-stone-200 pt-2">
                 <input type="text" value={item.icon} onChange={e => { const n = [...items]; n[index].icon = e.target.value; setItems(n); }} placeholder="Google Font Icon Name (e.g. local_shipping)" dir="ltr" className="flex-1 bg-white border border-stone-200 px-3 py-1 rounded text-sm outline-none font-mono" />
                 <button type="button" onClick={() => setItems(items.filter((_: any, i: number) => i !== index))} className="text-error font-bold text-sm hover:underline">حذف</button>
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
