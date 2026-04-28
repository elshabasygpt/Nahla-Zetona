import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminProductsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  async function deleteProduct(id: number) {
    'use server';
    await prisma.product.delete({ where: { id } });
    revalidatePath(`/${lang}/admin/products`);
  }

  return (
    <div className="max-w-6xl space-y-8">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">إدارة المنتجات</h1>
          <p className="text-stone-500 mt-1">عرض، إضافة، وتعديل المنتجات المتاحة في المتجر.</p>
        </div>
        <Link href={`/${lang}/admin/products/new`} className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-container hover:text-primary transition-all flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined">add</span>
          إضافة منتج جديد
        </Link>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-stone-100 text-stone-500 text-sm">
                <th className="py-3 font-medium px-4">الصورة</th>
                <th className="py-3 font-medium">اسم المنتج</th>
                <th className="py-3 font-medium">السعر</th>
                <th className="py-3 font-medium">الحالة</th>
                <th className="py-3 font-medium">النوع</th>
                <th className="py-3 font-medium text-left px-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 font-bold">لا توجد منتجات حالياً. ابدأ بإضافة منتجك الأول!</td>
                </tr>
              )}
              {products.map(product => (
                <tr key={product.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                  <td className="py-4 px-4 w-24">
                    <div className="w-16 h-16 rounded-lg border border-stone-200 overflow-hidden bg-stone-50">
                      {product.img ? (
                        <img src={product.img} alt={product.nameAr} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                           <span className="material-symbols-outlined">image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-stone-800 block text-lg">{product.nameAr}</span>
                    <span className="text-xs text-stone-400 font-mono" dir="ltr">{product.nameEn}</span>
                  </td>
                  <td className="py-4">
                    <div className="font-bold text-primary text-lg">
                      {product.price}
                    </div>
                    {product.originalPrice && (
                      <div className="text-sm text-stone-400 line-through">
                        {product.originalPrice}
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">متاح</span>
                  </td>
                  <td className="py-4 text-sm text-stone-600 font-bold">
                    {product.isBundle ? (
                      <span className="text-secondary bg-secondary-container/50 px-2 py-1 rounded-md">مجموعة (Bundle)</span>
                    ) : 'منتج مفرد'}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2 justify-end px-4">
                      <Link href={`/${lang}/admin/products/${product.id}/edit`} className="p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200" title="تعديل المنتج">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </Link>
                      <form action={deleteProduct.bind(null, product.id)}>
                        <button className="p-2 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-colors" title="حذف المنتج">
                          <span className="material-symbols-outlined text-[20px]">delete_forever</span>
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
