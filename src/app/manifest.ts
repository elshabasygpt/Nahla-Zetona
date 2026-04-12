import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'نحلة وزيتونة | Bee & Olive',
    short_name: 'نحلة وزيتونة',
    description: 'عسل طبيعي وزيت زيتون بكر ممتاز من أجود المصادر المصرية',
    start_url: '/ar',
    display: 'standalone',
    background_color: '#faf9f6',
    theme_color: '#00511e',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['shopping', 'food', 'lifestyle'],
    lang: 'ar',
    dir: 'rtl',
  };
}
