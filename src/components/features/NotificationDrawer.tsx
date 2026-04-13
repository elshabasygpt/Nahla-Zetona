'use client';

import { useNotificationStore } from "@/store/useNotificationStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotificationDrawer({ dict, lang }: { dict: any, lang: string }) {
  const { items, isOpen, closeDrawer, markAsRead, markAllAsRead, clearAll, initializeSystem } = useNotificationStore();
  const [mounted, setMounted] = useState(false);
  const isRTL = lang === 'ar';

  useEffect(() => {
    setMounted(true);
    initializeSystem();
  }, [initializeSystem]);

  if (!mounted) return null;

  const unreadCount = items.filter(i => !i.isRead).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'promo': return { icon: 'campaign', color: 'text-error bg-error/10' };
      case 'order': return { icon: 'local_shipping', color: 'text-primary bg-primary/10' };
      case 'system': return { icon: 'info', color: 'text-blue-500 bg-blue-500/10' };
      default: return { icon: 'notifications', color: 'text-stone-500 bg-stone-100' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    if (diffDays === 1) return isRTL ? 'أمس' : 'Yesterday';
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 pointer-events-auto transition-opacity"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: isRTL ? '100%' : '-100%' }} // Wait, Cart is from right, Notifications from left maybe?
            // Actually, typical apps open notifications from right or bottom. We'll use the right side (same as cart)
            // Wait, Cart uses: isRTL ? '-100%' : '100%'
            // So let's match Cartesian logic:
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-surface shadow-2xl z-50 flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-container-high bg-stone-50/50">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-serif text-primary">{isRTL ? 'الإشعارات' : 'Notifications'}</h2>
                {unreadCount > 0 && (
                  <span className="bg-error text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount} {isRTL ? 'جديد' : 'New'}</span>
                )}
              </div>
              <button 
                onClick={closeDrawer}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-stone-200 hover:bg-stone-100 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-stone-500">close</span>
              </button>
            </div>

            {/* Quick Actions */}
            {items.length > 0 && (
              <div className="flex justify-between px-6 py-3 border-b border-stone-100 text-sm">
                <button onClick={markAllAsRead} className="text-primary font-bold hover:underline">
                  {isRTL ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                </button>
                <button onClick={clearAll} className="text-stone-500 hover:text-error transition-colors">
                  {isRTL ? 'مسح الكل' : 'Clear all'}
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70 p-6">
                  <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-stone-300">notifications_off</span>
                  </div>
                  <p className="text-stone-500 font-medium">{isRTL ? 'لا توجد إشعارات جديدة' : 'No new notifications'}</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-stone-100">
                  {items.map((item) => {
                    const { icon, color } = getIconForType(item.type);
                    const title = isRTL ? item.titleAr : item.titleEn;
                    const message = isRTL ? item.messageAr : item.messageEn;
                    
                    const NotificationContent = (
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                          <span className="material-symbols-outlined text-[24px]">{icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className={`font-bold ${!item.isRead ? 'text-stone-900' : 'text-stone-700'}`}>{title}</h4>
                            <span className="text-xs text-stone-400 whitespace-nowrap pt-1">{formatDate(item.date)}</span>
                          </div>
                          <p className={`text-sm ${!item.isRead ? 'text-stone-600 font-medium' : 'text-stone-500'} leading-relaxed`}>{message}</p>
                        </div>
                        {!item.isRead && (
                          <div className="w-2 h-2 bg-error rounded-full shrink-0 mt-2 shadow-sm"></div>
                        )}
                      </div>
                    );

                    const clickHandler = () => {
                      markAsRead(item.id);
                      if (!item.link) closeDrawer();
                    };

                    if (item.link) {
                      const localizedLink = item.link.startsWith('/') ? `/${lang}${item.link}` : item.link;
                      return (
                        <Link 
                          key={item.id} 
                          href={localizedLink}
                          onClick={clickHandler}
                          className={`p-6 block transition-colors hover:bg-stone-50 ${!item.isRead ? 'bg-primary/5' : ''}`}
                        >
                          {NotificationContent}
                        </Link>
                      );
                    }

                    return (
                      <div 
                        key={item.id} 
                        onClick={clickHandler}
                        className={`p-6 cursor-pointer transition-colors hover:bg-stone-50 ${!item.isRead ? 'bg-primary/5' : ''}`}
                      >
                        {NotificationContent}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
