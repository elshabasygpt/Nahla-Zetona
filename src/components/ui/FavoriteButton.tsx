'use client';

import { useWishlistStore, WishlistItem } from '@/store/useWishlistStore';
import { useEffect, useState } from 'react';

interface FavoriteButtonProps {
  product: WishlistItem;
  className?: string;
}

export default function FavoriteButton({ product, className = "" }: FavoriteButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { toggleItem, isInWishlist } = useWishlistStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch logic: render outline heart by default until mounted
    return (
      <button className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-stone-400 flex items-center justify-center shadow-sm border border-stone-100 ${className}`}>
        <span className="material-symbols-outlined font-light text-[22px]">favorite</span>
      </button>
    );
  }

  const isFav = isInWishlist(product.slug);

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(product);
      }}
      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-stone-100 transition-all duration-300 active:scale-90 ${
        isFav 
          ? 'bg-error/10 text-error border-error/20' 
          : 'bg-white/90 backdrop-blur-sm text-stone-400 hover:text-error hover:bg-white'
      } ${className}`}
      aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <span className="material-symbols-outlined text-[22px] transition-transform duration-300" style={isFav ? { fontVariationSettings: "'FILL' 1", transform: 'scale(1.1)' } : { fontVariationSettings: "'FILL' 0" }}>
        favorite
      </span>
    </button>
  );
}
