import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-8">
      <div className="max-w-lg text-center space-y-8 py-32">
        {/* Animated honeycomb icon */}
        <div className="relative mx-auto w-40 h-40">
          <div className="absolute inset-0 bg-secondary/10 rounded-full animate-ping" />
          <div className="relative w-40 h-40 bg-secondary-container rounded-full flex items-center justify-center shadow-2xl shadow-secondary/20">
            <span className="material-symbols-outlined text-7xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              search_off
            </span>
          </div>
        </div>

        {/* Error code */}
        <div>
          <p className="text-8xl font-black text-primary/10 select-none leading-none mb-2">404</p>
          <h1 className="text-3xl font-serif text-primary leading-snug mb-3">
            عذراً، الصفحة غير موجودة
          </h1>
          <p className="text-stone-500 text-lg leading-relaxed">
            يبدو أن الصفحة التي تبحث عنها قد انتقلت أو أُزيلت.
            <br />
            لكن لا تقلق، لا تزال منتجاتنا الطبيعية تنتظرك!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/ar"
            className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined">home</span>
            الصفحة الرئيسية
          </Link>
          <Link
            href="/ar/shop"
            className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-full font-bold hover:bg-secondary-container/80 transition-all flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            تصفح المتجر
          </Link>
        </div>

        {/* Decorative */}
        <p className="text-stone-400 text-sm">
          إذا استمرت المشكلة، تواصل معنا عبر{" "}
          <Link href="/ar/contact" className="text-primary hover:underline font-bold">
            صفحة التواصل
          </Link>
        </p>
      </div>
    </main>
  );
}
