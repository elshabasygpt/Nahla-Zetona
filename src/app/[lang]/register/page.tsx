import { getDictionary, Locale } from "@/lib/dictionary";
import RegisterForm from "./RegisterForm";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return {
    title: `${lang === 'ar' ? 'إنشاء حساب' : 'Register'} | ${dict.common.brand}`,
  };
}

export default async function RegisterPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main className="min-h-[80vh] bg-surface flex flex-col justify-center items-center p-8">
      <RegisterForm dict={dict} lang={lang} />
    </main>
  );
}
