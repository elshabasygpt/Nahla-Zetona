import { getDictionary, Locale } from "@/lib/dictionary";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileDashboardClient from "./ProfileDashboardClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return {
    title: `${lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'} | ${dict.common.brand}`,
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const session = await getSession();
  
  if (!session || !session.id) {
    redirect(`/${lang}/login`);
  }

  const user = await prisma.customer.findUnique({
    where: { id: session.id },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  nameAr: true,
                  nameEn: true,
                  img: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    redirect(`/${lang}/login`);
  }

  return (
    <main className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <ProfileDashboardClient 
          user={user as any} 
          lang={lang} 
          dict={dict} 
        />
      </div>
    </main>
  );
}
