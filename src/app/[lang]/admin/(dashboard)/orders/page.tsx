import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

const prisma = new PrismaClient();

export default async function AdminOrders({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  // Fetch orders from database (including customer data)
  const orders = await prisma.order.findMany({
    include: {
      customer: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <header className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">إدارة الطلبات</h1>
          <p className="text-stone-500 mt-1">تابع أحدث المبيعات وقم بتغيير حالات الشحن لعملائك</p>
        </div>
        <div className="flex gap-2">
           <select className="bg-stone-50 border border-stone-200 text-stone-600 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/20">
             <option>جميع الحالات</option>
             <option>معلق (PENDING)</option>
             <option>قيد التجهيز (PROCESSING)</option>
             <option>مشحون (SHIPPED)</option>
             <option>مكتمل (DELIVERED)</option>
           </select>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-6xl text-stone-200 mb-4 block">receipt_long</span>
            <h3 className="text-xl font-bold text-stone-500 mb-2">لا توجد طلبات بعد</h3>
            <p className="text-stone-400">ستظهر هنا فواتير المبيعات فور إتمام أيعميل للشراء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold text-sm">
                <tr>
                  <th className="px-6 py-4">رقم الطلب</th>
                  <th className="px-6 py-4">العميل</th>
                  <th className="px-6 py-4">المبلغ الإجمالي</th>
                  <th className="px-6 py-4">طريقة الدفع</th>
                  <th className="px-6 py-4">تاريخ الطلب</th>
                  <th className="px-6 py-4">حالة الطلب</th>
                  <th className="px-6 py-4">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-stone-600">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-800">{order.customer.firstName} {order.customer.lastName}</div>
                      <div className="text-xs text-stone-500">{order.customer.phone || order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {order.totalAmount} ج.م
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${order.paymentMethod === 'instapay' ? 'bg-[#5A2C84]/10 text-[#5A2C84]' : order.paymentMethod === 'vodafone' ? 'bg-[#E60000]/10 text-[#E60000]' : 'bg-stone-100 text-stone-600'}`}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                       <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/${lang}/admin/orders/${order.id}`} className="text-primary hover:text-secondary font-bold underline decoration-2 underline-offset-4 text-sm">عرض الفاتورة</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
