'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';

export default function MobileBottomNav({ dict, lang, settings }: { dict: any, lang: string, settings?: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const { items, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle body scroll locking
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen, isSearchOpen]);

  // Search Logic
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
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
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

  if (pathname.includes('/admin')) return null;

  const rawPath = pathname.replace(`/${lang}`, '') || '/';
  const cartItemCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const getSwitchLang = () => lang === 'ar' ? '/en' : '/ar';

  const closeModals = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  return (
    <>
      {/* Search Fullscreen Modal */}
      <div className={`fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden flex justify-end flex-col ${isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closeModals}>
        <div className={`bg-white w-full h-[85vh] rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 transform ${isSearchOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-stone-100">
             <h3 className="font-bold text-lg text-stone-800">{lang === 'ar' ? 'البحث' : 'Search'}</h3>
             <button onClick={() => setIsSearchOpen(false)} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200">
               <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          
          <div className="p-4 border-b border-stone-100 shrink-0 relative bg-stone-50">
             <form onSubmit={handleSearch} className="w-full relative">
               <span className="material-symbols-outlined absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-stone-400">search</span>
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder={lang === 'ar' ? "ابحث عن العسل، زيت الزيتون..." : "Search for honey, olive oil..."}
                 className="w-full bg-white border border-stone-200 text-stone-800 rounded-2xl px-12 rtl:pr-12 rtl:pl-4 py-4 outline-none focus:border-primary transition-colors shadow-sm"
               />
               {isSearching && (
                 <span className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
               )}
             </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {!isSearching && searchResults.length === 0 && searchQuery.trim() !== '' && (
              <div className="py-12 text-center text-stone-400 flex flex-col items-center">
                <span className="material-symbols-outlined text-5xl mb-2 opacity-50">search_off</span>
                <p>{lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك.' : 'No matching results found.'}</p>
              </div>
            )}
            
            {searchResults.map((product) => (
              <Link 
                key={product.slug} 
                href={`/${lang}/shop/${product.slug}`}
                onClick={closeModals}
                className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-stone-100 hover:border-primary/30 transition-colors shadow-sm"
              >
                <div className="w-16 h-16 rounded-xl bg-stone-50 overflow-hidden flex items-center justify-center shrink-0">
                  {product.img ? (
                    <img src={product.img} alt={lang === 'ar' ? product.nameAr : product.nameEn} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-stone-300">image</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-800 truncate">{lang === 'ar' ? product.nameAr : product.nameEn}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary">{product.price.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                  </div>
                </div>
              </Link>
            ))}

            {searchResults.length > 0 && (
              <Link 
                href={`/${lang}/shop?q=${encodeURIComponent(searchQuery)}`}
                onClick={closeModals}
                className="w-full text-center py-4 text-primary font-bold bg-primary/5 rounded-2xl mt-4"
              >
                {lang === 'ar' ? `عرض كل نتائج (${searchQuery})` : `View all results for (${searchQuery})`}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Drawer Menu Fullscreen */}
      <div className={`fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden flex justify-start ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={closeModals}>
        <div className={`bg-white w-[85vw] max-w-[320px] h-full shadow-2xl flex flex-col transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}`} onClick={e => e.stopPropagation()}>
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 pb-8 border-b border-stone-100 bg-stone-50/50 flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-xl text-primary">{settings ? (lang === 'ar' ? settings.storeNameAr : settings.storeNameEn) : dict.nav?.brand}</span>
                <span className="text-sm text-stone-500">{lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 active:bg-stone-100 shadow-sm">
                 <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Menu Links */}
            <div className="flex flex-col p-4 gap-2">
              <Link onClick={closeModals} href={`/${lang}`} className={`px-4 py-4 rounded-xl font-bold flex items-center gap-4 ${rawPath === '/' ? 'bg-primary/10 text-primary' : 'text-stone-700 hover:bg-stone-50'}`}>
                <span className="material-symbols-outlined text-2xl">home</span> {dict.nav?.home}
              </Link>
              <Link onClick={closeModals} href={`/${lang}/shop`} className={`px-4 py-4 rounded-xl font-bold flex items-center gap-4 ${rawPath === '/shop' ? 'bg-primary/10 text-primary' : 'text-stone-700 hover:bg-stone-50'}`}>
                <span className="material-symbols-outlined text-2xl">store</span> {dict.nav?.shop}
              </Link>
              <Link onClick={closeModals} href={`/${lang}/offers`} className={`px-4 py-4 rounded-xl font-bold flex items-center gap-4 ${rawPath === '/offers' ? 'bg-error/10 text-error' : 'text-error hover:bg-red-50'}`}>
                <span className="material-symbols-outlined text-2xl">sell</span> {dict.nav?.offers}
              </Link>
              <div className="h-px w-full bg-stone-100 my-2"></div>
              <Link onClick={closeModals} href={`/${lang}/blog`} className={`px-4 py-4 rounded-xl font-bold flex items-center gap-4 ${rawPath === '/blog' ? 'bg-primary/10 text-primary' : 'text-stone-700 hover:bg-stone-50'}`}>
                <span className="material-symbols-outlined text-2xl">menu_book</span> {dict.nav?.blog}
              </Link>
              <Link onClick={closeModals} href={`/${lang}/our-story`} className={`px-4 py-4 rounded-xl font-bold flex items-center gap-4 ${rawPath === '/our-story' ? 'bg-primary/10 text-primary' : 'text-stone-700 hover:bg-stone-50'}`}>
                <span className="material-symbols-outlined text-2xl">info</span> {dict.nav?.ourStory}
              </Link>
              <Link onClick={closeModals} href={`/${lang}/contact`} className={`px-4 py-4 rounded-xl font-bold flex items-center gap-4 ${rawPath === '/contact' ? 'bg-primary/10 text-primary' : 'text-stone-700 hover:bg-stone-50'}`}>
                <span className="material-symbols-outlined text-2xl">contact_support</span> {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </Link>
              <div className="h-px w-full bg-stone-100 my-2"></div>
              <Link onClick={closeModals} href={`/${lang}/login`} className={`px-4 py-4 rounded-xl font-bold flex items-center gap-4 ${rawPath === '/login' ? 'bg-primary/10 text-primary' : 'text-stone-700 hover:bg-stone-50'}`}>
                <span className="material-symbols-outlined text-2xl">person</span> {lang === 'ar' ? 'حسابي' : 'My Account'}
              </Link>
            </div>
            
            {/* Footer / Switch Lang */}
            <div className="mt-auto p-6 bg-stone-50">
              <a href={getSwitchLang() + (rawPath === '/' ? '' : rawPath)} className="w-full px-4 py-4 rounded-2xl font-bold bg-white border border-stone-200 flex justify-center items-center text-stone-800 active:bg-stone-100 shadow-sm gap-2">
                <span className="material-symbols-outlined">translate</span>
                {lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-stone-200/80 pb-safe pb-[env(safe-area-inset-bottom,16px)] pt-2 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around">
          
          {/* Home */}
          <Link href={`/${lang}`} className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-colors ${rawPath === '/' && !isMenuOpen && !isSearchOpen ? 'text-primary font-bold' : 'text-stone-500 hover:text-stone-800'}`}>
            <span className="material-symbols-outlined text-[26px] mb-0.5" style={rawPath === '/' && !isMenuOpen && !isSearchOpen ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
            <span className="text-[10px] leading-none absolute bottom-1.5 opacity-0">الرئيسية</span>
          </Link>
          
          {/* Search */}
          <button onClick={() => setIsSearchOpen(true)} className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-colors ${isSearchOpen ? 'text-primary font-bold' : 'text-stone-500 hover:text-stone-800'}`}>
            <span className="material-symbols-outlined text-[26px] mb-0.5" style={isSearchOpen ? { fontVariationSettings: "'FILL' 1" } : {}}>search</span>
          </button>

          {/* Shop FAB (Floating Action Button style for center) */}
          <Link href={`/${lang}/shop`} className={`relative -top-5 flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_20px_rgba(var(--color-primary-rgb),0.3)] transition-transform active:scale-95 border-4 border-white ${rawPath === '/shop' ? 'bg-primary text-white scale-110' : 'bg-primary text-white'}`}>
            <span className="material-symbols-outlined text-[26px]">storefront</span>
          </Link>

          {/* Cart */}
          <button onClick={openCart} className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-colors text-stone-500 hover:text-stone-800`}>
            <span className="material-symbols-outlined text-[26px] mb-0.5">shopping_bag</span>
            {cartItemCount > 0 && (
              <span className="absolute top-1.5 right-2 sm:right-3 bg-secondary text-primary text-[10px] min-w-[20px] h-[20px] rounded-full flex items-center justify-center font-black border-2 border-white shadow-sm">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Menu */}
          <button onClick={() => setIsMenuOpen(true)} className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-colors ${isMenuOpen ? 'text-primary font-bold' : 'text-stone-500 hover:text-stone-800'}`}>
            <span className="material-symbols-outlined text-[26px] mb-0.5" style={isMenuOpen ? { fontVariationSettings: "'FILL' 1" } : {}}>menu</span>
          </button>

        </div>
      </div>
    </>
  );
}
