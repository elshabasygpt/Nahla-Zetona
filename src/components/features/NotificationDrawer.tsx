'use client';

import { useNotificationStore } from "@/store/useNotificationStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/notifications";

export default function NotificationDrawer({ dict, lang }: { dict: any, lang: string }) {
  const { items, isOpen, closeDrawer, clearAll, initializeSystem, setDbItems } = useNotificationStore();
  const [mounted, setMounted] = useState(false);
  const isRTL = lang === 'ar';

  useEffect(() => {
    setMounted(true);
    initializeSystem();
    
    // Fetch DB notifications asynchronously if user is logged in
    async function fetchDBNotifs() {
      const res = await getUserNotifications();
      if (res.success && res.notifications) {
        // We will enrich the Zustand store with DB notifications
        setDbItems(res.notifications);
      }
    }
    fetchDBNotifs();
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
                <button 
                  onClick={async () => {
                     useNotificationStore.getState().markAllAsRead();
                     await markAllNotificationsAsRead();
                  }} 
                  className="text-primary font-bold hover:underline"
                >
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
                <div className="space-y-4">
                  {items.map((item: any) => {
                    const { icon, color } = getIconForType(item.type);
                    const title = isRTL ? item.titleAr : item.titleEn;
                    const message = isRTL ? item.messageAr : item.messageEn;
                    const dateDisplay = formatDate(item.date);
                    
                    return (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all ${item.isRead ? 'bg-white border-stone-100 opacity-70' : 'bg-surface-container-lowest border-primary/20 shadow-sm'}`}
                      >
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                            <span className="material-symbols-outlined">{icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-bold ${item.isRead ? 'text-stone-700' : 'text-stone-900'} mb-1`}>
                              {title}
                            </h3>
                            <p className="text-sm text-stone-500 leading-relaxed mb-3">
                              {message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{dateDisplay}</span>
                              
                              <div className="flex items-center gap-3">
                                {item.link && (
                                  <Link href={item.link.startsWith('/') ? `/${lang}${item.link}` : item.link} onClick={closeDrawer} className="text-xs font-bold text-primary hover:underline">
                                    {isRTL ? 'عرض التفاصيل' : 'View Details'}
                                  </Link>
                                )}
                                {!item.isRead && (
                                  <button 
                                    onClick={async () => {
                                      useNotificationStore.getState().markAsRead(item.id);
                                      if (typeof item.id === 'number') {
                                        await markNotificationAsRead(item.id);
                                      }
                                    }}
                                    className="text-xs font-bold text-stone-400 hover:text-stone-600 border border-stone-200 px-3 py-1 rounded-full transition-colors"
                                  >
                                    {isRTL ? 'كمقروء' : 'Mark Read'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
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
