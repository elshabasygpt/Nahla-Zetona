import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const blocks = [
    { key: 'home_hero_title', ar: 'اكتشف جوهر الطبيعة المصرية', en: 'The Purest Egyptian Honey' },
    { key: 'home_hero_desc', ar: 'عسل نقي وزيت زيتون معصور على البارد من مزارعنا إليك.', en: 'Cold-pressed olive oil & raw honey directly from local farms.' },
    { key: 'home_hero_img', ar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMsZXXb2A56oE8hLq85T_1Fz6F6-EwI_z_m9R3-JjL3lM-K-kZ_F605hI7D7z_hXUa7j84O9IeP4c57oEa6aB92d-h9H_K-_oP2yK0cI1lFvEwJ3x4z18_A1Zc-iM8O-7Yp8E9hG7mQ5J0', en: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMsZXXb2A56oE8hLq85T_1Fz6F6-EwI_z_m9R3-JjL3lM-K-kZ_F605hI7D7z_hXUa7j84O9IeP4c57oEa6aB92d-h9H_K-_oP2yK0cI1lFvEwJ3x4z18_A1Zc-iM8O-7Yp8E9hG7mQ5J0' },
    
    { key: 'home_about_title', ar: 'من الطبيعة إليك', en: 'From Nature To You' },
    { key: 'home_about_desc', ar: 'نحن نؤمن بأهمية العودة إلى الجذور. كل قطرة عسل وكل زجاجة زيت هي نتاج شغف بالطبيعة والزراعة العضوية النظيفة.', en: 'We believe in returning to our roots. Every drop of honey and bottle of oil is the result of a passion for clean organic farming.' },
    { key: 'home_about_img', ar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqH-mYp4nHM9V4MbnF1K_P2muhKh3ZPeUi0w9uk1Do7iviy7UzQfpPlk3JhhF6knOstG129a_qPe2FtTmCsEe-4YSkR5QPo2j4De1egDZo1IJdzzjqqlMiVjA_RsQuga2lA7nA3_D8tVL-c25S2cpLvT5BIGOuC_kZyfaxs93hjwg_Q3F8h6Sys2iA_beEcLw8dX_L_7y7miChUVSlvG7kyHAhw8QVzz6AvByew5NWsuv5j9nygLdtRF9dPduQLY85CRt7W6sjpHk', en: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqH-mYp4nHM9V4MbnF1K_P2muhKh3ZPeUi0w9uk1Do7iviy7UzQfpPlk3JhhF6knOstG129a_qPe2FtTmCsEe-4YSkR5QPo2j4De1egDZo1IJdzzjqqlMiVjA_RsQuga2lA7nA3_D8tVL-c25S2cpLvT5BIGOuC_kZyfaxs93hjwg_Q3F8h6Sys2iA_beEcLw8dX_L_7y7miChUVSlvG7kyHAhw8QVzz6AvByew5NWsuv5j9nygLdtRF9dPduQLY85CRt7W6sjpHk' }
  ];

  for(const block of blocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: {},
      create: {
        key: block.key,
        contentAr: block.ar,
        contentEn: block.en
      }
    });
  }

  console.log('Content Blocks seeded successfully!');
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
