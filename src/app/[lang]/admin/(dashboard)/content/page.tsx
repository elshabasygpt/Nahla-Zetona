import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import ImageUploader from "@/components/admin/ImageUploader";
import HeroSlidesEditor from "@/components/admin/HeroSlidesEditor";
import BenefitsEditor from "@/components/admin/BenefitsEditor";
import CategoriesEditor from "@/components/admin/CategoriesEditor";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminContentPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const blocks = await (prisma as any).contentBlock.findMany({ orderBy: { id: 'asc' } });

  async function updateBlocks(formData: FormData) {
    'use server';
    
    // Save dynamic Hero Slides
    const slidesAr = formData.get('home_hero_slides_ar') as string;
    const slidesEn = formData.get('home_hero_slides_en') as string;
    if (slidesAr && slidesEn) {
       await (prisma as any).contentBlock.upsert({
         where: { key: 'home_hero_slides' },
         update: { contentAr: slidesAr, contentEn: slidesEn },
         create: { key: 'home_hero_slides', contentAr: slidesAr, contentEn: slidesEn }
       });
    }

    // Save dynamic Benefits
    const benefitsAr = formData.get('home_benefits_ar') as string;
    const benefitsEn = formData.get('home_benefits_en') as string;
    if (benefitsAr && benefitsEn) {
       await (prisma as any).contentBlock.upsert({
         where: { key: 'home_benefits' },
         update: { contentAr: benefitsAr, contentEn: benefitsEn },
         create: { key: 'home_benefits', contentAr: benefitsAr, contentEn: benefitsEn }
       });
    }

    // Save dynamic Categories
    const categoriesAr = formData.get('home_categories_ar') as string;
    const categoriesEn = formData.get('home_categories_en') as string;
    if (categoriesAr && categoriesEn) {
       await (prisma as any).contentBlock.upsert({
         where: { key: 'home_categories' },
         update: { contentAr: categoriesAr, contentEn: categoriesEn },
         create: { key: 'home_categories', contentAr: categoriesAr, contentEn: categoriesEn }
       });
    }

    const keys = formData.getAll('keys') as string[];
    
    for (const key of keys) {
      const ar = formData.get(`${key}_ar`) as string;
      const en = formData.get(`${key}_en`) as string;
      
      if (ar !== null && en !== null) {
        await (prisma as any).contentBlock.update({
          where: { key: key },
          data: { contentAr: ar, contentEn: en }
        });
      }
    }

    revalidatePath(`/${lang}`);
    revalidatePath(`/${lang}/admin/content`);
  }

  const getLabel = (key: string) => {
    const labels: Record<string, string> = {
      'home_about_title': 'عنوان قسم (من الطبيعة إليك)',
      'home_about_desc': 'محتوى قسم (من الطبيعة إليك)',
      'home_about_img': 'رابط صورة قسم قصتنا (URL)',
      'story_founder_image': 'صورة قسم المؤسس في القصتنا (URL)',
      'story_founder_name': 'اسم المؤسس',
      'story_founder_p1': 'الفقرة الأولى من رسالة المؤسس',
      'story_founder_p2': 'الفقرة الثانية من رسالة المؤسس',
      'story_founder_quote': 'مقولة المؤسس المقتبسة',
    };
    return labels[key] || key;
  };

  const oldHeroKeys = ['home_hero_title', 'home_hero_desc', 'home_hero_img', 'home_benefits', 'home_categories'];
  const filteredBlocks = blocks.filter((b: any) => !oldHeroKeys.includes(b.key) && b.key !== 'home_hero_slides');
  
  const slidesBlock = blocks.find((b: any) => b.key === 'home_hero_slides');
  const benefitsBlock = blocks.find((b: any) => b.key === 'home_benefits');
  const categoriesBlock = blocks.find((b: any) => b.key === 'home_categories');

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">واجهة المتجر والدعاية</h1>
          <p className="text-stone-500 mt-1">تعديل نصوص واجهة الموقع وتغيير صور السلايدر والميزات التنافسية</p>
        </div>
      </header>

      <form action={updateBlocks} className="space-y-6">
        
        {/* Dynamic Hero Slider Editor */}
        <HeroSlidesEditor initialDataAr={slidesBlock?.contentAr || ''} initialDataEn={slidesBlock?.contentEn || ''} />

        {/* Dynamic Benefits Editor */}
        <BenefitsEditor initialDataAr={benefitsBlock?.contentAr || ''} initialDataEn={benefitsBlock?.contentEn || ''} />

        {/* Dynamic Categories Editor */}
        <CategoriesEditor initialDataAr={categoriesBlock?.contentAr || ''} initialDataEn={categoriesBlock?.contentEn || ''} />

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
           <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2 border-b border-stone-100 pb-3">
             <span className="material-symbols-outlined text-stone-400">imagesmode</span> عناصر الترويج الإضافية
           </h2>
           
           <div className="space-y-10">
             {filteredBlocks.map((block: any) => (
                <div key={block.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="hidden" name="keys" value={block.key} />
                  
                  <div className="md:col-span-2">
                    <label className="block text-md font-bold text-primary mb-2 bg-stone-50 py-2 px-3 rounded-lg border-l-4 border-l-primary">{getLabel(block.key)}</label>
                  </div>
                  
                  {block.key.endsWith('_img') || block.key.endsWith('_image') ? (
                    <div className="md:col-span-2">
                       <ImageUploader name={`${block.key}_ar`} defaultValue={block.contentAr} label="اختر صورة للواجهة، أو ضع الرابط" />
                       <input type="hidden" name={`${block.key}_en`} value={block.contentEn || block.contentAr} />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-stone-600 mb-1">النص العربي</label>
                        {block.contentAr.length > 50 ? (
                          <textarea name={`${block.key}_ar`} defaultValue={block.contentAr} rows={4} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary resize-none" />
                        ) : (
                          <input name={`${block.key}_ar`} defaultValue={block.contentAr} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary" />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-stone-600 mb-1 text-left rtl:text-right">English Text</label>
                        {block.contentEn.length > 50 ? (
                          <textarea name={`${block.key}_en`} defaultValue={block.contentEn} dir="ltr" rows={4} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary resize-none left-align" />
                        ) : (
                          <input name={`${block.key}_en`} defaultValue={block.contentEn} dir="ltr" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none focus:border-primary" />
                        )}
                      </div>
                    </>
                  )}
                </div>
             ))}
           </div>
        </div>

        <div className="sticky bottom-6 flex justify-end">
          <button type="submit" className="bg-primary text-white font-bold px-10 py-4 rounded-xl shadow-xl hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 text-lg">
             <span className="material-symbols-outlined">publish</span> نشر التعديلات
          </button>
        </div>
      </form>
    </div>
  );
}
