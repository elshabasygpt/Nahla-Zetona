'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderStatusSelect({ orderId, currentStatus }: { orderId: number, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      } else {
        alert('حدث خطأ أثناء تحديث حالة الطلب.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ بالاتصال.');
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 font-bold',
    PENDING_PAYMENT: 'bg-orange-100 text-orange-700 font-bold',
    PROCESSING: 'bg-blue-100 text-blue-700 font-bold',
    SHIPPED: 'bg-purple-100 text-purple-700 font-bold',
    DELIVERED: 'bg-green-100 text-green-700 font-bold',
    CANCELLED: 'bg-red-100 text-red-700 font-bold',
  };

  return (
    <div className="relative inline-block">
      <select 
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isLoading}
        className={`appearance-none px-4 py-1.5 rounded-full text-xs outline-none cursor-pointer border-r-8 border-transparent transition-all hover:brightness-95 disabled:opacity-50 ${statusColors[status] || 'bg-stone-100 text-stone-600'}`}
      >
        <option value="PENDING">معلق</option>
        <option value="PENDING_PAYMENT">بانتظار التحويل</option>
        <option value="PROCESSING">قيد التجهيز</option>
        <option value="SHIPPED">مشحون</option>
        <option value="DELIVERED">تم التوصيل</option>
        <option value="CANCELLED">ملغى</option>
      </select>
      {isLoading && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      )}
    </div>
  );
}
