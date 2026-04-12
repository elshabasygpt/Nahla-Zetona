'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BlogEditorForm({ lang }: { lang: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    excerptAr: '',
    excerptEn: '',
    published: true,
  });

  const insertTag = (tag: string, field: 'contentAr' | 'contentEn') => {
    let openTag = `<${tag}>`;
    let closeTag = `</${tag}>`;
    if (tag === 'br') { closeTag = ''; openTag = '<br/>'; }
    if (tag === 'h2') { openTag = '<h2 class="text-2xl font-bold text-primary mb-4">'; }
    if (tag === 'p') { openTag = '<p class="mb-4 text-stone-700 leading-relaxed">'; }
    
    setFormData(prev => ({ ...prev, [field]: prev[field] + openTag + 'text' + closeTag }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
        if (!uploadRes.ok) throw new Error('Failed to upload image');
        const uploadJson = await uploadRes.json();
        finalImageUrl = uploadJson.url;
      }

      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, coverImage: finalImageUrl })
      });

      if (!res.ok) throw new Error('Failed to save article');
      
      router.push(`/${lang}/admin/blog`);
      router.refresh();
      
    } catch (err) {
      alert("حدث خطأ أثناء حفظ المقال.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Cover Image */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex gap-6 items-start">
        <div className="w-56 h-36 rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden bg-stone-50 shrink-0 relative group text-center cursor-pointer">
           {(imageUrl || imageFile) ? (
             <img src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} className="w-full h-full object-cover" alt="Preview"/>
           ) : (
             <div className="text-center text-stone-400 p-2">
               <span className="material-symbols-outlined text-4xl block mb-2">add_photo_alternate</span>
               <span className="text-sm font-bold">صورة الغلاف</span>
             </div>
           )}
           <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]); }} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1">عنوان المقال (عربي)</label>
            <input required value={formData.titleAr} onChange={e => setFormData({...formData, titleAr: e.target.value})} type="text" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1 text-left rtl:text-right">Title (English)</label>
            <input required value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} type="text" dir="ltr" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1">ملخص قصير (عربي)</label>
            <textarea value={formData.excerptAr} onChange={e => setFormData({...formData, excerptAr: e.target.value})} rows={2} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-600 mb-1 text-left rtl:text-right">Excerpt (English)</label>
            <textarea value={formData.excerptEn} onChange={e => setFormData({...formData, excerptEn: e.target.value})} dir="ltr" rows={2} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-6">
        <h2 className="font-bold text-lg text-primary">المحرر النصي (عربي)</h2>
        <div className="flex gap-2 mb-2 p-2 bg-stone-100 rounded-lg">
           <button type="button" onClick={() => insertTag('h2', 'contentAr')} className="px-3 py-1 bg-white border border-stone-200 rounded text-sm font-bold hover:bg-stone-50">عنوان H2</button>
           <button type="button" onClick={() => insertTag('p', 'contentAr')} className="px-3 py-1 bg-white border border-stone-200 rounded text-sm font-bold hover:bg-stone-50">فقرة</button>
           <button type="button" onClick={() => insertTag('b', 'contentAr')} className="px-3 py-1 bg-white border border-stone-200 rounded text-sm font-bold hover:bg-stone-50"><b>عريض</b></button>
           <button type="button" onClick={() => insertTag('br', 'contentAr')} className="px-3 py-1 bg-white border border-stone-200 rounded text-sm font-bold hover:bg-stone-50">سطر جديد</button>
        </div>
        <textarea required value={formData.contentAr} onChange={e => setFormData({...formData, contentAr: e.target.value})} rows={10} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary font-mono text-sm leading-loose" placeholder="اكتب محتوى المقال مع استخدام أكواد HTML البسيطة..." />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-6">
        <h2 className="font-bold text-lg text-primary text-left rtl:text-right">Text Editor (English)</h2>
        <div className="flex gap-2 mb-2 p-2 bg-stone-100 rounded-lg justify-end rtl:justify-start" dir="ltr">
           <button type="button" onClick={() => insertTag('h2', 'contentEn')} className="px-3 py-1 bg-white border border-stone-200 rounded text-sm font-bold hover:bg-stone-50">H2</button>
           <button type="button" onClick={() => insertTag('p', 'contentEn')} className="px-3 py-1 bg-white border border-stone-200 rounded text-sm font-bold hover:bg-stone-50">P</button>
           <button type="button" onClick={() => insertTag('b', 'contentEn')} className="px-3 py-1 bg-white border border-stone-200 rounded text-sm font-bold hover:bg-stone-50"><b>B</b></button>
           <button type="button" onClick={() => insertTag('br', 'contentEn')} className="px-3 py-1 bg-white border border-stone-200 rounded text-sm font-bold hover:bg-stone-50">Break</button>
        </div>
        <textarea required value={formData.contentEn} onChange={e => setFormData({...formData, contentEn: e.target.value})} dir="ltr" rows={10} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary font-mono text-sm leading-loose text-left" placeholder="Enter HTML content..." />
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-8 py-4 font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">إلغاء</button>
        <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold px-12 py-4 rounded-xl shadow-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2">
          {isSubmitting ? 'جاري الحفظ...' : 'نشر المقال'}
        </button>
      </div>
    </form>
  );
}
