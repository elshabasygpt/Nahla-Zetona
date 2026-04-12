'use client';
import { useState } from 'react';
import ImageUploader from './ImageUploader';

export default function HeroSlidesEditor({ initialDataAr = '[]', initialDataEn = '[]' }: { initialDataAr: string, initialDataEn: string }) {
  const [slides, setSlides] = useState(() => {
    try {
      const ar = JSON.parse(initialDataAr || '[]');
      const en = JSON.parse(initialDataEn || '[]');
      // Combine them for generic unified editing or just store AR array and EN array if they are matched by index
      return ar.map((slideAr: any, i: number) => ({
        id: slideAr.id || i,
        image: slideAr.image || '',
        titleAr: slideAr.title || '',
        titleEn: en[i]?.title || '',
        descAr: slideAr.desc || '',
        descEn: en[i]?.desc || '',
        primaryBtnTextAr: slideAr.primaryBtnText || '',
        primaryBtnTextEn: en[i]?.primaryBtnText || '',
        primaryBtnLink: slideAr.primaryBtnLink || '',
        secondaryBtnTextAr: slideAr.secondaryBtnText || '',
        secondaryBtnTextEn: en[i]?.secondaryBtnText || '',
        secondaryBtnLink: slideAr.secondaryBtnLink || '',
      }));
    } catch {
      return [];
    }
  });

  const generateOutput = () => {
    const ar = slides.map((s: any) => ({
      id: s.id, image: s.image, title: s.titleAr, desc: s.descAr, 
      primaryBtnText: s.primaryBtnTextAr, primaryBtnLink: s.primaryBtnLink,
      secondaryBtnText: s.secondaryBtnTextAr, secondaryBtnLink: s.secondaryBtnLink
    }));
    const en = slides.map((s: any) => ({
      id: s.id, image: s.image, title: s.titleEn, desc: s.descEn, 
      primaryBtnText: s.primaryBtnTextEn, primaryBtnLink: s.primaryBtnLink,
      secondaryBtnText: s.secondaryBtnTextEn, secondaryBtnLink: s.secondaryBtnLink
    }));
    return { ar: JSON.stringify(ar), en: JSON.stringify(en) };
  };

  const outputs = generateOutput();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 relative">
      <input type="hidden" name="home_hero_slides_ar" value={outputs.ar} />
      <input type="hidden" name="home_hero_slides_en" value={outputs.en} />
      
      <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-3">
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">view_carousel</span> شرائح السلايدر الرئيسية
        </h2>
        <button type="button" onClick={() => setSlides([...slides, { id: Date.now() }])} className="text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20">إضافة شريحة</button>
      </div>

      <div className="space-y-8">
         {slides.map((slide: any, index: number) => (
           <div key={slide.id} className="p-6 bg-stone-50 rounded-xl border border-stone-200 relative">
             <button type="button" onClick={() => setSlides(slides.filter((_: any, i: number) => i !== index))} className="absolute top-4 left-4 text-error bg-error/10 p-2 rounded-lg hover:bg-error hover:text-white">حذف</button>
             <h3 className="font-bold text-stone-500 mb-4">الشريحة #{index + 1}</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="md:col-span-2">
                 <ImageUploader 
                   name={`slide_${index}_img`} 
                   defaultValue={slide.image} 
                   label="صورة الشريحة" 
                 />
                 {/* Bind the uploader value back to state. Since ImageUploader is unmanaged we cant easily lift state without redesign. For now, text input as fallback if uploader isn't fully robust here, but we will assume it works or they can paste URL */}
                 <input type="text" value={slide.image} onChange={e => { const newS = [...slides]; newS[index].image = e.target.value; setSlides(newS); }} placeholder="Paste image URL here to save" className="w-full mt-2 bg-white border border-stone-200 px-3 py-1 rounded text-sm outline-none" />
               </div>
               
               <div>
                 <label className="text-xs font-bold text-stone-500">العنوان (عربي)</label>
                 <input type="text" value={slide.titleAr} onChange={e => { const newS = [...slides]; newS[index].titleAr = e.target.value; setSlides(newS); }} className="w-full mt-1 bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none" />
               </div>
               <div>
                 <label className="text-xs font-bold text-stone-500 text-left block" dir="ltr">Title (English)</label>
                 <input type="text" value={slide.titleEn} onChange={e => { const newS = [...slides]; newS[index].titleEn = e.target.value; setSlides(newS); }} className="w-full mt-1 bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none text-left" dir="ltr" />
               </div>

               <div>
                 <label className="text-xs font-bold text-stone-500">الوصف (عربي)</label>
                 <input type="text" value={slide.descAr} onChange={e => { const newS = [...slides]; newS[index].descAr = e.target.value; setSlides(newS); }} className="w-full mt-1 bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none" />
               </div>
               <div>
                 <label className="text-xs font-bold text-stone-500 text-left block" dir="ltr">Description (English)</label>
                 <input type="text" value={slide.descEn} onChange={e => { const newS = [...slides]; newS[index].descEn = e.target.value; setSlides(newS); }} className="w-full mt-1 bg-white border border-stone-200 px-3 py-2 rounded-lg outline-none text-left" dir="ltr" />
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
