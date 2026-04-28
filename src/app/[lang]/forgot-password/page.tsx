import { getDictionary, Locale } from "@/lib/dictionary";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return {
    title: `${lang === 'ar' ? 'استعادة كلمة المرور' : 'Forgot Password'} | ${dict.common.brand}`,
  };
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main className="min-h-[80vh] bg-surface flex flex-col justify-center items-center p-8">
      <ForgotPasswordForm dict={dict} lang={lang} />
    </main>
  );
}
