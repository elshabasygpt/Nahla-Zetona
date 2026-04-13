import { getDictionary, Locale } from "@/lib/dictionary";
import LoginForm from "./LoginForm";

export default async function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main className="min-h-[80vh] bg-surface flex flex-col justify-center items-center p-8">
      <LoginForm dict={dict} lang={lang} />
    </main>
  );
}
