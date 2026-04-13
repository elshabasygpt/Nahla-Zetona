import { getDictionary } from '../dictionaries';
import { getSiteSettings } from '@/lib/settings';
import WishlistClient from './WishlistClient';

export default async function WishlistPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const dict = await getDictionary(lang as 'en' | 'ar');
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-stone-50/50">
      <WishlistClient dict={dict} lang={lang} />
    </div>
  );
}
