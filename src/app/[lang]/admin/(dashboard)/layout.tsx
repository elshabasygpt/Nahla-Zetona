import Link from "next/link";
import { headers } from "next/headers";
import LogoutButton from "./LogoutButton";

export default async function AdminLayout({ children, params }: { children: React.ReactNode, params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Simplistic Admin UI Layout wrapper
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row rtl:flex-row-reverse text-stone-800">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-xl flex flex-col min-h-screen">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <Link href={`/${lang}/admin`} className="text-2xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">admin_panel_settings</span>
            الإدارة
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href={`/${lang}/admin`} className="flex items-center gap-3 px-4 py-3 text-stone-600 font-bold hover:bg-stone-50 hover:text-primary rounded-xl transition-colors">
            <span className="material-symbols-outlined">dashboard</span>
            الرئيسية
          </Link>
          <Link href={`/${lang}/admin/products`} className="flex items-center gap-3 px-4 py-3 text-stone-600 font-bold hover:bg-stone-50 hover:text-primary rounded-xl transition-colors">
            <span className="material-symbols-outlined">inventory_2</span>
            المنتجات
          </Link>
          <Link href={`/${lang}/admin/reviews`} className="flex items-center gap-3 px-4 py-3 text-stone-600 font-bold hover:bg-stone-50 hover:text-primary rounded-xl transition-colors">
            <span className="material-symbols-outlined">reviews</span>
            المراجعات والتقييمات
          </Link>
          <Link href={`/${lang}/admin/orders`} className="flex items-center gap-3 px-4 py-3 text-stone-600 font-bold hover:bg-stone-50 hover:text-primary rounded-xl transition-colors">
            <span className="material-symbols-outlined">shopping_bag</span>
            إدارة الطلبات
          </Link>
          <Link href={`/${lang}/admin/shipping`} className="flex items-center gap-3 px-4 py-3 text-stone-600 font-bold hover:bg-stone-50 hover:text-primary rounded-xl transition-colors">
            <span className="material-symbols-outlined">local_shipping</span>
            التوصيل والشحن
          </Link>
          <Link href={`/${lang}/admin/promo`} className="flex items-center gap-3 px-4 py-3 text-stone-600 font-bold hover:bg-stone-50 hover:text-primary rounded-xl transition-colors">
            <span className="material-symbols-outlined">sell</span>
            كوبونات الخصم
          </Link>
          <Link href={`/${lang}/admin/content`} className="flex items-center gap-3 px-4 py-3 text-stone-600 font-bold hover:bg-stone-50 hover:text-primary rounded-xl transition-colors">
            <span className="material-symbols-outlined">imagesmode</span>
            واجهة المتجر والدعاية
          </Link>
          <Link href={`/${lang}/admin/settings`} className="flex items-center gap-3 px-4 py-3 text-stone-600 font-bold hover:bg-stone-50 hover:text-primary rounded-xl transition-colors">
            <span className="material-symbols-outlined">settings</span>
            إعدادات المتجر
          </Link>
          <Link href={`/${lang}/admin/seo`} className="flex items-center gap-3 px-4 py-3 text-stone-600 font-bold hover:bg-stone-50 hover:text-emerald-700 rounded-xl transition-colors group">
            <span className="material-symbols-outlined group-hover:text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>travel_explore</span>
            <span>إدارة SEO</span>
            <span className="mr-auto bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">جديد</span>
          </Link>
        </nav>
        
        <div className="p-6 border-t border-stone-100 space-y-2">
          <Link href={`/${lang}`} className="flex items-center gap-3 px-4 py-3 text-stone-600 font-bold hover:bg-stone-50 hover:text-primary rounded-xl transition-colors">
            <span className="material-symbols-outlined">storefront</span>
            عرض المتجر
          </Link>
          <LogoutButton lang={lang} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-stone-50 p-8">
        {children}
      </main>
      
    </div>
  );
}
