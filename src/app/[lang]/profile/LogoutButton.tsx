'use client';

import { logoutAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LogoutButton({ lang }: { lang: string }) {
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
    router.push(`/${lang}/login`);
    router.refresh();
  }

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-stone-500 hover:bg-red-50 hover:text-error transition-colors rounded-xl font-bold"
    >
      <span className="material-symbols-outlined">logout</span>
      {lang === 'ar' ? 'تسجيل الخروج' : 'Log out'}
    </button>
  );
}
