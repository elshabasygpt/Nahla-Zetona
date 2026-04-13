'use client';

import { useState } from 'react';
import { forgotPasswordAction } from '@/actions/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordForm({ dict, lang }: { dict: any, lang: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const isRTL = lang === 'ar';

  const t = dict.auth || {
    title: 'استعادة كلمة المرور',
    subtitle: 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين',
    email: 'البريد الإلكتروني',
    sendBtn: 'إرسال رابط الاستعادة',
    backToLogin: 'العودة لتسجيل الدخول',
    missingFields: 'يرجى إدخال البريد الإلكتروني',
    serverError: 'حدث خطأ، يرجى المحاولة لاحقاً',
    successTitle: 'تم الإرسال بنجاح!',
    successDesc: 'إذا كان البريد مسجلاً لدينا، ستتلقى رابط إعادة التعيين عليه قريباً.',
  };

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const res = await forgotPasswordAction(formData);
      
      if (res.success) {
        setIsSent(true);
        toast.success(t.successTitle);
      } else {
        if (res.error === 'missing_email') toast.error(t.missingFields);
        else toast.error(t.serverError);
      }
    } catch (err) {
      toast.error(t.serverError);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 animate-in fade-in zoom-in duration-500 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[40px]">mark_email_read</span>
        </div>
        <h2 className="text-2xl font-serif text-primary mb-2">{t.successTitle}</h2>
        <p className="text-stone-500 mb-8">{t.successDesc}</p>
        <Link 
          href={`/${lang}/login`} 
          className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
        >
          {t.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">lock_reset</span>
        </div>
        <h1 className="text-3xl font-serif text-primary mb-2 line-clamp-1">{t.title}</h1>
        <p className="text-stone-500 text-sm leading-relaxed">{t.subtitle}</p>
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

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : t.sendBtn}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-stone-100 text-center">
        <Link href={`/${lang}/login`} className="flex items-center justify-center gap-2 text-stone-500 hover:text-primary transition-colors font-bold text-sm">
          <span className="material-symbols-outlined text-[18px]">{isRTL ? 'arrow_forward' : 'arrow_back'}</span>
          {t.backToLogin}
        </Link>
      </div>
    </div>
  );
}
