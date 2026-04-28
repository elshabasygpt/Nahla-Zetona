import { getDictionary } from '@/lib/dictionary';
import WishlistClient from './WishlistClient';

export default async function WishlistPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dict = await getDictionary(lang as 'en' | 'ar');

  return (
    <div className="min-h-screen bg-stone-50/50">
      <WishlistClient dict={dict} lang={lang} />
    </div>
  );
}
