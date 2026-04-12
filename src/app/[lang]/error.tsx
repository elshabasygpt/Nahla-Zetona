'use client';

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-8">
      <div className="max-w-lg text-center space-y-8 py-32">
        {/* Animated icon */}
        <div className="relative mx-auto w-40 h-40">
          <div className="absolute inset-0 bg-error/10 rounded-full animate-ping" />
          <div className="relative w-40 h-40 bg-error-container rounded-full flex items-center justify-center shadow-2xl shadow-error/10">
            <span className="material-symbols-outlined text-7xl text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-serif text-primary mb-3">حدث خطأ غير متوقع</h1>
          <p className="text-stone-500 text-lg leading-relaxed">
            نعتذر عن هذا الخلل المؤقت. يمكنك المحاولة مجدداً أو العودة للرئيسية.
          </p>
          {error.digest && (
            <p className="text-xs text-stone-400 font-mono mt-2">كود الخطأ: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined">refresh</span>
            إعادة المحاولة
          </button>
          <Link
            href="/ar"
            className="bg-stone-100 text-stone-700 px-8 py-4 rounded-full font-bold hover:bg-stone-200 transition-all flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined">home</span>
            الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
