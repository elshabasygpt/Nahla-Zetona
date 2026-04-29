// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const localPrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres@localhost:5432/nahlazetona_db?schema=public' } }
});

const remotePrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_STAg58qLkIWv@ep-holy-mode-anulebkm.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require' } }
});

async function main() {
  console.log('Wiping remote database...');
  await remotePrisma.orderItem.deleteMany();
  await remotePrisma.order.deleteMany();
  await remotePrisma.review.deleteMany();
  await remotePrisma.product.deleteMany();
  await remotePrisma.category.deleteMany();
  await remotePrisma.article.deleteMany();
  await remotePrisma.contentBlock.deleteMany();
  await remotePrisma.siteSettings.deleteMany();

  console.log('Copying Categories...');
  const cats = await localPrisma.category.findMany();
  if (cats.length > 0) await remotePrisma.category.createMany({ data: cats });

  console.log('Copying Products...');
  const products = await localPrisma.product.findMany();
  if (products.length > 0) await remotePrisma.product.createMany({ data: products });

  console.log('Copying settings...');
  const settings = await localPrisma.siteSettings.findMany();
  if (settings.length > 0) await remotePrisma.siteSettings.createMany({ data: settings });

  console.log('Copying Content Blocks...');
  const blocks = await localPrisma.contentBlock.findMany();
  if (blocks.length > 0) await remotePrisma.contentBlock.createMany({ data: blocks });

  console.log('Copying Articles...');
  if (localPrisma.article) {
     const articles = await localPrisma.article.findMany();
     if (articles.length > 0) await remotePrisma.article.createMany({ data: articles });
  }

  console.log('Copying Reviews...');
  const reviews = await localPrisma.review.findMany();
  if (reviews.length > 0) await remotePrisma.review.createMany({ data: reviews });

  console.log('Done syncing all data!');
}

main().catch(console.error).finally(() => {
  localPrisma.$disconnect();
  remotePrisma.$disconnect();
});
