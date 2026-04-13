import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'promo' | 'system' | 'order';

export interface AppNotification {
  id: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  date: string;
  isRead: boolean;
  type: NotificationType;
  link?: string;
}

interface NotificationStore {
  items: AppNotification[];
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  initializeSystem: () => void;
}

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'promo-1',
    titleAr: 'خصم خاص لك! 🎉',
    titleEn: 'Special Discount for you! 🎉',
    messageAr: 'مرحباً بك في متجر نحلة وزيتونة. استخدم كود WELCOME10 للحصول على خصم 10% على أول طلب.',
    messageEn: 'Welcome to Bee & Olive. Use code WELCOME10 to get 10% off your first order.',
    date: new Date().toISOString(),
    isRead: false,
    type: 'promo',
  },
  {
    id: 'system-1',
    titleAr: 'نظام المفضلات الجديد متوفر ❤️',
    titleEn: 'New Wishlist Feature Available ❤️',
    messageAr: 'الآن يمكنك حفظ منتجاتك المفضلة والرجوع إليها في أي وقت بسهولة من أيقونة القلب.',
    messageEn: 'You can now save your favorite products and access them anytime from the heart icon.',
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isRead: false,
    type: 'system',
    link: '/wishlist'
  }
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      addNotification: (notif) => set((state) => ({
        items: [
          {
            ...notif,
            id: Math.random().toString(36).substring(7),
            date: new Date().toISOString(),
            isRead: false,
          },
          ...state.items
        ]
      })),
      markAsRead: (id) => set((state) => ({
        items: state.items.map((n) => n.id === id ? { ...n, isRead: true } : n)
      })),
      markAllAsRead: () => set((state) => ({
        items: state.items.map((n) => ({ ...n, isRead: true }))
      })),
      clearAll: () => set({ items: [] }),
      initializeSystem: () => {
        // Only seed if empty
        if (get().items.length === 0) {
          set({ items: SEED_NOTIFICATIONS });
        }
      }
    }),
    {
      name: 'bee-olive-notifications',
      partialize: (state) => ({ items: state.items }), // Persist items only
    }
  )
);
