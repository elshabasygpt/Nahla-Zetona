'use client';

import { useCartStore } from "@/store/useCartStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { trackPurchase } from "@/lib/pixelEvents";

export default function CheckoutForm({ dict, lang, shippingZones }: { dict: any, lang: string, shippingZones?: any[] }) {
  const { items, clearCart, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'instapay' | 'vodafone'>('cod');
  
  const getDeliveryDateString = (deliveryDaysStr: string, lang: string) => {
    const today = new Date();
    
    // Parse '2-3' or '2' into min and max
    const parts = deliveryDaysStr.split('-');
    const minDays = parseInt(parts[0]) || 0;
    const maxDays = parts.length > 1 ? parseInt(parts[1]) : minDays;

    const addBusinessDays = (date: Date, days: number) => {
      let result = new Date(date);
      let added = 0;
      while (added < days) {
        result.setDate(result.getDate() + 1);
        if (result.getDay() !== 5) { // Skip Friday (Egyptian Weekend)
          added++;
        }
      }
      return result;
    };

    const minDate = addBusinessDays(today, minDays);
    const maxDate = addBusinessDays(today, maxDays);

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
    
    if (minDays === 0 && maxDays === 0) {
      return lang === 'ar' ? 'يتم التوصيل خلال اليوم' : 'Delivered Today';
    }

    if (minDate.getTime() === maxDate.getTime()) {
      return lang === 'ar' 
        ? `يصلك: ${minDate.toLocaleDateString(locale, options)}`
        : `Delivers: ${minDate.toLocaleDateString(locale, options)}`;
    }

    return lang === 'ar'
      ? `يصلك بين ${minDate.toLocaleDateString(locale, options)} و ${maxDate.toLocaleDateString(locale, options)}`
      : `Delivers between ${minDate.toLocaleDateString(locale, options)} and ${maxDate.toLocaleDateString(locale, options)}`;
  };

  const dynamicShippingOptions = shippingZones && shippingZones.length > 0 
    ? shippingZones.map(z => ({
        id: z.id.toString(),
         nameAr: z.nameAr,
         nameEn: z.nameEn,
         price: z.cost,
         timeAr: getDeliveryDateString(z.deliveryDays, 'ar'),
         timeEn: getDeliveryDateString(z.deliveryDays, 'en'),
         img: 'https://cdn-icons-png.flaticon.com/512/10702/10702170.png'
      })) 
    : [
        { id: 'bosta', nameAr: 'بوسطة (عادي)', nameEn: 'Bosta (Standard)', price: 50, timeAr: getDeliveryDateString('2-4', 'ar'), timeEn: getDeliveryDateString('2-4', 'en'), img: 'https://logo.clearbit.com/bosta.co' }
      ];

  const shippingOptions = dynamicShippingOptions;
  const [shippingMethodId, setShippingMethodId] = useState(shippingOptions[0].id);

  // Checkout Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    notes: ''
  });

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoIsPercent, setPromoIsPercent] = useState(true);
  const [promoRawValue, setPromoRawValue] = useState(0);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    if (appliedPromo && promoRawValue > 0) {
      if (promoIsPercent) {
        setDiscount(Math.round(subtotal * (promoRawValue / 100)));
      } else {
        setDiscount(promoRawValue);
      }
    } else {
      setDiscount(0);
    }
  }, [items, appliedPromo, subtotal, promoRawValue, promoIsPercent]);

  if (!mounted) return null;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsValidatingPromo(true);
    setPromoError('');

    try {
      const res = await fetch('/api/checkout/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() })
      });
      const data = await res.json();

      if (data.valid) {
        setAppliedPromo(promoCode.toUpperCase());
        setPromoRawValue(data.discount);
        setPromoIsPercent(data.isPercent);
        setPromoError('');
      } else {
        setPromoError(lang === 'ar' ? 'كود الخصم غير صالح أو منتهي' : data.error || 'Invalid promo code');
        setDiscount(0);
        setAppliedPromo('');
        setPromoRawValue(0);
      }
    } catch(err) {
      setPromoError(lang === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const activeShipping = shippingOptions.find(s => s.id === shippingMethodId) || shippingOptions[0];
  const shippingCost = activeShipping.price;
  
  const total = subtotal + shippingCost - discount;

  const isPhoneValid = formData.phone ? /^01[0125][0-9]{8}$/.test(formData.phone) : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items,
          subtotal,
          discount,
          promoCode: appliedPromo,
          shippingCost,
          shippingMethod: shippingMethodId,
          paymentMethod,
          lang
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Fire Purchase Conversion tracking
        trackPurchase({
          orderId: data.orderNumber || data.orderId || Math.random().toString(36).substring(7),
          totalAmount: subtotal - discount + shippingCost,
          items: items.map(i => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        });
        
        setIsSuccess(true);
        setOrderId(data.orderNumber || data.orderId || Math.random().toString(36).substring(7));
        clearCart();
      } else {
        alert(data.error || "An error occurred during checkout.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    const whatsappMessage = lang === 'ar' 
      ? `مرحباً، أود تأكيد طلبي رقم: ${orderId}`
      : `Hello, I'd like to confirm my order: ${orderId}`;
      
    // Ideally this comes from settings, but hardcoded fallback for now
    const whatsappLink = `https://wa.me/201012345678?text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto py-24 px-8">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-4"
        >
          <span className="material-symbols-outlined text-5xl text-primary font-bold">check</span>
        </motion.div>
        
        <h2 className="text-4xl font-serif text-primary">{dict.checkout.successTitle}</h2>
        <p className="text-on-surface-variant leading-relaxed text-lg">{dict.checkout.successDesc}</p>
        
        <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant w-full my-6 flex flex-col gap-2">
          <p className="text-stone-500 font-bold uppercase text-sm">
            {lang === 'ar' ? 'رقم الطلب الخاص بك' : 'Your Order Number'}
          </p>
          <p className="text-3xl font-mono font-bold tracking-widest text-primary">{orderId}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            {lang === 'ar' ? 'رسالة تأكيد واتساب للمتجر' : 'Confirm via WhatsApp'}
          </a>
          <Link href={`/${lang}/shop`}>
            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95 text-center block">
              {dict.checkout.backShop}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto py-24 px-8">
        <span className="material-symbols-outlined text-8xl text-outline-variant mb-4 font-light">shopping_bag</span>
        <h2 className="text-4xl font-serif text-primary">{dict.checkout.emptyTitle}</h2>
        <p className="text-on-surface-variant text-lg">{dict.checkout.emptyDesc}</p>
        <Link href={`/${lang}/shop`}>
          <button className="mt-8 px-10 py-4 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-container transition-all active:scale-95">{dict.checkout.backShop}</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-16">
      {/* 1. Billing Form */}
      <div className="flex-1 space-y-12">
        <div>
          <h2 className="text-3xl font-serif text-primary mb-6">{dict.checkout.billing}</h2>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600 block">{dict.checkout.fname}</label>
                <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600 block">{dict.checkout.lname}</label>
                <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-600 flex justify-between">
                <span>{dict.checkout.email}</span>
                <span className="text-stone-400 font-normal">{lang === 'ar' ? '(اختياري)' : '(Optional)'}</span>
              </label>
              <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-600 flex justify-between">
                <span>{dict.checkout.phone}</span>
                <span className="text-error font-normal text-xs">{lang === 'ar' ? '(إلزامي *)' : '(Required *)'}</span>
              </label>
              <div className="relative">
                <input required name="phone" dir="ltr" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="01xxxxxxxxx" className={`w-full bg-surface-container-lowest border ${formData.phone ? (isPhoneValid ? 'border-primary focus:ring-1 focus:ring-primary' : 'border-error focus:ring-1 focus:ring-error') : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'} rounded-xl px-4 py-3 outline-none transition-all text-left`} />
                {formData.phone && (
                  <span className={`material-symbols-outlined absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 ${isPhoneValid ? 'text-primary' : 'text-error'}`}>
                    {isPhoneValid ? 'check_circle' : 'error'}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2 relative z-20">
              <label className="text-sm font-bold text-stone-600 block">{dict.checkout.city}</label>
              <CitySelector 
                value={formData.city}
                onChange={(val) => setFormData({ ...formData, city: val })}
                lang={lang}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-600 block">{dict.checkout.address}</label>
              <textarea required name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all resize-none"></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-600 flex justify-between">
                <span>{lang === 'ar' ? 'ملاحظات الطلب (التغليف أو التوصيل)' : 'Order Notes'}</span>
                <span className="text-stone-400 font-normal">{lang === 'ar' ? '(اختياري)' : '(Optional)'}</span>
              </label>
              <textarea name="notes" placeholder={lang === 'ar' ? 'مثال: برجاء الاتصال قبل الوصول بـ 30 دقيقة' : 'Example: Call 30 mins before delivery'} value={formData.notes || ''} onChange={handleInputChange} rows={2} className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all resize-none"></textarea>
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-3xl font-serif text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
            {lang === 'ar' ? 'شركات الشحن' : 'Shipping Methods'}
          </h2>
          <div className="space-y-4">
            {shippingOptions.map(option => (
              <label key={option.id} className={`flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all ${shippingMethodId === option.id ? 'border-primary bg-primary/5 shadow-md' : 'border-outline-variant hover:border-primary/40 bg-surface-container-lowest'}`}>
                <input 
                  type="radio" 
                  name="shippingCompany" 
                  value={option.id} 
                  checked={shippingMethodId === option.id} 
                  onChange={() => setShippingMethodId(option.id)}
                  className="w-5 h-5 accent-primary mt-1 shadow-sm" 
                />
                <div className="ms-4 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`font-bold text-lg ${shippingMethodId === option.id ? 'text-primary' : 'text-stone-700'}`}>
                      {lang === 'ar' ? option.nameAr : option.nameEn}
                    </p>
                    <p className="font-serif font-bold text-secondary text-lg">{option.price} {dict.common.currency}</p> 
                  </div>
                  <p className="text-sm font-medium text-stone-500 bg-stone-100 py-1 px-3 rounded-lg inline-block mt-2">
                    {lang === 'ar' ? option.timeAr : option.timeEn}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-full hidden sm:flex items-center justify-center ms-4 transition-colors p-2 bg-white border ${shippingMethodId === option.id ? 'border-primary/30 shadow-sm' : 'border-outline-variant/30'}`}>
                  <img src={option.img} alt={option.id} className="w-full h-full object-contain mix-blend-multiply" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-serif text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
            {dict.checkout.payment}
          </h2>
          <div className="space-y-4">
            <label className={`flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 shadow-md' : 'border-outline-variant hover:border-primary/50 bg-surface-container-lowest'}`}>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')}
                  className="w-5 h-5 accent-primary" 
                />
                <div className="ms-4 flex-1">
                  <p className="font-bold text-primary text-lg">{dict.checkout.cod}</p>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
              </div>
            </label>

            <label className={`flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'instapay' ? 'border-[#5A2C84] bg-[#5A2C84]/5 shadow-md' : 'border-outline-variant hover:border-[#5A2C84]/50 bg-surface-container-lowest'}`}>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  name="payment" 
                  value="instapay" 
                  checked={paymentMethod === 'instapay'} 
                  onChange={() => setPaymentMethod('instapay')}
                  className="w-5 h-5 accent-[#5A2C84]" 
                />
                <div className="ms-4 flex-1">
                  <p className="font-bold text-[#5A2C84] text-lg">{lang === 'ar' ? 'انستاباي (InstaPay)' : 'InstaPay'}</p>
                </div>
                <div className="flex items-center justify-end">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/InstaPay_Egypt_logo.svg/2560px-InstaPay_Egypt_logo.svg.png" onError={(e) => e.currentTarget.style.display = 'none'} className="h-4 object-contain brightness-0 overflow-hidden rtl:ml-2 opacity-50" alt="" />
                  <span className="material-symbols-outlined text-[#5A2C84] text-3xl ms-2">account_balance</span>
                </div>
              </div>
              {paymentMethod === 'instapay' && (
                <div className="mt-4 pt-4 border-t border-[#5A2C84]/20 ms-9 animate-fade-in text-sm text-stone-700">
                  <p className="mb-2 font-bold">{lang === 'ar' ? 'برجاء تحويل إجمالي المبلغ على الحساب التالي و إتمام الطلب:' : 'Please transfer the total amount to the following account:'}</p>
                  <div className="bg-white p-3 rounded-lg border border-[#5A2C84]/30 flex justify-center items-center text-center font-bold text-xl text-[#5A2C84]">
                    <span dir="ltr">nahlastore@instapay</span>
                  </div>
                </div>
              )}
            </label>

            <label className={`flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'vodafone' ? 'border-[#E60000] bg-[#E60000]/5 shadow-md' : 'border-outline-variant hover:border-[#E60000]/50 bg-surface-container-lowest'}`}>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  name="payment" 
                  value="vodafone" 
                  checked={paymentMethod === 'vodafone'} 
                  onChange={() => setPaymentMethod('vodafone')}
                  className="w-5 h-5 accent-[#E60000]" 
                />
                <div className="ms-4 flex-1">
                  <p className="font-bold text-[#E60000] text-lg">{lang === 'ar' ? 'فودافون كاش' : 'Vodafone Cash'}</p>
                </div>
                <div className="flex items-center justify-end">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Vodafone_logo.svg/512px-Vodafone_logo.svg.png" onError={(e) => e.currentTarget.style.display = 'none'} className="h-6 object-contain overflow-hidden opacity-80" alt="" />
                </div>
              </div>
              {paymentMethod === 'vodafone' && (
                <div className="mt-4 pt-4 border-t border-[#E60000]/20 ms-9 animate-fade-in text-sm text-stone-700">
                  <p className="mb-2 font-bold">{lang === 'ar' ? 'برجاء تحويل إجمالي المبلغ على الرقم التالي و إتمام الطلب:' : 'Please transfer the total amount to the following number:'}</p>
                  <div className="bg-white p-3 rounded-lg border border-[#E60000]/30 flex justify-center items-center text-center font-bold text-2xl tracking-widest text-[#E60000]">
                    <span dir="ltr">010 1234 5678</span>
                  </div>
                </div>
              )}
            </label>

            <label className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-outline-variant opacity-50 bg-stone-50'}`}>
              <input 
                type="radio" 
                name="payment" 
                value="card" 
                disabled
                className="w-5 h-5 accent-primary" 
              />
              <div className="ms-4 flex-1">
                <p className="font-bold text-stone-500 text-lg">{dict.checkout.card}</p>
              </div>
              <span className="material-symbols-outlined text-stone-400 text-3xl">credit_card_off</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Order Summary */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-surface-container p-6 md:p-8 rounded-3xl sticky top-32 border border-surface-container-highest">
          <h2 className="text-2xl font-serif text-primary mb-6">{dict.checkout.summary}</h2>
          
          <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
            {items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 bg-surface rounded-lg overflow-hidden shrink-0 border border-outline-variant">
                  <img src={item.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-primary text-sm line-clamp-1">{item.name}</h4>
                  
                  {/* Quantity & Delete Controls */}
                  <div className="flex items-center gap-3 mt-1.5 mb-2">
                    <div className="flex items-center bg-surface-container-lowest border border-outline-variant/60 rounded-lg overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => {
                          if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                        }}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-stone-700">{item.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-error hover:bg-error/10 rounded-full transition-colors"
                      title={lang === 'ar' ? "حذف المنتج" : "Remove item"}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>

                  <p className="font-serif font-bold text-secondary text-sm">{item.price * item.quantity} {dict.common.currency}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 border-t border-outline-variant/60 pt-6">
            <h3 className="text-sm font-bold text-stone-700 mb-3">{lang === 'ar' ? 'كود الخصم (كوبون)' : 'Promo Code'}</h3>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={promoCode} 
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={lang === 'ar' ? 'أدخل كود الخصم' : 'Enter code here'}
                className="flex-1 bg-surface border border-outline-variant rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase transition-all"
              />
              <button 
                type="button" 
                onClick={handleApplyPromo}
                disabled={isValidatingPromo}
                className="bg-stone-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-black transition-colors active:scale-95 whitespace-nowrap shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[100px]"
              >
                {isValidatingPromo ? (
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                ) : (
                  lang === 'ar' ? 'تطبيق' : 'Apply'
                )}
              </button>
            </div>
            {promoError && <p className="text-error text-xs mt-2 font-bold animate-pulse">{promoError}</p>}
            {appliedPromo && <p className="text-primary text-xs mt-2 font-bold">{lang === 'ar' ? `تم تفعيل كود (${appliedPromo}) بنجاح!` : `Code ${appliedPromo} applied successfully!`}</p>}
          </div>

          <div className="border-t border-outline-variant pt-6 space-y-4 mb-8">
            <div className="flex justify-between text-stone-600">
              <span>{dict.cart.subtotal}</span>
              <span className="font-bold">{subtotal} {dict.common.currency}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary font-bold">
                <span>{lang === 'ar' ? 'قيمة الخصم' : 'Discount'}</span>
                <span>-{discount} {dict.common.currency}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>{lang === 'ar' ? 'تكلفة الشحن :' : 'Shipping Cost :'} <span className="text-xs font-normal text-stone-400 inline-block px-2">({lang === 'ar' ? activeShipping.nameAr : activeShipping.nameEn})</span></span>
              <span className="font-bold text-secondary">{shippingCost} {dict.common.currency}</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8 pt-4 border-t border-primary/20">
            <span className="text-lg font-bold text-primary">{dict.checkout.total}</span>
            <span className="font-serif text-3xl font-bold text-secondary">{total} {dict.common.currency}</span>
          </div>

          <button 
            type="submit" 
            form="checkout-form"
            disabled={isSubmitting}
            className="hidden lg:flex w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg hover:bg-primary-container transition-all shadow-xl hover:shadow-primary/20 active:scale-95 disabled:opacity-70 justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>{dict.checkout.placeOrder} <span className="material-symbols-outlined text-sm rtl:-scale-x-100">arrow_forward</span></>
            )}
          </button>

          <div className="mt-8 flex justify-between items-start gap-2 border-t border-outline-variant/40 pt-6">
            <div className="flex flex-col items-center text-center gap-1 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
              </div>
              <span className="text-[11px] text-stone-500 font-bold leading-tight">{lang === 'ar' ? 'تسوق آمن 100%' : '100% Secure'}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
              </div>
              <span className="text-[11px] text-stone-500 font-bold leading-tight">{lang === 'ar' ? 'جودة أصلية' : 'High Quality'}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">assignment_return</span>
              </div>
              <span className="text-[11px] text-stone-500 font-bold leading-tight">{lang === 'ar' ? 'استرجاع ميسر' : 'Easy Returns'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant px-6 py-4 z-[60] flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col flex-1">
          <span className="text-xs text-stone-500 font-bold">{dict.checkout.total}</span>
          <span className="font-serif text-2xl font-bold text-secondary tracking-tight">{total} {dict.common.currency}</span>
        </div>
        <button 
          type="submit" 
          form="checkout-form"
          disabled={isSubmitting}
          className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-[0_4px_20px_rgba(20,83,45,0.2)] active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 w-auto min-w-[160px]"
        >
          {isSubmitting ? (
            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
          ) : (
            <>{dict.checkout.placeOrder} <span className="material-symbols-outlined text-[16px] rtl:-scale-x-100">arrow_forward</span></>
          )}
        </button>
      </div>
    </div>
  );
}

function CitySelector({ value, onChange, lang }: { value: string, onChange: (val: string) => void, lang: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const citiesAr = [
    "القاهرة", "الإسكندرية", "الجيزة", "القليوبية", "بورسعيد", "السويس", "الإسماعيلية", 
    "الشرقية", "الدقهلية", "الغربية", "المنوفية", "البحيرة", "كفر الشيخ", "دمياط", 
    "مطروح", "شمال سيناء", "جنوب سيناء", "الفيوم", "بني سويف", "المنيا", "أسيوط", 
    "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر", "الوادي الجديد"
  ].sort(); // Alphabetical is sometimes nice, but we can keep it standard

  const citiesEn = [
    "Cairo", "Alexandria", "Giza", "Qalyubia", "Port Said", "Suez", "Ismailia", 
    "Sharqia", "Dakahlia", "Gharbia", "Monufia", "Beheira", "Kafr El Sheikh", "Damietta", 
    "Matrouh", "North Sinai", "South Sinai", "Faiyum", "Beni Suef", "Minya", "Assiut", 
    "Sohag", "Qena", "Luxor", "Aswan", "Red Sea", "New Valley"
  ].sort();

  const cities = lang === 'ar' ? citiesAr : citiesEn;
  const filtered = cities.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full bg-surface-container-lowest border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-xl px-4 py-3 outline-none transition-all cursor-pointer flex justify-between items-center h-[50px] shadow-sm"
      >
        <span className={value ? "text-stone-800 font-bold" : "text-stone-400"}>
          {value || (lang === 'ar' ? 'اختر المدينة...' : 'Select City...')}
        </span>
        <span className={`material-symbols-outlined text-stone-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-outline-variant rounded-xl shadow-2xl z-40 overflow-hidden flex flex-col max-h-[300px]">
            <div className="p-3 border-b border-outline-variant bg-surface-container-lowest">
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                <input 
                  autoFocus
                  type="text" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث عن المحافظة...' : 'Search governorate...'}
                  className="w-full bg-surface-container border border-outline-variant/60 rounded-lg py-2.5 px-10 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <div className="overflow-y-auto w-full styled-scrollbar">
              {filtered.length > 0 ? filtered.map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    onChange(city);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full text-start px-4 py-3 hover:bg-primary/5 transition-colors text-sm border-b border-outline-variant/20 last:border-0 ${value === city ? 'font-bold text-primary bg-primary/5' : 'text-stone-700'}`}
                >
                  {city}
                </button>
              )) : (
                <div className="p-4 text-center text-stone-500 text-sm">
                  {lang === 'ar' ? 'لم نجد المحافظة' : 'Not found'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
