import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminReviewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { nameAr: true, nameEn: true } } }
  });

  async function updateStatus(id: number, newStatus: string) {
    'use server';
    const review = await prisma.review.update({
      where: { id },
      data: { status: newStatus },
      include: { product: true }
    });
    revalidatePath(`/${lang}/shop/${review.product.slug}`);
    revalidatePath(`/${lang}/admin/reviews`);
  }

  async function deleteReview(id: number) {
    'use server';
    const review = await prisma.review.delete({
      where: { id },
      include: { product: true }
    });
    revalidatePath(`/${lang}/shop/${review.product.slug}`);
    revalidatePath(`/${lang}/admin/reviews`);
  }

  return (
    <div className="max-w-6xl space-y-8 pb-12">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">مراجعات وتقييمات العملاء</h1>
          <p className="text-stone-500 mt-1">التحكم في المراجعات قبل نشرها للمحافطة على جودة متجرك.</p>
        </div>
        <div className="flex gap-4">
           {/* Summary Stats can be added here */}
           <div className="text-center px-4 py-2 bg-amber-50 text-amber-700 rounded-xl">
              <span className="block text-2xl font-bold">{reviews.filter(r => r.status === 'PENDING').length}</span>
              <span className="text-xs font-bold">بانتظار المراجعة</span>
           </div>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-stone-100 text-stone-500 text-sm">
                <th className="py-3 font-medium px-4">المنتج</th>
                <th className="py-3 font-medium">العميل & التقييم</th>
                <th className="py-3 font-medium">الرأي المكتوب</th>
                <th className="py-3 font-medium">تاريخ الإضافة</th>
                <th className="py-3 font-medium">الحالة</th>
                <th className="py-3 font-medium text-left px-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 font-bold">لا توجد مراجعات حتى الآن.</td>
                </tr>
              )}
              {reviews.map(review => (
                <tr key={review.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                  <td className="py-4 px-4 align-top w-48">
                    <span className="font-bold text-sm text-stone-700 line-clamp-2">{review.product.nameAr}</span>
                  </td>
                  <td className="py-4 align-top w-48">
                    <span className="font-bold text-stone-800 block text-sm">{review.name}</span>
                    <div className="flex text-amber-500 text-xs mt-1">
                      {Array.from({length: review.rating}).map((_, i) => <span key={i} className="material-symbols-outlined filled text-[14px]">star</span>)}
                    </div>
                  </td>
                  <td className="py-4 align-top max-w-sm">
                     <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-lg">{review.comment}</p>
                  </td>
                  <td className="py-4 align-top text-stone-600 font-mono text-xs">
                    {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-4 align-top">
                    {review.status === 'PENDING' && <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">قيد المراجعة</span>}
                    {review.status === 'APPROVED' && <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">تم النشر</span>}
                    {review.status === 'REJECTED' && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">مرفوض</span>}
                  </td>
                  <td className="py-4 align-top">
                    <div className="flex gap-2 justify-end px-4">
                      {review.status === 'PENDING' && (
                        <>
                           <form action={updateStatus.bind(null, review.id, 'APPROVED')}>
                             <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors shadow-sm" title="قبول ونشر">قبول</button>
                           </form>
                           <form action={updateStatus.bind(null, review.id, 'REJECTED')}>
                             <button className="px-3 py-1.5 rounded-lg bg-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-300 transition-colors" title="رفض وإخفاء">رفض</button>
                           </form>
                        </>
                      )}
                      
                      {review.status === 'APPROVED' && (
                        <form action={updateStatus.bind(null, review.id, 'REJECTED')}>
                          <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 font-bold text-xs hover:bg-stone-100 transition-colors" title="إلغاء النشر">إخفاء</button>
                        </form>
                      )}

                      {review.status === 'REJECTED' && (
                        <form action={updateStatus.bind(null, review.id, 'APPROVED')}>
                          <button className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 font-bold text-xs hover:bg-emerald-50 transition-colors" title="تفعيل ونشر">نشر</button>
                        </form>
                      )}

                      <form action={deleteReview.bind(null, review.id)}>
                        <button className="p-1.5 rounded-lg text-error/60 hover:bg-error hover:text-white transition-colors ms-2" title="حذف بالكامل">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
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
  );
}
