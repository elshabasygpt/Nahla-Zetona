import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await (prisma as any).siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      storeNameAr: 'نحلة وزيتونة',
      storeNameEn: 'Bee & Olive',
      primaryColor: '#0f766e',
      secondaryColor: '#d97706',
      currencyAr: 'ج.م',
      currencyEn: 'EGP',
      whatsappNumber: '201000000000',
    }
  });

  await (prisma as any).shippingZone.createMany({
    skipDuplicates: true,
    data: [
      { nameAr: 'القاهرة والجيزة', nameEn: 'Cairo & Giza', cost: 50, deliveryDays: '2-3' },
      { nameAr: 'الإسكندرية', nameEn: 'Alexandria', cost: 70, deliveryDays: '3-4' },
      { nameAr: 'باقي المحافظات', nameEn: 'Other Governorates', cost: 100, deliveryDays: '4-7' },
    ]
  });

  await (prisma as any).promoCode.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discount: 10,
      isPercent: true,
      maxUses: 100,
    }
  });

  console.log('CMS seeded successfully!');
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
