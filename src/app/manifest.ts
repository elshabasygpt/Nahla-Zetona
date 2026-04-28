import { MetadataRoute } from 'next'
import { prisma } from "@/lib/prisma"

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let settings;
  try {
    settings = await (prisma as any).siteSettings.findFirst();
  } catch (e) {
    console.error("Failed to fetch settings for manifest", e);
  }
  
  return {
    name: settings?.storeNameAr || 'نحلة وزيتونة',
    short_name: settings?.storeNameEn || 'Bee&Olive',
    description: 'Natural Honey & Premium Olive Oil Store',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9f6',
    theme_color: settings?.primaryColor || '#00511e',
    icons: [
      {
        src: settings?.logoUrl || '/og-default.jpg',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: settings?.logoUrl || '/og-default.jpg',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
