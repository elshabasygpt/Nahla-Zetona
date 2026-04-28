import { PrismaClient } from "@prisma/client";
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  // Fetch real statistics
  const totalSalesQuery = await prisma.order.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      status: { not: 'CANCELLED' }
    }
  });

  const allOrdersCount = await prisma.order.count();
  
  const processingOrdersCount = await prisma.order.count({
    where: {
      status: { in: ['PENDING', 'PROCESSING', 'PENDING_PAYMENT'] }
    }
  });

  const activeProductsCount = await prisma.product.count();

  const activeCustomersCount = await prisma.customer.count({
    where: { role: 'USER' }
  });

  const totalSales = totalSalesQuery._sum.totalAmount || 0;
  const aov = allOrdersCount > 0 ? (totalSales / allOrdersCount) : 0;

  // Fetch recent orders
  const recentOrders = await prisma.order.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { customer: true }
  });

  // Greetings logic (Server time)
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : (hour < 18 ? 'طاب مسائك' : 'مساء الخير');

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-xs">قيد الانتظار</span>;
      case 'PROCESSING': return <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">جاري التجهيز</span>;
      case 'SHIPPED': return <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-xs">تم الشحن</span>;
      case 'DELIVERED': return <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs">مكتمل</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-xs">ملغي</span>;
      default: return <span className="bg-stone-100 text-stone-700 font-bold px-3 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Header */}
      <header className="relative bg-gradient-to-r from-primary to-secondary p-8 sm:p-10 rounded-[2rem] shadow-lg overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 text-white">
          <div className="flex items-center gap-2 mb-1 opacity-90 font-bold text-sm">
             <span className="material-symbols-outlined text-[16px]">wb_sunny</span> {greeting}
          </div>
          <h1 className="text-4xl font-extrabold mb-2">أهلاً بك في لوحة القيادة</h1>
          <p className="text-white/80 max-w-md">إليك نظرة سريعة على أداء متجرك ومؤشرات النمو اليوم.</p>
        </div>
        <div className="relative z-10 flex gap-3">
          <Link href="/ar/admin/orders" className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors border border-white/20 backdrop-blur-md">
            <span className="material-symbols-outlined text-[20px]">list_alt</span> الطلبات
          </Link>
          <Link href="/ar/shop" target="_blank" className="bg-white text-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-colors shadow-sm">
             <span className="material-symbols-outlined text-[20px]">storefront</span> عرض المتجر
          </Link>
        </div>
      </header>

      {/* Main KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col hover:border-primary/50 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">المبيعات الإجمالية</span>
          </div>
          <h3 className="text-3xl font-black text-stone-800 mb-1">{totalSales.toLocaleString('en-US')} <span className="text-lg text-stone-400">ج.م</span></h3>
          <p className="text-sm font-bold text-stone-500">من إجمالي {allOrdersCount} طلب</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col hover:border-amber-500/50 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">hourglass_empty</span>
            </div>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-lg">مهام اليوم</span>
          </div>
          <h3 className="text-3xl font-black text-stone-800 mb-1">{processingOrdersCount} <span className="text-lg text-stone-400">طلب</span></h3>
          <p className="text-sm font-bold text-stone-500">طلبات تنتظر التجهيز والشحن</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col hover:border-blue-500/50 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-1 rounded-lg">الجمهور</span>
          </div>
          <h3 className="text-3xl font-black text-stone-800 mb-1">{activeCustomersCount} <span className="text-lg text-stone-400">عميل</span></h3>
          <p className="text-sm font-bold text-stone-500">العملاء المسجلين في المتجر</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col hover:border-purple-500/50 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">calculate</span>
            </div>
            <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-1 rounded-lg">الأداء</span>
          </div>
          <h3 className="text-3xl font-black text-stone-800 mb-1">{Math.round(aov).toLocaleString('en-US')} <span className="text-lg text-stone-400">ج.م</span></h3>
          <p className="text-sm font-bold text-stone-500">متوسط قيمة الطلب الواحد</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Recent Orders Table */}
         <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
               <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary">receipt_long</span>
                 أحدث الطلبات
               </h2>
               <Link href="/ar/admin/orders" className="text-primary font-bold text-sm hover:underline">عرض الكل ({allOrdersCount})</Link>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-right text-sm">
                 <thead className="bg-stone-50/80 text-stone-500 font-bold border-b border-stone-100">
                   <tr>
                     <th className="p-4">رقم الطلب</th>
                     <th className="p-4">العميل</th>
                     <th className="p-4">تاريخ الطلب</th>
                     <th className="p-4">الإجمالي</th>
                     <th className="p-4">الحالة</th>
                   </tr>
                 </thead>
                 <tbody>
                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                        <td className="p-4 font-bold text-stone-800">{order.orderNumber}</td>
                        <td className="p-4">
                           <div className="font-bold text-stone-700">{order.customer.firstName} {order.customer.lastName}</div>
                           <div className="text-xs text-stone-400">{(order as any).city || order.shippingAddress || 'غير محدد'}</div>
                        </td>
                        <td className="p-4 text-stone-500" dir="ltr">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-black text-primary">{order.totalAmount.toLocaleString('en-US')} ج.م</td>
                        <td className="p-4">{getStatusBadge(order.status)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center justify-center text-stone-400">
                           <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">inbox</span>
                           لا توجد طلبات حديثة
                        </td>
                      </tr>
                    )}
                 </tbody>
               </table>
            </div>
         </div>

         {/* Quick Actions Panel */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">flash_on</span>
              إجراءات سريعة
            </h2>
            <div className="space-y-3">
               <Link href="/ar/admin/content" className="flex items-center justify-between p-4 rounded-xl border border-stone-100 hover:border-primary hover:bg-stone-50 transition-all group">
                 <div className="flex items-center gap-3 font-bold text-stone-700 group-hover:text-primary">
                    <span className="material-symbols-outlined bg-stone-100 group-hover:bg-primary/10 p-2 rounded-lg transition-colors">view_carousel</span>
                    إدارة واجهة المتجر
                 </div>
                 <span className="material-symbols-outlined text-stone-300 rtl:-scale-x-100">chevron_right</span>
               </Link>

               <Link href="/ar/admin/products" className="flex items-center justify-between p-4 rounded-xl border border-stone-100 hover:border-primary hover:bg-stone-50 transition-all group">
                 <div className="flex items-center gap-3 font-bold text-stone-700 group-hover:text-primary">
                    <span className="material-symbols-outlined bg-stone-100 group-hover:bg-primary/10 p-2 rounded-lg transition-colors">inventory_2</span>
                    إضافة/تعديل المنتجات
                 </div>
                 <span className="material-symbols-outlined text-stone-300 rtl:-scale-x-100">chevron_right</span>
               </Link>

               <Link href="/ar/admin/settings" className="flex items-center justify-between p-4 rounded-xl border border-stone-100 hover:border-primary hover:bg-stone-50 transition-all group">
                 <div className="flex items-center gap-3 font-bold text-stone-700 group-hover:text-primary">
                    <span className="material-symbols-outlined bg-stone-100 group-hover:bg-primary/10 p-2 rounded-lg transition-colors">settings</span>
                    إعدادات الموقع المتقدمة
                 </div>
                 <span className="material-symbols-outlined text-stone-300 rtl:-scale-x-100">chevron_right</span>
               </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100">
               <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex flex-col gap-2">
                  <h4 className="font-bold text-sm text-stone-800">حالة النظام</h4>
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> يعمل بكفاءة بجميع الخصائص</span>
                    <span>100%</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
