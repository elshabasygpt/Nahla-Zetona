'use client';
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Footer({ dict, lang, settings }: { dict: any, lang: string, settings?: any }) {
  const pathname = usePathname();
  if (pathname.includes('/admin')) return null;
  return (
    <footer className="bg-[#f4f3f1] dark:bg-stone-900 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-12 py-16 w-full max-w-7xl mx-auto">
        <div className="space-y-6">
          <span className={`text-xl ${lang === 'en' ? 'font-serif' : 'font-bold'} text-[#00511e]`}>{dict.common.brand}</span>
          <p className="text-stone-500 font-body text-sm tracking-wide leading-relaxed">
            {dict.footer.description}
          </p>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full bg-surface text-primary flex items-center justify-center hover:bg-secondary-container transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-surface text-primary flex items-center justify-center hover:bg-secondary-container transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">mail</span>
            </a>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="font-body text-sm tracking-wide uppercase font-bold text-[#00511e]">{dict.footer.quickLinks}</h4>
          <ul className="space-y-3 text-stone-400">
            <li><Link href={`/${lang}/shop`} className="hover:text-primary transition-colors">{dict.nav.shop}</Link></li>
            <li><Link href={`/${lang}/offers`} className="text-error hover:text-error/80 transition-colors">{dict.nav.offers}</Link></li>
            <li><Link href={`/${lang}/blog`} className="hover:text-primary transition-colors">{dict.nav.blog}</Link></li>
            <li><Link href={`/${lang}/our-story`} className="hover:text-primary transition-colors">{dict.nav.ourStory}</Link></li>
          </ul>
          <ul className="space-y-4 flex flex-col">
            <Link className="text-stone-500 font-body text-sm tracking-wide uppercase hover:underline decoration-[#7f5600] underline-offset-4 w-fit" href={`/${lang}/`}>{dict.footer.sustainability}</Link>
            <Link className="text-stone-500 font-body text-sm tracking-wide uppercase hover:underline decoration-[#7f5600] underline-offset-4 w-fit" href={`/${lang}/`}>{dict.footer.shippingPolicy}</Link>
            <Link className="text-stone-500 font-body text-sm tracking-wide uppercase hover:underline decoration-[#7f5600] underline-offset-4 w-fit" href={`/${lang}/`}>{dict.footer.labReports}</Link>
            <Link className="text-stone-500 font-body text-sm tracking-wide uppercase hover:underline decoration-[#7f5600] underline-offset-4 w-fit" href={`/${lang}/`}>{dict.footer.contactUs}</Link>
          </ul>
        </div>
        <div className="space-y-6">
          <h4 className="font-body text-sm tracking-wide uppercase font-bold text-[#00511e]">{dict.footer.ourPromise}</h4>
          <p className="text-stone-500 font-body text-sm tracking-wide">
            {dict.footer.promiseDesc}
          </p>
          <p className="text-stone-400 font-body text-xs mt-8">
            {dict.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
