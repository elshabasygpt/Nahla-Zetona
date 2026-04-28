'use client';

import { useState } from 'react';
import { updateProfileDetails, updatePassword } from '@/actions/profile';
import toast from 'react-hot-toast';
import LogoutButton from './LogoutButton';
import Link from 'next/link';

type OrderItem = {
  id: number;
  product: { nameAr: string; nameEn: string; img: string | null };
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: OrderItem[];
  shippingAddress: string;
};

type User = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  orders: Order[];
};

export default function ProfileDashboardClient({ user, lang, dict }: { user: User, lang: string, dict: any }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'settings'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const isRTL = lang === 'ar';
  
  // Import the global wishlist items from zustand store
  const { items: wishlistItems, toggleItem } = require('@/store/useWishlistStore').useWishlistStore();

  const t = dict?.auth || {
    welcome: 'مرحباً',
    overview: 'الرئيسية',
    myOrders: 'الطلبات السابقة',
    settings: 'إعدادات الحساب',
    personalInfo: 'المعلومات الشخصية',
    startShopping: 'ابدأ التسوق',
    date: 'التاريخ',
    status: 'الحالة',
    total: 'الإجمالي',
    orderNumber: 'رقم الطلب',
    firstName: 'الاسم الأول',
    lastName: 'الاسم الأخير',
    phone: 'رقم الهاتف',
    saveChanges: 'حفظ التعديلات',
    changePassword: 'تغيير كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    successUpdate: 'تم التحديث بنجاح',
    errorUpdate: 'حدث خطأ أثناء التحديث',
    incorrectPassword: 'كلمة المرور الحالية غير صحيحة',
    weakPassword: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    orderDetails: 'تفاصيل الطلب',
    shippingAddress: 'عنوان الشحن',
    items: 'المنتجات',
    quantity: 'الكمية',
    backToOrders: 'العودة للطلبات',
    noOrders: 'لا توجد طلبات سابقة.'
  };

  const statusMap: Record<string, string> = {
    'PENDING': isRTL ? 'قيد المراجعة' : 'Pending',
    'PROCESSING': isRTL ? 'قيد التجهيز' : 'Processing',
    'SHIPPED': isRTL ? 'تم الشحن' : 'Shipped',
    'DELIVERED': isRTL ? 'تم التوصيل' : 'Delivered',
    'CANCELLED': isRTL ? 'ملغي' : 'Cancelled',
  };

  async function handleProfileUpdate(formData: FormData) {
    setIsUpdating(true);
    const res = await updateProfileDetails(formData);
    if (res.success) {
      toast.success(t.successUpdate);
    } else {
      toast.error(t.errorUpdate);
    }
    setIsUpdating(false);
  }

  async function handlePasswordUpdate(formData: FormData) {
    setIsUpdatingPassword(true);
    const res = await updatePassword(formData);
    if (res.success) {
      toast.success(t.successUpdate);
      (document.getElementById('passwordForm') as HTMLFormElement).reset();
    } else {
      if (res.error === 'incorrect_password') {
        toast.error(t.incorrectPassword);
      } else if (res.error === 'weak_password') {
        toast.error(t.weakPassword);
      } else {
        toast.error(t.errorUpdate);
      }
    }
    setIsUpdatingPassword(false);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-72 bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex-shrink-0 sticky top-8">
        <div className="p-8 text-center border-b border-stone-50 bg-stone-50/50">
          <div className="w-20 h-20 bg-primary/10 text-primary font-serif text-3xl rounded-full flex items-center justify-center mx-auto mb-4">
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-stone-800">{user.firstName} {user.lastName}</h2>
          <p className="text-stone-500 text-sm mt-1">{user.email}</p>
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('overview'); setSelectedOrder(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            {t.overview}
          </button>
          <button 
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {t.myOrders}
            <span className={`mr-auto px-2 py-0.5 rounded-full text-xs ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'}`}>{user.orders.length}</span>
          </button>
          <button 
            onClick={() => { setActiveTab('wishlist'); setSelectedOrder(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'wishlist' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <span className="material-symbols-outlined">favorite</span>
            {isRTL ? "المفضلة" : "Wishlist"}
            <span className={`mr-auto px-2 py-0.5 rounded-full text-xs ${activeTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'}`}>{wishlistItems?.length || 0}</span>
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setSelectedOrder(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <span className="material-symbols-outlined">settings</span>
            {t.settings}
          </button>
        </nav>
        <div className="p-4 border-t border-stone-50">
          <LogoutButton lang={lang} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full relative">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-serif text-primary mb-6">{t.welcome}، {user.firstName}!</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                </div>
                <div>
                  <p className="text-stone-500 text-sm font-bold">{t.myOrders}</p>
                  <p className="text-2xl font-bold text-stone-800">{user.orders.length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">payments</span>
                </div>
                <div>
                  <p className="text-stone-500 text-sm font-bold">إجمالي المصروفات</p>
                  <p className="text-2xl font-bold text-stone-800">{user.orders.reduce((sum, o) => sum + o.totalAmount, 0)} <span className="text-sm font-normal text-stone-500">{dict?.common?.currency || 'EGP'}</span></p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-stone-800">{t.myOrders}</h2>
                <button onClick={() => setActiveTab('orders')} className="text-primary font-bold text-sm hover:underline">عرض الكل</button>
              </div>

              {user.orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-stone-500 mb-4">{t.noOrders}</p>
                  <Link href={`/${lang}/shop`} className="text-primary font-bold bg-primary/10 px-6 py-2 rounded-full">{t.startShopping}</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.orders.slice(0, 3).map(o => (
                    <button onClick={() => { setActiveTab('orders'); setSelectedOrder(o); }} key={o.id} className="w-full text-right rtl:text-right bg-stone-50 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-stone-100 transition-colors group relative">
                      {isRTL && <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all">arrow_back</span>}
                      {!isRTL && <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">arrow_forward</span>}
                      
                      <div>
                        <p className="font-bold text-primary">#{o.orderNumber}</p>
                        <p className="text-xs text-stone-500 mt-1">{new Date(o.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
                      </div>
                      <div className="flex items-center gap-4 md:ml-auto md:mr-10">
                        <span className="font-bold border bg-white px-3 py-1 rounded-lg">{o.totalAmount} {dict?.common?.currency}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                            o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {statusMap[o.status] || o.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            {selectedOrder ? (
              // Order Details View
              <div>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="flex items-center gap-2 text-stone-500 hover:text-primary mb-6 transition-colors font-bold text-sm"
                >
                  <span className="material-symbols-outlined">{isRTL ? 'arrow_forward' : 'arrow_back'}</span>
                  {t.backToOrders}
                </button>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-stone-100">
                  <div>
                    <h2 className="text-2xl font-serif text-primary">#{selectedOrder.orderNumber}</h2>
                    <p className="text-stone-500 text-sm mt-1">{new Date(selectedOrder.createdAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      selectedOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      selectedOrder.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      selectedOrder.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {statusMap[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-stone-50 p-6 rounded-2xl">
                    <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">local_shipping</span> {t.shippingAddress}</h3>
                    <p className="text-stone-600 leading-relaxed text-sm">{selectedOrder.shippingAddress || '---'}</p>
                  </div>
                  <div className="bg-stone-50 p-6 rounded-2xl flex flex-col justify-center">
                    <h3 className="font-bold text-stone-800 mb-2">{t.total}</h3>
                    <p className="text-3xl font-bold text-primary">{selectedOrder.totalAmount} <span className="text-base text-stone-500">{dict?.common?.currency}</span></p>
                  </div>
                </div>

                <h3 className="font-bold text-stone-800 mb-4">{t.items}</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-stone-100 rounded-2xl hover:bg-stone-50/50 transition-colors">
                      <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                        {item.product.img ? (
                          <img src={item.product.img} alt="Product" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-stone-300">image</span></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-800">{isRTL ? item.product.nameAr : item.product.nameEn}</h4>
                        <p className="text-stone-500 text-sm mt-1">{t.quantity}: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                        {item.price} {dict?.common?.currency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Orders List View
              <div>
                <h2 className="text-2xl font-serif text-primary mb-6">{t.myOrders}</h2>
                {user.orders.length === 0 ? (
                  <div className="text-center py-12">
                     <span className="material-symbols-outlined text-5xl text-stone-300 mb-4 block">inventory_2</span>
                    <p className="text-stone-500 mb-6">{t.noOrders}</p>
                    <Link href={`/${lang}/shop`} className="text-white font-bold bg-primary px-8 py-3 rounded-full hover:bg-primary/90 transition-colors">{t.startShopping}</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {user.orders.map(o => (
                      <div key={o.id} className="border border-stone-100 p-5 rounded-2xl hover:border-primary/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg text-primary">#{o.orderNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {statusMap[o.status] || o.status}
                            </span>
                          </div>
                          <p className="text-sm text-stone-500">{new Date(o.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
                        </div>
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                          <p className="font-bold text-stone-800 ml-auto sm:ml-0">{o.totalAmount} {dict?.common?.currency}</p>
                          <button 
                            onClick={() => setSelectedOrder(o)}
                            className="bg-stone-100 hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-sm font-bold text-stone-600 transition-colors flex items-center gap-1"
                          >
                            التفاصيل
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-serif text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">favorite</span>
              {isRTL ? "المفضلة" : "My Wishlist"}
            </h2>
            
            {wishlistItems && wishlistItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlistItems.map((item: any) => (
                  <div key={item.slug} className="flex gap-4 p-4 border border-stone-100 rounded-2xl hover:border-primary/30 transition-colors group">
                    <div className="w-24 h-24 bg-stone-50 rounded-xl overflow-hidden shadow-sm shrink-0 relative">
                      <img src={item.img} alt="Product" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => toggleItem(item)}
                        className="absolute top-1 right-1 w-7 h-7 bg-white/90 text-error rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      </button>
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <h3 className="font-bold text-stone-800 line-clamp-2">{isRTL ? item.nameAr : item.nameEn}</h3>
                      <div className="mt-auto flex items-center gap-4">
                        <p className="font-bold text-primary">{item.price} {dict?.common?.currency}</p>
                        <Link href={`/${lang}/product/${item.slug}`} className="text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                          {isRTL ? "عرض المنتج" : "View Details"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-stone-200 mb-4 block" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                <p className="text-stone-500 mb-6">{isRTL ? "قائمة المفضلة لديك فارغة حالياً." : "Your wishlist is currently empty."}</p>
                <Link href={`/${lang}/shop`} className="text-white font-bold bg-primary px-8 py-3 rounded-full hover:bg-primary/90 transition-colors">
                  {t.startShopping}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
              <h2 className="text-2xl font-serif text-primary mb-6 flex items-center gap-3"><span className="material-symbols-outlined">person</span> {t.personalInfo}</h2>
              <form action={handleProfileUpdate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-stone-500 block mb-2">{t.firstName}</label>
                    <input name="firstName" defaultValue={user.firstName} required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium text-stone-800" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-stone-500 block mb-2">{t.lastName}</label>
                    <input name="lastName" defaultValue={user.lastName} required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium text-stone-800" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-stone-500 block mb-2">{t.email} (للقراءة فقط)</label>
                  <input value={user.email} disabled className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 text-stone-400 font-medium dir-ltr text-left cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-sm font-bold text-stone-500 block mb-2">{t.phone}</label>
                  <input name="phone" defaultValue={user.phone || ''} required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium text-stone-800 dir-ltr text-left" />
                </div>
                <div className="pt-4 text-left rtl:text-left">
                  <button type="submit" disabled={isUpdating} className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 mr-auto ml-0 disabled:opacity-70">
                    {isUpdating ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <span className="material-symbols-outlined">save</span>}
                    {t.saveChanges}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
              <h2 className="text-2xl font-serif text-stone-800 mb-6 flex items-center gap-3"><span className="material-symbols-outlined text-stone-400">lock</span> {t.changePassword}</h2>
              <form id="passwordForm" action={handlePasswordUpdate} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-stone-500 block mb-2">{t.currentPassword}</label>
                  <input type="password" name="currentPassword" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all font-medium text-stone-800 dir-ltr text-left" />
                </div>
                <div>
                  <label className="text-sm font-bold text-stone-500 block mb-2">{t.newPassword}</label>
                  <input type="password" name="newPassword" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all font-medium text-stone-800 dir-ltr text-left" />
                </div>
                <div className="pt-4 text-left rtl:text-left">
                  <button type="submit" disabled={isUpdatingPassword} className="bg-stone-800 text-white font-bold px-8 py-3 rounded-xl hover:bg-black transition-all flex items-center gap-2 mr-auto ml-0 disabled:opacity-70">
                    {isUpdatingPassword ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <span className="material-symbols-outlined">key</span>}
                    تحديث كلمة المرور
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
