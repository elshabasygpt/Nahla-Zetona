import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

// This is necessary dynamically render the route with params
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminOrderInvoice({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  
  const orderId = parseInt(id);
  
  if (isNaN(orderId)) {
    return <div className="p-10 text-center font-bold text-red-500">رقم طلب غير صحيح</div>;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!order) {
    return <div className="p-10 text-center font-bold text-stone-500">هذا الطلب غير موجود أو تم حذفه</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center print:hidden">
        <Link href={`/${lang}/admin/orders`} className="text-stone-500 hover:text-primary transition-colors flex items-center gap-2 font-bold bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm">
          <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
          العودة للطلبات
        </Link>
        <button onClick={() => { if(typeof window !== 'undefined') window.print(); }} className="bg-primary text-white font-bold px-6 py-2 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2">
          <span className="material-symbols-outlined">print</span>
          طباعة الفاتورة
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-200 max-w-4xl mx-auto print:shadow-none print:border-none print:m-0 print:p-0 relative overflow-hidden group">
        
        {/* Print Brand Header */}
        <div className="flex justify-between items-start border-b-2 border-stone-100 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-3 text-primary mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".3"/>
                 <path d="M14 10h-4v4h4v-4zm-2 2h-2v2h2v-2zm4-6H8v2h8V6zm0 10H8v2h8v-2z" fill="#d97706"/>
                 <path d="M6 10h2v4H6zM16 10h2v4h-2z" fill="#00511e"/>
               </svg>
               <h1 className="text-3xl font-bold font-serif">نحلة وزيتونة</h1>
            </div>
            <p className="text-stone-500 font-medium">المنتجات الطبيعية والمغذية</p>
          </div>
          <div className="text-left rtl:text-right">
            <h2 className="text-3xl font-black text-stone-800 tracking-wider">فاتورة مبيعات</h2>
            <div className="mt-2 text-stone-500 font-mono">
              Order: <span className="text-stone-800 font-bold">#{order.orderNumber}</span>
            </div>
            <div className="text-sm mt-1 text-stone-400">
              {new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Customer & Shipping Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <h3 className="flex items-center gap-2 text-primary font-bold mb-4 border-b border-stone-200 pb-2">
              <span className="material-symbols-outlined">person</span> بيانات العميل
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><span className="text-stone-500 ml-2 shadow-sm font-medium">الاسم:</span> <strong className="text-lg">{order.customer.firstName} {order.customer.lastName}</strong></p>
              <p><span className="text-stone-500 ml-2 font-medium">الهاتف:</span> <strong dir="ltr">{order.customer.phone || order.customer.email}</strong></p>
            </div>
          </div>
          
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <h3 className="flex items-center gap-2 text-primary font-bold mb-4 border-b border-stone-200 pb-2">
              <span className="material-symbols-outlined">local_shipping</span> بيانات التوصيل
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><span className="text-stone-500 ml-2 font-medium">المحافظة:</span> <strong>{order.city}</strong></p>
              <p><span className="text-stone-500 ml-2 font-medium">العنوان:</span> <strong>{order.shippingAddress}</strong></p>
              <p><span className="text-stone-500 ml-2 font-medium">شركة الشحن:</span> <span className="uppercase text-xs tracking-widest bg-stone-200 px-2 py-0.5 rounded text-stone-600 font-bold">{order.shippingMethod}</span></p>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800">
             <span className="material-symbols-outlined text-amber-600">error</span>
             <div>
               <strong className="block mb-1">ملاحظات العميل:</strong>
               <p>{order.notes}</p>
             </div>
          </div>
        )}

        {/* Order Status (Hidden in print) */}
        <div className="mb-8 p-6 bg-surface-container-lowest border-2 border-stone-100 rounded-2xl flex justify-between items-center print:hidden">
          <div>
            <h3 className="font-bold text-stone-800">تحديث حالة الطلب</h3>
            <p className="text-stone-500 text-sm">حدد المرحلة الحالية للطلب ليتم تحديثها بالسرعة.</p>
          </div>
          <div>
            <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
          </div>
        </div>

        {/* Products Table */}
        <div className="mb-8 border border-stone-200 rounded-2xl overflow-hidden">
          <table className="w-full text-right bg-white">
            <thead className="bg-stone-50 text-stone-500 text-sm font-bold border-b border-stone-200">
              <tr>
                <th className="px-6 py-4">المنتج</th>
                <th className="px-6 py-4">العبوة/الكمية</th>
                <th className="px-6 py-4">سعر الوحدة</th>
                <th className="px-6 py-4 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <tr key={item.id} className="text-stone-800">
                  <td className="px-6 py-4 font-bold">
                    {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                  </td>
                  <td className="px-6 py-4 font-medium text-stone-600">
                    {item.quantity} x <span className="bg-stone-100 px-2 py-0.5 rounded text-xs mx-1">{/* Extract size somehow or use item price mapping, currently we dont save size in OrderItem directly. For now just show qty */} {item.quantity} عبوة</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-stone-500">
                    {item.price} ج.م
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-left text-primary">
                    {item.price * item.quantity} ج.م
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end pt-4">
          <div className="w-full max-w-sm bg-stone-50 p-6 rounded-2xl border border-stone-100">
            <div className="space-y-4 text-stone-600 font-medium">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-mono text-stone-800">{order.subtotal} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>تكلفة التوصيل:</span>
                <span className="font-mono text-stone-800">{(order.totalAmount - order.subtotal + order.discount).toFixed(2)} ج.م</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-error font-bold">
                  <span>الخصم {order.promoCode && `(${order.promoCode})`}:</span>
                  <span className="font-mono">- {order.discount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between border-t border-stone-200 pt-4 mt-2">
                <span className="text-xl font-bold text-stone-800">الإجمالي النهائي:</span>
                <span className="text-2xl font-black font-mono text-primary">{order.totalAmount} ج.م</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-stone-200/50">
                 <p className="flex justify-between text-sm">
                   <span className="text-stone-500">طريقة الدفع المختارة:</span>
                   <span className={`px-3 py-1 rounded text-xs font-bold tracking-wider uppercase ${order.paymentMethod === 'instapay' ? 'bg-[#5A2C84]/10 text-[#5A2C84]' : order.paymentMethod === 'vodafone' ? 'bg-[#E60000]/10 text-[#E60000]' : 'bg-stone-200 text-stone-700'}`}>
                     {order.paymentMethod}
                   </span>
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer print note */}
        <div className="mt-16 pt-8 border-t border-stone-100 text-center text-stone-400 text-sm hidden print:block">
          شكراً لتسوقكم مع نحلة وزيتونة. للمرتجعات يرجى التواصل معنا خلال 14 يوماً من الاستلام.
        </div>
      </div>
    </div>
  );
}
