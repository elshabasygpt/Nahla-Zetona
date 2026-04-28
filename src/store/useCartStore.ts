import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // combination of product ID and size/variant mapping
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(i => i.id === newItem.id);
        if (existingItem) {
          return {
            items: state.items.map(i => 
              i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
            )
          };
        }
        return { items: [...state.items, newItem] };
      }),
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
      })),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'bee-olive-cart',
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state like isOpen
    }
  )
);
