import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminPromoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const promos = await prisma.promoCode.findMany({ orderBy: { id: 'desc' } });

  // Server Actions
  async function createPromo(formData: FormData) {
    'use server';
    const code = formData.get('code') as string;
    const discount = parseFloat(formData.get('discount') as string);
    const isPercent = formData.get('isPercent') === 'on';
    const maxUsesStr = formData.get('maxUses') as string;

    if (!code || isNaN(discount)) return;

    await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discount,
        isPercent,
        maxUses: maxUsesStr ? parseInt(maxUsesStr) : null,
      }
    });
    revalidatePath(`/${lang}/admin/promo`);
  }

  async function toggleActive(code: string, current: boolean) {
    'use server';
    await prisma.promoCode.update({
      where: { code },
      data: { isActive: !current }
    });
    revalidatePath(`/${lang}/admin/promo`);
  }

  async function deletePromo(code: string) {
    'use server';
    await prisma.promoCode.delete({ where: { code } });
    revalidatePath(`/${lang}/admin/promo`);
  }

  return (
    <div className="max-w-5xl space-y-8">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">إدارة الكوبونات والهدايا</h1>
          <p className="text-stone-500 mt-1">كوبونات الخصم التسويقية والمؤثرين.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ADD FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 lg:col-span-1 border-t-4 border-t-primary">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span> إنشاء كوبون جديد
          </h2>
          <form action={createPromo} className="space-y-4">
            <div>
               <label className="block text-sm font-bold text-stone-600 mb-1">كود الخصم (انجليزي)</label>
               <input name="code" type="text" required placeholder="e.g. SUMMER20" dir="ltr" className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:border-primary uppercase font-mono" />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                 <label className="block text-sm font-bold text-stone-600 mb-1">القيمة</label>
                 <input name="discount" type="number" step="0.01" required placeholder="10" className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:border-primary font-mono text-left rtl:text-right" />
              </div>
              <div className="w-24">
                 <label className="block text-sm font-bold text-stone-600 mb-1">النوع</label>
                 <label className="flex items-center gap-2 mt-3 cursor-pointer">
                   <input type="checkbox" name="isPercent" defaultChecked className="w-4 h-4 accent-primary" />
                   <span className="text-sm">نسبة %</span>
                 </label>
              </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-stone-600 mb-1">الحد الأقصى للاستخدام (اختياري)</label>
               <input name="maxUses" type="number" placeholder="بدون حد" className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:border-primary font-mono text-left rtl:text-right" />
            </div>

            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-container transition-colors shadow-sm mt-2">
               حفظ الكوبون
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 lg:col-span-2">
           <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
             <span className="material-symbols-outlined text-stone-400">table_rows</span> الكوبونات الحالية
           </h2>
           <div className="overflow-x-auto">
             <table className="w-full text-right">
               <thead>
                 <tr className="border-b border-stone-100 text-stone-500 text-sm">
                   <th className="py-3 font-medium">الكود</th>
                   <th className="py-3 font-medium">الخصم</th>
                   <th className="py-3 font-medium">مرات الاستخدام</th>
                   <th className="py-3 font-medium">الحالة</th>
                   <th className="py-3 font-medium">إجراء</th>
                 </tr>
               </thead>
               <tbody>
                 {promos.length === 0 && (
                   <tr><td colSpan={5} className="py-8 text-center text-stone-400">لا توجد كوبونات</td></tr>
                 )}
                 {promos.map((promo: any) => (
                   <tr key={promo.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                     <td className="py-4 font-mono font-bold text-primary">{promo.code}</td>
                     <td className="py-4 font-bold">
                       {promo.discount}{promo.isPercent ? '%' : ' ج.م'} 
                     </td>
                     <td className="py-4 text-stone-600 font-mono">
                       {promo.usedCount} / {promo.maxUses || '∞'}
                     </td>
                     <td className="py-4 text-sm">
                       {promo.isActive ? (
                         <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-bold">فعال</span>
                       ) : (
                         <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-md font-bold">معطل</span>
                       )}
                     </td>
                     <td className="py-4">
                       <div className="flex gap-2">
                         <form action={toggleActive.bind(null, promo.code, promo.isActive)}>
                           <button className={`p-1.5 rounded-lg text-white ${promo.isActive ? 'bg-stone-400 hover:bg-stone-500' : 'bg-emerald-500 hover:bg-emerald-600'}`} title="تغيير الحالة">
                             <span className="material-symbols-outlined text-sm">{promo.isActive ? 'block' : 'check_circle'}</span>
                           </button>
                         </form>
                         <form action={deletePromo.bind(null, promo.code)}>
                           <button className="p-1.5 rounded-lg bg-error text-white hover:bg-error/80" title="حذف بالكامل">
                             <span className="material-symbols-outlined text-sm">delete</span>
                           </button>
                         </form>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
