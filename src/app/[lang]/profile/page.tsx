import { getDictionary, Locale } from "@/lib/dictionary";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function ProfilePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isRTL = lang === 'ar';

  const session = await getSession();
  
  if (!session || !session.id) {
    redirect(`/${lang}/login`);
  }

  const user = await prisma.customer.findUnique({
    where: { id: session.id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!user) {
    redirect(`/${lang}/login`);
  }

  const t = dict.auth || {
    profileTitle: 'لوحة التحكم',
    welcome: 'مرحباً',
    personalInfo: 'المعلومات الشخصية',
    recentOrders: 'أحدث الطلبات',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    noOrders: 'لا توجد طلبات سابقة بعد.',
    startShopping: 'ابدأ التسوق',
    orderNumber: 'رقم الطلب',
    date: 'التاريخ',
    status: 'الحالة',
    total: 'الإجمالي'
  };

  const statusMap: Record<string, string> = {
    'PENDING': isRTL ? 'قيد المراجعة' : 'Pending',
    'PROCESSING': isRTL ? 'قيد التجهيز' : 'Processing',
    'SHIPPED': isRTL ? 'تم الشحن' : 'Shipped',
    'DELIVERED': isRTL ? 'تم التوصيل' : 'Delivered',
    'CANCELLED': isRTL ? 'ملغي' : 'Cancelled',
  };

  return (
    <main className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 text-primary font-serif text-2xl rounded-full flex items-center justify-center">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-serif text-primary mb-1">{t.welcome}، {user.firstName}!</h1>
              <p className="text-stone-500">{user.email}</p>
            </div>
          </div>
          <LogoutButton lang={lang} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 border border-stone-100 bg-white p-6 rounded-3xl shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-6 text-stone-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person</span>
              {t.personalInfo}
            </h2>
            <div className="space-y-4 text-stone-600">
              <div>
                <span className="text-xs text-stone-400 block mb-1">{t.email}</span>
                <p className="font-medium bg-stone-50 p-3 rounded-xl">{user.email}</p>
              </div>
              <div>
                <span className="text-xs text-stone-400 block mb-1">{t.phone}</span>
                <p className="font-medium bg-stone-50 p-3 rounded-xl dir-ltr text-left">{user.phone || '---'}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 border border-stone-100 bg-white p-6 rounded-3xl shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-stone-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">shopping_bag</span>
              {t.recentOrders}
            </h2>

            {user.orders.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-stone-300 mb-3 block">inventory_2</span>
                <p className="text-stone-500 mb-4">{t.noOrders}</p>
                <a href={`/${lang}/shop`} className="inline-block border-2 border-primary text-primary px-6 py-2 rounded-full font-bold hover:bg-primary hover:text-white transition-colors">
                  {t.startShopping}
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b-2 border-stone-100 text-stone-400 text-sm">
                      <th className="pb-4 font-normal">{t.orderNumber}</th>
                      <th className="pb-4 font-normal">{t.date}</th>
                      <th className="pb-4 font-normal">{t.status}</th>
                      <th className="pb-4 font-normal">{t.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.orders.map((o) => (
                      <tr key={o.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 font-medium text-primary">#{o.orderNumber}</td>
                        <td className="py-4 text-stone-600 text-sm">{o.createdAt.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                            o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {statusMap[o.status] || o.status}
                          </span>
                        </td>
                        <td className="py-4 font-bold theme-price-text">{o.totalAmount} {dict.common.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
