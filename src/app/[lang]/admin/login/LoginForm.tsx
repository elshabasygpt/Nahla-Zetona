'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ lang }: { lang: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to admin index
        router.push(`/${lang}/admin`);
        router.refresh(); // re-evaluate middleware if needed
      } else {
        setError(data.error || 'فشل تسجيل الدخول. تأكد من البيانات.');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالسيرفر. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-6">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md border border-stone-200">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-primary text-5xl mb-4">admin_panel_settings</span>
          <h1 className="text-3xl font-serif text-stone-800">إدارة الموقع</h1>
          <p className="text-stone-500 mt-2">تسجيل الدخول للوحة التحكم</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600 block">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="w-full bg-stone-50 border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all font-mono"
              placeholder="admin@nahlazetona.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600 block">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              className="w-full bg-stone-50 border border-stone-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all font-mono tracking-widest"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined">login</span>
            )}
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
}
