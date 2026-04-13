import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  originalPrice?: number;
  img: string;
  isOffer?: boolean;
}

interface WishlistStore {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  removeItem: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (item) => set((state) => {
        const exists = state.items.some(i => i.slug === item.slug);
        if (exists) {
          return { items: state.items.filter(i => i.slug !== item.slug) };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (slug) => set((state) => ({ items: state.items.filter(i => i.slug !== slug) })),
      isInWishlist: (slug) => get().items.some(i => i.slug === slug),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'bee-olive-wishlist',
    }
  )
);
