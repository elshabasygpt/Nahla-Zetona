import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function EditProductPage({ params }: { params: Promise<{ lang: string, id: string }> }) {
  const { lang, id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">تعديل المنتج: {product.nameAr}</h1>
          <p className="text-stone-500 mt-1">يمكنك تحديث أسعار وتفاصيل هذا المنتج.</p>
        </div>
        <Link href={`/${lang}/admin/products`} className="text-primary font-bold bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl transition-colors">
          رجوع للقائمة
        </Link>
      </header>
      
      <ProductForm 
        product={product}
        lang={lang} 
        actionUrl={`/api/admin/products/${product.id}`} 
      />
    </div>
  );
}
