import { getDictionary, Locale } from "@/lib/dictionary";
import CheckoutForm from "@/components/features/CheckoutForm";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function CheckoutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  // Fetch dynamic CMS shipping zones
  const shippingZones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' }
  });

  return (
    <main className="min-h-screen bg-surface pb-36 lg:pb-24">
      {/* Mini Header / Breadcrumb */}
      <div className="bg-surface-container-lowest border-b border-surface-container-high pt-36 pb-8 md:pt-40">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-sm">{dict.checkout.subtitle}</span>
            <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">{dict.checkout.title}</h1>
          </div>
          <nav className="flex text-sm text-stone-500 font-medium">
            <Link href={`/${lang}/shop`} className="hover:text-primary">{dict.nav.shop}</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-800">{dict.checkout.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-12">
        <CheckoutForm dict={dict} lang={lang} shippingZones={shippingZones} />
      </div>
    </main>
  );
}
