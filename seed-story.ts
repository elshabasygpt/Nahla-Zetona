import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const blocks = [
    { key: 'story_founder_image', ar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1000&auto=format&fit=crop', en: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1000&auto=format&fit=crop' },
    { key: 'story_founder_name', ar: 'مصطفى الإمام', en: 'Mostafa Al-Imam' },
    { key: 'story_founder_p1', ar: 'بدأت رحلة "نحلة وزيتونة" من إيمان عميق بأن الطبيعة تمتلك أفضل الإجابات لصحتنا. لقد كان هدفي دائماً هو استعادة الجودة العالية للمنتجات الطبيعية وإيصالها من المزرعة إلى مائدتك بكل أمانة وشفافية.', en: 'The journey of "Nahla & Zetona" began with a deep belief that nature holds the best answers for our health. My goal has always been to restore the high quality of natural products and deliver them from the farm to your table with absolute honesty and transparency.' },
    { key: 'story_founder_p2', ar: 'نختار بدقة فائقة كل قطرة عسل وكل ثمرة زيتون، لأننا لا نبيع منتجات وحسب، بل نُقدم لك خلاصة الطبيعة النقية التي تستحقها عائلتك.', en: 'We meticulously select every drop of honey and every olive, because we don’t just sell products; we offer you the essence of pure nature that your family deserves.' },
    { key: 'story_founder_quote', ar: 'الجودة ليست صدفة، بل مقياس للضمير والتفاني في العمل.', en: 'Quality is not a coincidence, it is a measure of conscience and dedication' },
  ];

  for (const b of blocks) {
    await prisma.contentBlock.upsert({
      where: { key: b.key },
      update: {},
      create: { key: b.key, contentAr: b.ar, contentEn: b.en }
    });
  }
  console.log('Story blocks seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
