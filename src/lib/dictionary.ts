const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  ar: () => import('@/dictionaries/ar.json').then((module) => module.default),
};

export type Locale = 'en' | 'ar';

export const getDictionary = async (locale: Locale) => {
  if (typeof dictionaries[locale] !== 'function') {
    return dictionaries['en']();
  }
  return dictionaries[locale]();
};
