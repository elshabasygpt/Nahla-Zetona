'use client';
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { trackAddToCart, trackInitiateCheckout } from "@/lib/pixelEvents";

export default function ShopGrid({ dict, products, lang }: { dict: any, products: any[], lang: string }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortMode, setSortMode] = useState<string>("newest");

  const categories = [
    { id: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
    { id: 'honey', label: lang === 'ar' ? 'عسل طبيعي' : 'Natural Honey' },
    { id: 'olive_oil', label: lang === 'ar' ? 'زيت زيتون بكر' : 'Virgin Olive Oil' }
  ];

  const filteredProducts = products.filter(p => {
    let isCategoryValid = activeCategory === 'all';
    if (activeCategory === 'honey') isCategoryValid = p.name.includes(lang === 'ar' ? 'عسل' : 'Honey');
    if (activeCategory === 'olive_oil') isCategoryValid = p.name.includes(lang === 'ar' ? 'زيت' : 'Oil');
    
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()));

    return isCategoryValid && searchMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortMode === 'price_asc') return parseInt(a.price) - parseInt(b.price);
    if (sortMode === 'price_desc') return parseInt(b.price) - parseInt(a.price);
    return 0; // Default or Newest
  });

  return (
    <div className="w-full">
      {/* Interactive Header */}
      <header className="pt-8 pb-8 md:pt-12 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant pb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-primary tracking-tight mb-4 leading-tight">{dict.shop.title}</h1>
            <p className="text-on-surface-variant max-w-md font-body leading-relaxed mb-6">
              {dict.shop.desc}
            </p>
            {/* Filter Pills */}
            <div className="flex items-center gap-3 overflow-x-auto snap-x hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-2 rounded-full font-bold text-sm cursor-pointer transition-colors border ${
                    activeCategory === cat.id 
                      ? 'bg-primary text-white shadow-md border-primary' 
                      : 'bg-surface-container hover:bg-stone-200 text-stone-700 border-stone-200/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80 lg:w-96 group">
              <span className="material-symbols-outlined absolute left-5 rtl:left-auto rtl:right-5 top-1/2 -translate-y-1/2 text-primary/60 group-hover:text-primary group-focus-within:text-primary transition-colors pointer-events-none text-[24px]">search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? "ابحث عن منتج..." : "Search products..."} 
                className="w-full bg-surface-container-lowest border-2 border-primary/20 text-stone-800 rounded-full py-4 px-14 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm hover:shadow-md hover:border-primary/40 transition-all font-medium text-base placeholder:text-stone-400"
              />
            </div>
            <div className="text-sm font-label text-stone-400 uppercase tracking-widest mt-2 px-2">
              <span>{lang === 'ar' ? `عرض ${filteredProducts.length} منتج` : `Showing ${filteredProducts.length} products`}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-8 w-full">
        {/* Sort & Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest p-4 px-6 rounded-2xl border border-outline-variant/30 shadow-sm">
          <span className="text-stone-500 font-bold text-sm">
            {lang === 'ar' ? `عرض ${sortedProducts.length} نتائج` : `Showing ${sortedProducts.length} results`}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-stone-600">{lang === 'ar' ? 'الترتيب:' : 'Sort by:'}</span>
            <select 
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="bg-white border-2 border-primary/10 text-stone-700 font-bold rounded-xl py-2.5 px-4 focus:ring-4 focus:ring-primary/10 hover:border-primary/30 outline-none text-sm cursor-pointer shadow-sm transition-all"
            >
              <option value="newest">{lang === 'ar' ? 'الأحدث' : 'Newest'}</option>
              <option value="price_asc">{lang === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
              <option value="price_desc">{lang === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-16 gap-x-8">
          {sortedProducts.map((p: any, index: number) => (
            <ProductCard key={index} p={p} dict={dict} lang={lang} />
          ))}
          {sortedProducts.length === 0 && (
            <div className="col-span-full py-24 lg:py-32 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-full flex items-center justify-center text-stone-300 mb-8 hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-5xl">search_off</span>
              </div>
              <h3 className="text-3xl font-serif text-primary mb-4">
                {lang === 'ar' ? 'عفواً، لم نجد ما تبحث عنه!' : 'Oops, no results found!'}
              </h3>
              <p className="text-stone-500 font-medium mb-10 max-w-sm leading-relaxed">
                {lang === 'ar' 
                  ? 'لا توجد منتجات تطابق كلمات البحث المطلوبة. جرب استخدام كلمات أخرى أو تصفح القائمة المتوفرة.' 
                  : 'We couldn\'t find any products matching your criteria. Try different keywords or browse all.'}
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="bg-primary hover:bg-primary-dark text-white font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">storefront</span>
                {lang === 'ar' ? 'تصفح كل المنتجات' : 'Browse All Products'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ p, dict, lang }: { p: any, dict: any, lang: string }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const isRtl = lang === 'ar';
  const name = p.name;
  
  // Same logic as ProductDetailsClient to determine sizes
  const isLiquid = name.toLowerCase().includes('oil') || name.toLowerCase().includes('زيت') || (p.slug && p.slug.includes('oil'));
  const availableSizes = isLiquid 
    ? (isRtl ? ['٢٥٠ مل', '٥٠٠ مل', '١ لتر'] : ['250ml', '500ml', '1L'])
    : (isRtl ? ['٢٥٠ جم', '٥٠٠ جم', '١ كجم'] : ['250g', '500g', '1kg']);
  
  const [selectedSize, setSelectedSize] = useState(availableSizes[0]); // Default to smallest size
  const [quantity, setQuantity] = useState(1);

  const getPriceMultiplier = (size: string) => {
    const idx = availableSizes.indexOf(size);
    if (idx === 0) return 0.6; // Small size is 60% of base price
    if (idx === 2) return 1.8; // Large size is 180% of base price
    return 1; // Default
  };

  const multiplier = getPriceMultiplier(selectedSize);
  // Round to nearest integer for clean display in EGP mostly
  const currentPrice = Math.round(parseFloat(p.price) * multiplier);
  const currentOriginalPrice = p.originalPrice ? Math.round(parseFloat(p.originalPrice) * multiplier) : null;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: `${p.id}-${selectedSize}`,
      name: p.name,
      price: currentPrice,
      image: p.img,
      quantity: quantity,
      size: selectedSize
    });
    router.push(`/${lang}/checkout`);
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-3xl p-4 shadow-sm border border-outline-variant/30 hover:border-primary/20 hover:shadow-xl transition-all duration-500">
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-surface-container-lowest mb-5 relative group-hover:shadow-[inset_0px_0px_20px_rgba(0,0,0,0.02)]">
        {p.badge && (
          <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10">
            <span className="bg-secondary text-on-secondary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
              {p.badge}
            </span>
          </div>
        )}
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
            alt={p.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={false}
          />
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] hidden md:flex">
             <button className="bg-white text-primary px-8 py-3.5 rounded-full font-bold shadow-2xl translate-y-6 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 pointer-events-none">{dict.common.quickView}</button>
          </div>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col px-2">
        <h3 className="font-serif text-2xl text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-1">{p.name}</h3>
        <p className="text-on-surface-variant text-sm line-clamp-2 mb-5 leading-relaxed">{p.desc}</p>
        
        <div className="mt-auto">
          {/* Size Selector */}
          <div className="flex flex-wrap gap-2 mb-5">
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex-1 py-2 text-xs font-bold transition-all rounded-xl border ${
                  selectedSize === size 
                    ? 'bg-primary text-white border-primary shadow-md' 
                    : 'bg-surface-container-lowest text-stone-500 border-stone-200 hover:border-primary/40 hover:bg-surface-container'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 gap-2">
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold theme-price-text mb-0.5 tracking-tight border-b-2 border-primary/20 inline-block w-fit leading-none pb-1">{currentPrice} {dict.common.currency}</span>
              {currentOriginalPrice && (
                <span className="text-xs font-bold text-stone-400 line-through decoration-error/50 decoration-2">{currentOriginalPrice} {dict.common.currency}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-surface-container border border-outline-variant/60 rounded-xl overflow-hidden h-[42px]">
                <button 
                  onClick={() => { if(quantity > 1) setQuantity(quantity - 1) }}
                  className="w-8 h-full flex items-center justify-center text-stone-600 hover:bg-stone-200 hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[16px]">remove</span>
                </button>
                <span className="w-6 text-center text-sm font-bold text-stone-800">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-full flex items-center justify-center text-stone-600 hover:bg-stone-200 hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>

              {/* AddToCartButton naturally handles quantity differently so I am passing a special prop or recreating standard add logic here since AddToCartButton doesn't accept quantity natively. Let's just create an Add to Cart button exactly mimicking AddToCartButton minus the component wrap, to inject the local quantity easily. */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  addItem({ id: `${p.id}-${selectedSize}`, name: p.name, price: currentPrice, image: p.img, quantity: quantity, size: selectedSize });
                  trackAddToCart({ id: p.id, name: p.name, price: currentPrice, quantity });
                }}
                className="bg-primary hover:bg-primary-dark text-on-primary px-5 h-[42px] rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm hover:shadow-md transition-all active:scale-95 group/btn"
              >
                <span className="material-symbols-outlined text-[20px] group-active/btn:scale-110 transition-transform">shopping_bag</span>
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleBuyNow}
            className="w-full mt-3 bg-secondary text-on-secondary hover:bg-secondary-dark py-3 rounded-2xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            {lang === 'ar' ? 'اشتري الآن' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
