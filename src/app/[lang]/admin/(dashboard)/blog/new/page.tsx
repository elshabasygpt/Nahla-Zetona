import BlogEditorForm from "@/components/admin/BlogEditorForm";
import Link from "next/link";

export default async function NewBlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">إضافة مقال جديد</h1>
          <p className="text-stone-500 mt-1">اكتب مقالك ليتم نشره في مدونة نحلة وزيتونة.</p>
        </div>
        <Link href={`/${lang}/admin/blog`} className="text-primary font-bold bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl transition-colors">
          رجوع للقائمة
        </Link>
      </header>
      
      <BlogEditorForm lang={lang} />
    </div>
  );
}
