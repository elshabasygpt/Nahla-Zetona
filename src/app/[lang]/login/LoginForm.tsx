'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/actions/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginForm({ dict, lang }: { dict: any, lang: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = lang === 'ar';

  const t = dict.auth || {
    title: 'تسجيل الدخول',
    subtitle: 'أهلاً بك مجدداً في نحلة وزيتونة',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    loginBtn: 'دخول',
    noAccount: 'ليس لديك حساب؟',
    register: 'تسجيل حساب جديد',
    forgotPassword: 'نسيت كلمة المرور؟',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    missingFields: 'يرجى تعبئة جميع الحقول',
    serverError: 'حدث خطأ في السيرفر، يرجى المحاولة لاحقاً',
    success: 'تم تسجيل الدخول بنجاح!'
  };

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const res = await loginAction(formData);
      
      if (res.success) {
        toast.success(t.success);
        router.push(`/${lang}${res.redirectUrl}`);
        router.refresh();
      } else {
        if (res.error === 'invalid_credentials') toast.error(t.invalidCredentials);
        else if (res.error === 'missing_fields') toast.error(t.missingFields);
        else toast.error(t.serverError);
      }
    } catch (err) {
      toast.error(t.serverError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-primary mb-2 line-clamp-1">{t.title}</h1>
        <p className="text-stone-500">{t.subtitle}</p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-600 block">{t.email}</label>
          <input 
            required 
            name="email" 
            type="email" 
            className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left bg-stone-50/50 hover:bg-stone-50 focus:bg-white" 
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-stone-600">{t.password}</label>
            <Link href={`/${lang}/forgot-password`} className="text-xs font-bold text-primary hover:underline">
              {t.forgotPassword}
            </Link>
          </div>
          <input 
            required 
            name="password" 
            type="password" 
            className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left bg-stone-50/50 hover:bg-stone-50 focus:bg-white" 
            dir="ltr"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : t.loginBtn}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-stone-100 text-center">
        <p className="text-stone-500 text-sm">
          {t.noAccount} <Link href={`/${lang}/register`} className="font-bold text-primary hover:underline">{t.register}</Link>
        </p>
      </div>
    </div>
  );
}
