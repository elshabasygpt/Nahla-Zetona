'use client';

import { useWishlistStore, WishlistItem } from '@/store/useWishlistStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import FavoriteButton from '@/components/ui/FavoriteButton';

export default function WishlistClient({ dict, lang }: { dict: any, lang: string }) {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const isRtl = lang === 'ar';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (product: WishlistItem) => {
    // Add default variant for liquid or solid based on name logic
    const isLiquid = product.nameEn.toLowerCase().includes('oil') || product.nameAr.includes('زيت') || product.slug.includes('oil');
    const defaultSize = isLiquid 
      ? (isRtl ? '٥٠٠ مل' : '500ml')
      : (isRtl ? '٥٠٠ جم' : '500g');

    addItem({
      id: `${product.slug}-${defaultSize}`,
      name: isRtl ? product.nameAr : product.nameEn,
      price: product.price,
      image: product.img,
      quantity: 1,
      size: defaultSize
    });
  };

  if (!mounted) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-6xl text-stone-300">favorite</span>
        </div>
        <h2 className="text-3xl font-serif text-primary mb-4">{isRtl ? 'قائمة مفضلاتك فارغة' : 'Your wishlist is empty'}</h2>
        <p className="text-stone-500 max-w-md mx-auto mb-8">
          {isRtl 
            ? 'لم تقم بإضافة أي منتجات إلى مفضلتك بعد. استكشف متجرنا واكتشف منتجاتنا الطبيعية الفاخرة.'
            : 'You haven\'t added any products to your wishlist yet. Explore our shop and discover our premium natural products.'}
        </p>
        <Link 
          href={`/${lang}/shop`}
          className="bg-primary text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          {dict.nav.shop || (isRtl ? 'تصفح المنتجات' : 'Browse Products')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-12 border-b border-stone-200 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-primary">
            {isRtl ? 'المفضلة' : 'My Wishlist'}
          </h1>
          <p className="text-stone-500 mt-2">
            {items.length} {isRtl ? (items.length === 1 ? 'منتج' : 'منتجات') : (items.length === 1 ? 'item' : 'items')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((p) => {
          const currentPrice = p.price;
          const currentOriginalPrice = p.originalPrice;
          
          return (
            <div key={p.slug} className="group relative flex flex-col h-full bg-white rounded-3xl p-4 shadow-sm border border-outline-variant/30 hover:border-primary/20 hover:shadow-xl transition-all duration-500">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-surface-container-lowest mb-5 relative group-hover:shadow-[inset_0px_0px_20px_rgba(0,0,0,0.02)]">
                {currentOriginalPrice && (
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10">
                    <span className="bg-error text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow-md animate-pulse">
                      -{Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}%
                    </span>
                  </div>
                )}
                <Link href={`/${lang}/shop/${p.slug}`} className="relative block w-full h-full cursor-pointer">
                  <Image
                    src={p.img || '/og-default.jpg'}
                    alt={isRtl ? p.nameAr : p.nameEn}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] hidden md:flex">
                     <button className="bg-white text-primary px-8 py-3.5 rounded-full font-bold shadow-2xl translate-y-6 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 pointer-events-none">{dict.common.quickView || 'عرض'}</button>
                  </div>
                </Link>
                <div className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 z-20">
                  <FavoriteButton product={p} />
                </div>
              </div>
              
              <div className="flex-1 flex flex-col px-2">
                <h3 className="font-serif text-2xl text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-1">{isRtl ? p.nameAr : p.nameEn}</h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-serif text-2xl font-bold theme-price-text mb-0.5 tracking-tight border-b-2 border-primary/20 inline-block w-fit leading-none pb-1">{currentPrice} {dict.common.currency}</span>
                    {currentOriginalPrice && (
                      <span className="text-xs font-bold text-stone-400 line-through decoration-error/50 decoration-2">{currentOriginalPrice} {dict.common.currency}</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleAddToCart(p)}
                    className="w-12 h-12 bg-primary text-white rounded-xl shadow-lg hover:bg-primary-dark hover:scale-105 transition-all flex items-center justify-center"
                    aria-label={dict.common.addToCart}
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
