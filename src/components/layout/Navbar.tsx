'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';

export default function Navbar({ dict, lang, settings }: { dict: any, lang: string, settings?: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const { items, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Failed to fetch search results", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${lang}/shop?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname.includes('/admin')) return null;
  
  const cartItemCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const [animateCart, setAnimateCart] = useState(false);

  useEffect(() => {
    if (cartItemCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  // Helper to get raw path without locale prefix
  const rawPath = pathname.replace(`/${lang}`, '') || '/';

  const getLinkClasses = (path: string) => {
    if (rawPath === path) {
      return "bg-primary !text-white px-6 py-2 rounded-full font-bold shadow-sm transition-all duration-300";
    }
    return "text-stone-700 font-bold px-4 py-2 hover:text-primary hover:bg-stone-200/50 rounded-full transition-all duration-300";
  };

  const getSwitchLang = () => lang === 'ar' ? '/en' : '/ar';

  return (
    <div className="sticky top-0 left-0 right-0 z-50 pointer-events-none fade-in-up">
      <nav className="mx-auto w-full md:w-max md:max-w-[95vw] lg:max-w-7xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-b md:border border-stone-200/50 dark:border-stone-800/50 md:rounded-full pointer-events-auto transition-all duration-500 shadow-sm md:shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:mt-6">
        <div className="flex justify-between items-center px-4 md:px-6 py-3.5 gap-4 xl:gap-8 overflow-x-hidden w-full relative">
          
          {/* Mobile Only: Left Icon (Notifications) */}
          <div className="md:hidden w-1/3 flex justify-start">
            <button className="w-10 h-10 flex items-center justify-center text-stone-600 active:scale-95 transition-transform relative bg-stone-50 rounded-full">
              <span className="material-symbols-outlined text-[24px] font-light">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full outline outline-2 outline-white"></span>
            </button>
          </div>

          {/* Logo & Brand */}
          <div className="md:w-auto w-1/3 flex justify-center md:justify-start">
            <Link href={`/${lang}`} className="flex items-center gap-3 group shrink-0">
              <div className="relative w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary group-hover:scale-105 transition-transform overflow-hidden">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  /* High Quality Inline SVG Logo fallback */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".3"/>
                     <path d="M14 10h-4v4h4v-4zm-2 2h-2v2h2v-2zm4-6H8v2h8V6zm0 10H8v2h8v-2z" fill="#d97706"/>
                     <path d="M6 10h2v4H6zM16 10h2v4h-2z" fill="#00511e"/>
                  </svg>
                )}
              </div>
              <span className={`text-xl relative top-0.5 ${lang === 'en' ? 'font-serif italic' : 'font-bold'} text-primary tracking-tight hidden lg:block`}>
                {settings ? (lang === 'ar' ? settings.storeNameAr : settings.storeNameEn) : (dict.nav.brand || dict.common.brand)}
              </span>
            </Link>
          </div>

          {/* Mobile Only: Right Icon (Favorites) */}
          <div className="md:hidden w-1/3 flex justify-end">
            <Link href={`/${lang}/shop`} className="w-10 h-10 flex items-center justify-center text-stone-600 active:scale-95 transition-transform bg-stone-50 rounded-full">
              <span className="material-symbols-outlined text-[24px] font-light">favorite</span>
            </Link>
          </div>

          {/* Desktop Links (Visible on XL only to prevent overlap) */}
          <div className="hidden xl:flex items-center gap-1 text-[15px] bg-stone-100/80 p-1.5 rounded-full border border-stone-200/80 shrink-0">
            <Link href={`/${lang}`} className={getLinkClasses('/')}>{dict.nav.home}</Link>
            <Link href={`/${lang}/shop`} className={getLinkClasses('/shop')}>{dict.nav.shop}</Link>
            <Link href={`/${lang}/offers`} className={rawPath === '/offers' ? "bg-error text-white px-6 py-2 rounded-full font-bold shadow-sm transition-all duration-300" : "text-error font-bold px-4 py-2 hover:bg-error/10 rounded-full transition-all duration-300"}>{dict.nav.offers}</Link>
            <Link href={`/${lang}/blog`} className={getLinkClasses('/blog')}>{dict.nav.blog}</Link>
            <Link href={`/${lang}/our-story`} className={getLinkClasses('/our-story')}>{dict.nav.ourStory}</Link>
            <Link href={`/${lang}/contact`} className={getLinkClasses('/contact')}>{lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}</Link>
          </div>

          {/* Actions - Desktop & Tablet Only (hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Expanding Search Container */}
            <div className="relative">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors z-50 relative ${isSearchOpen ? 'bg-primary text-white' : 'text-stone-500 hover:bg-stone-100 hover:text-primary bg-transparent'}`}
              >
                <span className="material-symbols-outlined text-xl">{isSearchOpen ? 'close' : 'search'}</span>
              </button>
            </div>
            
            <a href={getSwitchLang() + (rawPath === '/' ? '' : rawPath)} className="text-xs font-bold border-2 border-stone-200 text-stone-600 rounded-full px-3 py-1.5 hover:bg-stone-100 transition-colors">
              {lang === 'ar' ? 'EN' : 'عربي'}
            </a>
            
            <Link href={`/${lang}/login`} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">person</span>
            </Link>

            <button onClick={openCart} className={`relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-95 group ${animateCart ? 'scale-110 bg-primary text-white shadow-lg shadow-primary/20' : ''}`}>
              <span className="material-symbols-outlined text-xl">shopping_bag</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-primary text-[10px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Tablet Menu Toggle (hidden on Desktop xl and hidden on Mobile md) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 hover:text-primary transition-colors ml-2 rtl:ml-0 rtl:mr-2"
            >
              <span className="material-symbols-outlined text-xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>


        </div>

        {/* Search Dropdown */}
        <div className={`absolute top-full left-0 right-0 mt-2 px-4 transition-all duration-300 pointer-events-auto ${isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="mx-auto max-w-2xl bg-white rounded-2xl shadow-xl border border-stone-100 p-2 overflow-hidden flex flex-col">
            <form onSubmit={handleSearch} className="w-full relative shrink-0">
              <span className="material-symbols-outlined absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-stone-400">search</span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? "ابحث عن العسل، زيت الزيتون..." : "Search for honey, olive oil..."}
                className="w-full bg-stone-50 text-stone-800 rounded-xl px-12 rtl:pr-12 rtl:pl-4 py-3 outline-none focus:bg-stone-100 transition-colors"
                autoFocus={isSearchOpen}
              />
              {isSearching && (
                <span className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              )}
            </form>

            {/* View All Details */}
            {searchResults.length > 0 && isSearchOpen && searchQuery && (
              <div className="mt-2 border-t border-stone-100 pt-2 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-y-auto max-h-[60vh] bg-stone-50/50 rounded-xl">
                 {searchResults.map((product) => (
                   <Link 
                     key={product.slug} 
                     href={`/${lang}/shop/${product.slug}`}
                     onClick={() => setIsSearchOpen(false)}
                     className="flex items-center gap-3 p-3 hover:bg-stone-100 border-b border-r rtl:border-r-0 rtl:border-l border-stone-100 last:border-b-0 transition-colors group"
                   >
                     <div className="w-16 h-16 rounded-xl bg-white shrink-0 overflow-hidden border border-stone-200 p-1 flex items-center justify-center relative">
                        {product.img ? (
                          <img src={product.img} alt={lang === 'ar' ? product.nameAr : product.nameEn} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                        ) : (
                          <span className="material-symbols-outlined text-stone-300">image</span>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-stone-800 truncate">{lang === 'ar' ? product.nameAr : product.nameEn}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="font-bold theme-price-text text-sm">{product.price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                           {product.originalPrice && (
                             <span className="text-xs text-stone-400 line-through">{product.originalPrice.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                           )}
                        </div>
                     </div>
                   </Link>
                 ))}
                 
                 {/* View All Footer */}
                 <div className="col-span-full border-t border-stone-100 p-2">
                    <Link 
                      href={`/${lang}/shop?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="block w-full text-center text-sm font-bold text-primary hover:text-secondary p-2 transition-colors"
                    >
                      {lang === 'ar' ? `عرض كل نتائج (${searchQuery})` : `View all results for (${searchQuery})`}
                    </Link>
                 </div>
              </div>
            )}

            {/* No Results found */}
            {!isSearching && searchResults.length === 0 && searchQuery.trim() !== '' && isSearchOpen && (
              <div className="p-6 text-center text-stone-500 text-sm">
                {lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك.' : 'No matching results found.'}
              </div>
            )}
          </div>
        </div>

        {/* Tablet Dropdown Menu (Hidden on Mobile and hidden on Desktop) */}
        <div className={`hidden md:block xl:hidden transition-all duration-300 ease-in-out overflow-hidden shadow-inner ${isMobileMenuOpen ? 'max-h-[400px] opacity-100 border-t border-stone-200/50' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-2 p-4 bg-stone-50/50 rounded-b-3xl">
            <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${lang}`} className={`px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${rawPath === '/' ? 'bg-primary !text-white' : 'text-stone-700 hover:bg-stone-200'}`}>
              <span className="material-symbols-outlined text-xl">home</span> {dict.nav.home}
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${lang}/shop`} className={`px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${rawPath === '/shop' ? 'bg-primary !text-white' : 'text-stone-700 hover:bg-stone-200'}`}>
              <span className="material-symbols-outlined text-xl">store</span> {dict.nav.shop}
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${lang}/offers`} className={`px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${rawPath === '/offers' ? 'bg-error !text-white' : 'text-error hover:bg-error/10'}`}>
              <span className="material-symbols-outlined text-xl">sell</span> {dict.nav.offers}
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${lang}/blog`} className={`px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${rawPath === '/blog' ? 'bg-primary !text-white' : 'text-stone-700 hover:bg-stone-200'}`}>
              <span className="material-symbols-outlined text-xl">menu_book</span> {dict.nav.blog}
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${lang}/our-story`} className={`px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${rawPath === '/our-story' ? 'bg-primary !text-white' : 'text-stone-700 hover:bg-stone-200'}`}>
              <span className="material-symbols-outlined text-xl">info</span> {dict.nav.ourStory}
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} href={`/${lang}/contact`} className={`px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${rawPath === '/contact' ? 'bg-primary !text-white' : 'text-stone-700 hover:bg-stone-200'}`}>
              <span className="material-symbols-outlined text-xl">contact_support</span> {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
