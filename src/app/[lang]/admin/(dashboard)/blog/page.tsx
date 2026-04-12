import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminBlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' }
  });

  async function deleteArticle(id: number) {
    'use server';
    await prisma.article.delete({ where: { id } });
    revalidatePath(`/${lang}/admin/blog`);
  }

  return (
    <div className="max-w-6xl space-y-8">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">إدارة المدونة والمقالات</h1>
          <p className="text-stone-500 mt-1">كتابة محتوي مفيد ونشره في المدونة لتحسين السيو والمبيعات.</p>
        </div>
        <Link href={`/${lang}/admin/blog/new`} className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-container hover:text-primary transition-all flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined">add</span>
          إضافة مقال جديد
        </Link>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-stone-100 text-stone-500 text-sm">
                <th className="py-3 font-medium px-4">الصورة</th>
                <th className="py-3 font-medium">عنوان المقال</th>
                <th className="py-3 font-medium">تاريخ النشر</th>
                <th className="py-3 font-medium">الحالة</th>
                <th className="py-3 font-medium text-left px-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400 font-bold">لا توجد مقالات حالياً. ابدأ بإضافة مقالك الأول!</td>
                </tr>
              )}
              {articles.map(article => (
                <tr key={article.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50">
                  <td className="py-4 px-4 w-24">
                    <div className="w-16 h-16 rounded-lg border border-stone-200 overflow-hidden bg-stone-50">
                      {article.coverImage ? (
                        <img src={article.coverImage} alt={article.titleAr} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                           <span className="material-symbols-outlined">image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-stone-800 block text-lg">{article.titleAr}</span>
                    <span className="text-xs text-stone-500 mt-1 line-clamp-1">{article.excerptAr}</span>
                  </td>
                  <td className="py-4 text-stone-600 font-mono text-sm">
                    {new Date(article.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-4">
                    {article.published ? (
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">منشور</span>
                    ) : (
                      <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold">مسودة</span>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2 justify-end px-4">
                      <form action={deleteArticle.bind(null, article.id)}>
                        <button className="p-2 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-colors" title="حذف المقال">
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
