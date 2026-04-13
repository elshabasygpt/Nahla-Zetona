'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/actions/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RegisterForm({ dict, lang }: { dict: any, lang: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = lang === 'ar';

  const t = dict.auth || {
    title: 'إنشاء حساب جديد',
    subtitle: 'انضم إلى عائلة نحلة وزيتونة للاستمتاع بتجربة تسوق فريدة',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    password: 'كلمة المرور',
    registerBtn: 'إنشاء الحساب',
    hasAccount: 'لديك حساب بالفعل؟',
    login: 'تسجيل الدخول',
    missingFields: 'يرجى تعبئة جميع الحقول',
    emailExists: 'البريد الإلكتروني مسجل مسبقاً',
    serverError: 'حدث خطأ في السيرفر، يرجى المحاولة لاحقاً',
    success: 'تم إنشاء الحساب وتسجيل الدخول بنجاح!'
  };

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const res = await registerAction(formData);
      
      if (res.success) {
        toast.success(t.success);
        router.push(`/${lang}/profile`);
        router.refresh();
      } else {
        if (res.error === 'email_exists') toast.error(t.emailExists);
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
    <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-primary mb-2 line-clamp-1">{t.title}</h1>
        <p className="text-stone-500">{t.subtitle}</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600 block">{t.firstName}</label>
            <input 
              required 
              name="firstName" 
              type="text" 
              className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-stone-50/50 hover:bg-stone-50 focus:bg-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600 block">{t.lastName}</label>
            <input 
              required 
              name="lastName" 
              type="text" 
              className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-stone-50/50 hover:bg-stone-50 focus:bg-white" 
            />
          </div>
        </div>

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
          <label className="text-sm font-bold text-stone-600 block">{t.phone}</label>
          <input 
            name="phone" 
            type="tel" 
            className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left bg-stone-50/50 hover:bg-stone-50 focus:bg-white" 
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-600 block">{t.password}</label>
          <input 
            required 
            name="password" 
            type="password" 
            minLength={6}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left bg-stone-50/50 hover:bg-stone-50 focus:bg-white" 
            dir="ltr"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : t.registerBtn}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-stone-100 text-center">
        <p className="text-stone-500 text-sm">
          {t.hasAccount} <Link href={`/${lang}/login`} className="font-bold text-primary hover:underline">{t.login}</Link>
        </p>
      </div>
    </div>
  );
}
