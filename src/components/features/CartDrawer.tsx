'use client';
import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CartDrawer({ dict, lang }: { dict: any, lang: string }) {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isRTL = lang === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 pointer-events-auto"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-container-high">
              <h2 className="text-2xl font-serif text-primary">{dict.cart.title}</h2>
              <button 
                onClick={closeCart}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-stone-500">close</span>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                  <span className="material-symbols-outlined text-6xl text-outline-variant">shopping_bag</span>
                  <p className="text-stone-500 font-medium">{dict.cart.empty}</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container-high relative group">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 rtl:right-auto rtl:left-2 w-6 h-6 flex items-center justify-center text-error bg-error/10 hover:bg-error hover:text-white rounded-full lg:opacity-0 opacity-100 group-hover:opacity-100 transition-all font-bold"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                    <div className="w-20 h-24 rounded-lg bg-surface-container-low overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-bold text-primary line-clamp-1">{item.name}</h4>
                        {item.size && <span className="text-xs text-stone-500 uppercase tracking-widest">{item.size}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-serif font-bold theme-price-text">{item.price * item.quantity} {dict.common.currency}</span>
                        <div className="flex items-center gap-3 bg-surface-container rounded-full px-2 py-1 flex-row rtl:flex-row-reverse">
                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-6 h-6 flex items-center justify-center text-primary hover:bg-stone-200 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-primary hover:bg-stone-200 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-surface-container-high bg-surface-container-lowest space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-stone-500">{dict.cart.subtotal}</span>
                  <span className="font-serif font-bold text-primary text-2xl">{total} {dict.common.currency}</span>
                </div>
                <p className="text-xs text-stone-400">{dict.cart.shippingInfo}</p>
                <button 
                  onClick={() => {
                    closeCart();
                    router.push(`/${lang}/checkout`);
                  }}
                  className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                  {dict.cart.checkout}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
