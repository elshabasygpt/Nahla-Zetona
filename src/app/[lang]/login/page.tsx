import { getDictionary, Locale } from "@/lib/dictionary";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as bcrypt from "bcryptjs";

export default async function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  async function login(formData: FormData) {
    "use server";
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = await prisma.customer.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      // Invalid credentials
      redirect(`/${lang}/login?error=invalid`);
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      redirect(`/${lang}/login?error=invalid`);
    }

    // Create session
    const sessionToken = await encrypt({ id: user.id, role: user.role, email: user.email });
    
    const c = await cookies();
    c.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    if (user.role === 'ADMIN') {
      redirect(`/${lang}/admin/orders`);
    } else {
      redirect(`/${lang}/profile`);
    }
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col justify-center items-center p-8">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-primary mb-2">تسجيل الدخول</h1>
          <p className="text-stone-500">أهلاً بك مجدداً في نحلة وزيتونة</p>
        </div>

        <form action={login} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600 block">البريد الإلكتروني</label>
            <input 
              required 
              name="email" 
              type="email" 
              className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left" 
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600 block">كلمة المرور</label>
            <input 
              required 
              name="password" 
              type="password" 
              className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-left" 
              dir="ltr"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            دخول
          </button>
        </form>
      </div>
    </main>
  );
}
