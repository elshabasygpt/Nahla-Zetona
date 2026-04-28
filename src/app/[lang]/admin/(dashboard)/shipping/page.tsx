import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminShippingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const zones = await prisma.shippingZone.findMany({ orderBy: { id: 'asc' } });

  // Server Actions
  async function createZone(formData: FormData) {
    'use server';
    const nameAr = formData.get('nameAr') as string;
    const nameEn = formData.get('nameEn') as string;
    const deliveryDays = formData.get('deliveryDays') as string;
    const cost = parseFloat(formData.get('cost') as string);

    if (!nameAr || !nameEn || isNaN(cost)) return;

    await prisma.shippingZone.create({
      data: { nameAr, nameEn, deliveryDays, cost }
    });
    revalidatePath(`/${lang}/admin/shipping`);
  }

  async function toggleActive(id: number, current: boolean) {
    'use server';
    await prisma.shippingZone.update({
      where: { id },
      data: { isActive: !current }
    });
    revalidatePath(`/${lang}/admin/shipping`);
  }

  async function deleteZone(id: number) {
    'use server';
    await prisma.shippingZone.delete({ where: { id } });
    revalidatePath(`/${lang}/admin/shipping`);
  }

  return (
    <div className="max-w-6xl space-y-8">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">إدارة مناطق الشحن</h1>
          <p className="text-stone-500 mt-1">تحديد أسعار التوصيل بناءً على المحافظة والمنطقة.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* ADD FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 xl:col-span-1 border-t-4 border-t-secondary sticky top-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">add_location_alt</span> منطقة جديدة
          </h2>
          <form action={createZone} className="space-y-4">
            <div>
               <label className="block text-sm font-bold text-stone-600 mb-1">المنطقة (عربي)</label>
               <input name="nameAr" type="text" required placeholder="مثال: أسوان والصعيد" className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:border-primary" />
            </div>
            
            <div>
               <label className="block text-sm font-bold text-stone-600 mb-1 text-left rtl:text-right">المنطقة (إنجليزي)</label>
               <input name="nameEn" type="text" dir="ltr" required placeholder="Aswan & Upper Egypt" className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:border-primary text-left" />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                 <label className="block text-sm font-bold text-stone-600 mb-1">التكلفة (السعر)</label>
                 <input name="cost" type="number" step="1" required placeholder="120" className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:border-primary font-mono" />
              </div>
              <div className="flex-1">
                 <label className="block text-sm font-bold text-stone-600 mb-1">تصل خلال (أيام)</label>
                 <input name="deliveryDays" type="text" placeholder="مثال: 3-5" required className="w-full bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl outline-none focus:border-primary font-mono text-center" />
              </div>
            </div>

            <button type="submit" className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-xl hover:bg-secondary-container hover:text-stone-800 transition-colors shadow-sm mt-2">
               إضافة المنطقة
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 xl:col-span-2">
           <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
             <span className="material-symbols-outlined text-stone-400">dataset</span> الدليل الحالي
           </h2>
           <div className="overflow-x-auto">
             <table className="w-full text-right">
               <thead>
                 <tr className="border-b border-stone-100 text-stone-500 text-sm">
                   <th className="py-3 font-medium px-2">الاسم</th>
                   <th className="py-3 font-medium">التكلفة</th>
                   <th className="py-3 font-medium">المدة المتوقعة</th>
                   <th className="py-3 font-medium">الحالة</th>
                   <th className="py-3 font-medium text-left px-2">الإجراء</th>
                 </tr>
               </thead>
               <tbody>
                 {zones.length === 0 && (
                   <tr><td colSpan={5} className="py-8 text-center text-stone-400">لا توجد مناطق. يرجى إضافة منطقة أولاً!</td></tr>
                 )}
                 {zones.map((zone: any) => (
                   <tr key={zone.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                     <td className="py-4 px-2">
                       <span className="font-bold text-stone-800 block">{zone.nameAr}</span>
                       <span className="text-xs text-stone-400 font-mono" dir="ltr">{zone.nameEn}</span>
                     </td>
                     <td className="py-4 font-bold text-primary text-xl">
                       {zone.cost} <span className="text-sm font-normal">ج</span>
                     </td>
                     <td className="py-4 text-stone-600 font-bold">
                       {zone.deliveryDays} أيام
                     </td>
                     <td className="py-4 text-sm">
                       {zone.isActive ? (
                         <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md font-bold">نشط</span>
                       ) : (
                         <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-md font-bold">معطل</span>
                       )}
                     </td>
                     <td className="py-4">
                       <div className="flex gap-2 justify-end px-2">
                         <form action={toggleActive.bind(null, zone.id, zone.isActive)}>
                           <button className={`p-1.5 rounded-lg text-white ${zone.isActive ? 'bg-stone-400 hover:bg-stone-500' : 'bg-emerald-500 hover:bg-emerald-600'}`} title="تغيير الحالة">
                             <span className="material-symbols-outlined text-sm">{zone.isActive ? 'visibility_off' : 'visibility'}</span>
                           </button>
                         </form>
                         <form action={deleteZone.bind(null, zone.id)}>
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
