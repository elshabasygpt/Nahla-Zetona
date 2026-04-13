'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroCarousel({ dict, lang }: { dict: any, lang: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = dict.slides || [];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[currentSlide];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#faf9f6] pt-20 pb-10">
      <style>{`
        @keyframes customFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes customFadeLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-hero-text {
          animation: customFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-hero-img {
          animation: customFadeLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Honeycomb Pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23d97706' fill-opacity='1' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d97706]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0 transition-colors duration-1000"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00511e]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 z-0 transition-colors duration-1000"></div>
      
      <div className="relative z-10 container mx-auto px-8 max-w-[1600px]">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          
          <div className="lg:w-1/2 space-y-10 lg:space-y-14" key={`text-${currentSlide}`}>
            <div className="animate-hero-text">
              <div className="inline-flex items-center gap-3 bg-surface-container px-6 py-3 rounded-full border border-outline-variant/30 text-base shadow-sm backdrop-blur-sm mb-8">
                <span className="w-3 h-3 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-bold text-primary tracking-wide">{slide.subtitle}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-[7rem] xl:text-[8rem] font-serif text-primary leading-[1.15] tracking-tight">
                {slide.title1} <br/> 
                <div className="flex items-center gap-4 md:gap-6 mt-2 md:mt-4">
                   <div className="h-1.5 w-16 md:h-2 md:w-24 bg-secondary hidden sm:block rounded-full"></div>
                   <span className="italic text-secondary font-light">{slide.title2}</span>
                </div>
              </h1>
            </div>
            
            <p className="text-lg md:text-2xl text-stone-600 font-body max-w-xl leading-relaxed animate-hero-text" style={{ animationDelay: '100ms' }}>
              {slide.desc}
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start gap-6 sm:gap-8 pt-4 sm:pt-6 animate-hero-text" style={{ animationDelay: '200ms' }}>
              <Link href={`/${lang}/shop`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto group relative bg-primary text-on-primary px-8 py-4 md:px-12 md:py-6 rounded-full font-bold text-lg md:text-xl overflow-hidden shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-4 active:scale-95">
                  <span>{dict.btnShop}</span>
                  <span className="material-symbols-outlined rtl:-scale-x-100 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform text-xl md:text-2xl">arrow_forward</span>
                </button>
              </Link>
              <Link href={`/${lang}/our-story`}>
                <button className="text-stone-600 font-bold text-lg md:text-xl hover:text-primary transition-colors flex items-center gap-3 group px-4 py-2">
                  <span className="border-b-2 border-transparent group-hover:border-primary pb-1 md:pb-2 transition-all">{dict.btnProcess}</span>
                </button>
              </Link>
            </div>

            {/* Slider Navigation */}
            <div className="flex items-center justify-between pt-10 mt-6 border-t border-outline-variant/30 animate-hero-text" style={{ animationDelay: '300ms' }}>
               <div className="flex items-center gap-4">
                 <button onClick={() => setCurrentSlide((s) => (s - 1 + slides.length) % slides.length)} className="w-16 h-16 rounded-full border-2 border-outline-variant/40 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors text-2xl">
                   <span className="material-symbols-outlined rtl:-scale-x-100">chevron_left</span>
                 </button>
                 <button onClick={() => setCurrentSlide((s) => (s + 1) % slides.length)} className="w-16 h-16 rounded-full border-2 border-outline-variant/40 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors text-2xl">
                   <span className="material-symbols-outlined rtl:-scale-x-100">chevron_right</span>
                 </button>
               </div>
               
               <div className="flex gap-3">
                  {slides.map((_: any, i: number) => (
                    <button key={i} onClick={() => setCurrentSlide(i)} className={`h-3 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-14 bg-secondary' : 'w-4 bg-stone-300 hover:bg-stone-400'}`}></button>
                  ))}
               </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full relative h-[320px] sm:h-[400px] md:h-[600px] xl:h-[800px] flex items-center justify-center -mt-4 md:mt-0" key={`img-${currentSlide}`}>
             <div className="relative w-[90%] sm:w-[85%] h-[90%] md:w-full md:h-full aspect-square max-w-[800px] mx-auto z-10 pt-4 md:pt-10 lg:pt-0 animate-hero-img">
               {/* Main Image */}
               <div className="absolute inset-0 rounded-[2.5rem] md:rounded-[4rem] xl:rounded-[6rem] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] md:shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-[8px] md:border-[12px] border-surface-container-lowest transition-transform duration-700 bg-surface">
                 <img 
                   className="w-full h-full object-cover" 
                   src={slide.mainImage}
                   alt={slide.title2} 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent"></div>
               </div>
               
               {/* Floating element 1 */}
               <div className="hidden md:block absolute -bottom-16 -left-16 rtl:-left-auto rtl:-right-16 w-72 h-72 xl:w-96 xl:h-96 rounded-full overflow-hidden shadow-2xl border-[12px] border-surface-container-lowest animate-[bounce_8s_ease-in-out_infinite] z-20">
                  <img 
                    className="w-full h-full object-cover"
                    src={slide.floatingImage}
                    alt="Floating detail"
                  />
               </div>

               {/* Floating element 2: Trust Card */}
               <div className="absolute top-4 md:top-24 -right-2 md:-right-12 rtl:-right-auto rtl:right-auto rtl:-left-2 md:rtl:-left-12 bg-surface/95 backdrop-blur-2xl p-3 md:p-8 rounded-2xl md:rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.1)] border border-outline-variant/30 flex items-center gap-2 md:gap-6 z-20 animate-[bounce_6s_ease-in-out_infinite_reverse] scale-[0.65] md:scale-100 origin-top-right rtl:origin-top-left">
                 <div className="w-10 h-10 md:w-20 md:h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-xl md:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                 </div>
                 <div>
                   <span className="block font-black text-xl md:text-4xl text-primary mb-0 md:mb-1">{slide.badgeText}</span>
                   <span className="text-[9px] md:text-sm text-stone-500 font-bold uppercase tracking-widest">{slide.badgeSub}</span>
                 </div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
