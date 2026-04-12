import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  // Clear existing to avoid unique constraint failures on re-run
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.product.deleteMany()

  console.log('🌱 Seeding the database...')

  // Insert initial Mock Products
  const pt1 = await prisma.product.create({
    data: {
      nameAr: 'عسل السدر الجبلي',
      nameEn: 'Mountain Sidr Honey',
      slug: 'mountain-sidr-honey',
      descAr: 'عسل نقي من أعلى قمم الجبال، يأتيك بطعم أصيل وفوائد عظيمة تعزز من مناعتك اليومية.',
      descEn: 'Pure honey from the highest mountain peaks, offering an authentic taste and great benefits that boost your daily immunity.',
      price: 450,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH-1V6nvnTXR0SsevM8g243tXqbdq3yxifVJ000d_TsyUheVSPt1JBEeSUEjeNdtXwiykYtvPLsmVKBjFVOK_Fxe-Oguv2hVpkUJ4A4le6GoOeLLOSc-6weThcvSQJcjzq8ss450nze4WcIFt9CLISobDA3jB8A22sC3ejvuUSt9Xz0ZfypsINUaKB2bvgWEtTMhZvOnjnRUQM8VzZRsfhup_cqe7a29lXt7ZMFcUJhY3oXO8RyY2Wy2zbMFOQfhVzZpiOhEpJujU',
      badgeAr: 'الأكثر مبيعاً',
      badgeEn: 'Best Seller',
      isBundle: false,
    }
  })

  const pt2 = await prisma.product.create({
    data: {
      nameAr: 'زيت زيتون بكر ممتاز',
      nameEn: 'Extra Virgin Olive Oil',
      slug: 'extra-virgin-olive-oil',
      descAr: 'عصرة أولى على البارد تحافظ على كل الفيتامينات الأصلية، حموضة أقل من 0.8%.',
      descEn: 'Cold-pressed extra virgin olive oil preserving all original vitamins, acidity less than 0.8%.',
      price: 380,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUSFyP3qm3XYOBVyi6j-y9aebTDNNYSu8VtPN0dQO64ym0IRHr2DqXLlAnyE8ye_gMLDXyRH8UqosAU7bBVIMbC2MU_-tkyYQ29AxH0PWpGe44AoQyA01P7fuMOSTk7rseXof5bCu4lYcii1YHhzaC-QsC-QHEKPXrHFvLaxkDgdUTpucBA-JhFSmU6TVN7nIkD4seGUQwCEn-jHUFjCsRntPYtThhrtKfBcnN7LLSm8QJa_vEMRmkeZYCHjglAkejXRQJmFQAsTg',
      badgeAr: 'عضوي 100%',
      badgeEn: '100% Organic',
      isBundle: false,
    }
  })

  const pt3 = await prisma.product.create({
    data: {
      nameAr: 'باقة المناعة اليومية',
      nameEn: 'Daily Immunity Bundle',
      slug: 'daily-immunity-bundle',
      descAr: 'عرض التوفير! احصل على عبوتين من العسل الجبلي وعبوة من الزيت البكر بخصم حصري وتوصيل مجاني.',
      descEn: 'Savings Offer! Get two jars of mountain honey and one bottle of virgin oil with an exclusive discount and free shipping.',
      price: 1100,
      originalPrice: 1280,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-dBYTLE950i5ivwp0uoeTmJcnhi7vnC5zaw0Rr7rduDfeHmYjFQlDgbQBFgs1C1sdJFi-4gdx_oEnrefYyzc87XV4InV-3_AdgiBKMV-ARfNyW_YFskKoK_mcPCXtXzb5sdAqkXofCDDJOokDl05hPE2xj8OdtQ0-FDs-l7jwWvyUSFvB5yl_qAeW82j2SIwCEKEX9MmYjI4aFBcqBw4776sjGr2xmPMkSROPjanAPBIW9SXKIx-ZV8p3NactRax9JlU9sOqpS3I',
      badgeAr: 'وفر 180 ج.م',
      badgeEn: 'Save 180 LE',
      isBundle: true,
    }
  })

  console.log(`✅ Seeded ${3} products into the Database.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
