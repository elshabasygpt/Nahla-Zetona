'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton({ lang }: { lang: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push(`/${lang}`);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-error font-bold hover:bg-error/10 rounded-xl transition-colors">
      <span className="material-symbols-outlined">logout</span>
      تسجيل الخروج
    </button>
  );
}
